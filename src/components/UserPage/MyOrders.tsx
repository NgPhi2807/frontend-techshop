import React, { useState, useEffect, useCallback } from "react";
import { fetchMyOrders } from "../../api/myorderApi";
import { useAuthStore } from "../../stores/authStore1";

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

// ---  & Helpers ---
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

const STATUS_MAP: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  RETURNED: "Trả hàng",
  CONFIRMED: "Đã xác nhận",
  REFUSED: "Từ chối",
  "Chờ xử lý": "Chờ xử lý",
};

const TAB_STATUSES = ["ALL", "PENDING", "DELIVERING", "COMPLETED", "CANCELLED"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Math.max(0, amount));

// --- Sub-Component: OrderItem ---
const OrderItem: React.FC<{ order: Order }> = ({ order }) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-5 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center text-sm text-gray-500 border-b border-dashed pb-3 mb-3">
        <span>
          <span className="font-semibold text-gray-700 mr-2">#{order.id}</span> •
          {orderDate} • {order.receiveMethod} • {order.items.length} sản phẩm
        </span>
        <span className="text-red-600 font-semibold flex items-center">
          <span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>
          {STATUS_MAP[order.status] || order.status}
        </span>
      </div>

      {order.items.map((item) => {
        const salePrice = item.quantity > 0 ? item.subtotal / item.quantity : item.price;
        return (
          <div key={item.id} className="flex gap-4 py-3 items-start">
            <div className="rounded-lg w-16 h-16 border bg-white flex justify-center items-center overflow-hidden shadow-sm">
              <img src={`${IMAGE_BASE_URL}${item.thumbnail}`} alt={item.name} className="w-12 h-12 object-cover" />
            </div>
            <div className="flex-grow">
              <p className="font-medium text-gray-800 line-clamp-2">{item.name}</p>
              <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
            </div>
            <div className="text-right">
              {item.price > salePrice && <p className="text-sm text-gray-400 line-through">{formatCurrency(item.price)}</p>}
              <p className="text-red-600 font-semibold">{formatCurrency(salePrice)}</p>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between items-center pt-4 mt-3 border-t border-gray-100">
        <div className="font-medium">
          <span>Thành tiền:</span> <span className="text-red-600 font-bold">{formatCurrency(order.totalAmount)}</span>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-1 rounded-full transition">Hỗ trợ</button>
      </div>
    </div>
  );
};

// --- Main Component ---
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
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, pagination.page, pagination.size, orderStatus]);

  useEffect(() => {
    if (accessToken) loadData();
  }, [loadData, accessToken]);

  // Tìm kiếm đơn hàng tại client
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
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">Đơn hàng của tôi</h1>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Tìm theo ID, tên hoặc mã sản phẩm..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-full px-5 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto mb-6 bg-white sticky top-0 z-10">
        {TAB_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => handleTabChange(status)}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${orderStatus === status ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-red-500"
              }`}
          >
            {STATUS_MAP[status]}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-10 bg-red-50 rounded-lg">{error}</p>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(o => <OrderItem key={o.id} order={o} />)
        ) : (
          <div className="text-center py-20 text-gray-500 bg-white rounded-lg border border-dashed">
            {inputSearch ? `Không tìm thấy kết quả cho "${inputSearch}"` : "Bạn chưa có đơn hàng nào."}
          </div>
        )}
      </div>

      {!inputSearch && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
          >
            Trang trước
          </button>
          <span className="font-medium text-gray-600">Trang {pagination.page} / {pagination.totalPages}</span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;