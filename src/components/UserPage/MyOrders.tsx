import React, { useState, useEffect, useCallback } from "react";
import { fetchMyOrders } from "../../api/myorderApi";
import { useAuthStore } from "../../stores/authStore1";

// --- Interfaces ---
export interface Attribute { code: string; label: string; value: string; }

export interface OrderItemProduct {
  id: number;
  name: string;
  sku: string;
  thumbnail: string;
  price: number;
  specialPrice: number;
  quantity: number;
  subtotal: number;
  attributes: Attribute[];
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  receiveMethod: string;
  items: OrderItemProduct[];
}

export interface OrderResponseData {
  page: number;
  items: Order[];
  size: number;
  totalElements: number;
  totalPages: number;
}

// --- Constants & Helpers ---
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

const STATUS_MAP: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận", // Đã thêm
  DELIVERING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  FAILED: "Giao thất bại",  // Đã thêm
  RETURNED: "Trả hàng",
  REFUSED: "Từ chối nhận",
};

// Cập nhật danh sách Tabs theo luồng đơn hàng
const TAB_STATUSES = [
  "ALL",
  "PENDING",
  "CONFIRMED", // Đã thêm
  "DELIVERING",
  "COMPLETED",
  "FAILED",    // Đã thêm
  "CANCELLED"
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Math.max(0, amount));

// Helper: Màu sắc cho trạng thái
const getStatusStyle = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "text-green-600 bg-green-50 border-green-200";
    case "DELIVERING":
    case "CONFIRMED":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "PENDING":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "CANCELLED":
    case "FAILED":
    case "REFUSED":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

// --- Sub-Component: OrderItem ---
const OrderItem: React.FC<{ order: Order }> = ({ order }) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");
  const statusStyle = getStatusStyle(order.status);

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-5 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 border-b border-dashed pb-3 mb-3 gap-2">
        <span>
          <span className="font-bold text-gray-800 mr-2">Đơn hàng #{order.id}</span>
          <span className="hidden sm:inline mx-1">•</span>
          <span className="block sm:inline">{orderDate} • {order.receiveMethod}</span>
        </span>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle} flex items-center`}>
          {STATUS_MAP[order.status] || order.status}
        </span>
      </div>

      {order.items.map((item) => {
        const salePrice = item.quantity > 0 ? item.subtotal / item.quantity : item.price;
        return (
          <div key={item.id} className="flex gap-4 py-3 items-start border-b last:border-0 border-gray-50">
            <div className="rounded-lg w-16 h-16 border bg-gray-50 flex-shrink-0 flex justify-center items-center overflow-hidden">
              <img
                src={`${IMAGE_BASE_URL}${item.thumbnail}`}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64'; }}
              />
            </div>
            <div className="flex-grow">
              <p className="font-medium text-gray-800 line-clamp-2 text-sm md:text-base">{item.name}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.attributes?.map((attr, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {attr.value}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">x{item.quantity}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {item.price > salePrice && <p className="text-xs text-gray-400 line-through">{formatCurrency(item.price)}</p>}
              <p className="text-red-600 font-semibold text-sm md:text-base">{formatCurrency(salePrice)}</p>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between items-center pt-4 mt-1 bg-gray-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg border-t border-gray-100">
        <div className="text-sm">
          <span className="text-gray-600">Tổng tiền:</span>
          <span className="text-red-600 font-bold text-lg ml-2">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex gap-2">
          {order.status === 'PENDING' && (
            <button className="text-gray-500 hover:text-red-600 text-sm font-medium px-3 py-1">Hủy đơn</button>
          )}
          <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded shadow-sm transition">
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

const MyOrders: React.FC = () => {
  const { accessToken, checkAuthStatus } = useAuthStore();
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 10, totalPages: 1 });
  const [orderStatus, setOrderStatus] = useState("ALL");
  const [inputSearch, setInputSearch] = useState("");
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMyOrders(accessToken, pagination.page, pagination.size, orderStatus);
      const data: OrderResponseData = response.data;
      setApiOrders(data.items);
      setPagination(p => ({ ...p, totalPages: data.totalPages }));
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, pagination.page, pagination.size, orderStatus]);

  useEffect(() => {
    if (accessToken) loadData();
  }, [loadData, accessToken]);

  useEffect(() => {
    const term = inputSearch.trim().toLowerCase();
    if (!term) {
      setFilteredOrders(apiOrders);
      return;
    }
    const filtered = apiOrders.filter(order =>
      order.id.toString().includes(term) ||
      order.items.some(i => i.name.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term))
    );
    setFilteredOrders(filtered);
  }, [apiOrders, inputSearch]);

  const handleTabChange = (status: string) => {
    setOrderStatus(status);
    setPagination(p => ({ ...p, page: 1 }));
    setInputSearch("");
  };

  if (!accessToken && !loading) {
    return <div className="p-10 text-center text-gray-500">Vui lòng đăng nhập để xem đơn hàng.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">Đơn hàng của tôi</h1>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Tìm theo ID đơn hàng, tên sản phẩm..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto mb-6 bg-white sticky top-0 z-10 no-scrollbar">
        {TAB_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => handleTabChange(status)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${orderStatus === status
              ? "text-red-600 border-red-600 bg-red-50"
              : "text-gray-500 border-transparent hover:text-red-500 hover:border-gray-300"
              }`}
          >
            {STATUS_MAP[status]}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600"></div>
            <p className="mt-4 text-gray-500 text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={loadData} className="mt-3 text-sm underline text-red-700 hover:text-red-800">Thử lại</button>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(o => <OrderItem key={o.id} order={o} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            <p>{inputSearch ? `Không tìm thấy đơn hàng nào khớp với "${inputSearch}"` : "Bạn chưa có đơn hàng nào ở trạng thái này."}</p>
          </div>
        )}
      </div>

      {!loading && !inputSearch && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            &laquo; Trang trước
          </button>
          <span className="text-sm font-medium text-gray-700">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Trang sau &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;