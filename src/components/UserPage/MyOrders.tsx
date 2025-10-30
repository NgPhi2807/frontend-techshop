import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// --- 1. Định nghĩa Kiểu Dữ Liệu ---
interface Attribute { code: string; label: string; value: string; }
interface OrderItemProduct { id: number; name: string; sku: string; thumbnail: string; price: number; specialPrice: number; quantity: number; subtotal: number; attributes: Attribute[]; }
interface Order { id: number; status: string; totalAmount: number; createdAt: string; receiveMethod: string; items: OrderItemProduct[]; }
interface OrderResponseData { page: number; items: Order[]; size: number; totalElements: number; totalPages: number; }
interface ApiResponse<T> { code: number; timestamp: string; data: T; }
interface PaginationState { page: number; size: number; totalPages: number; }

// --- 2. Constants ---
const API_BASE_URL = "http://localhost:8080/api/customer/my-order";
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL; 
const TOKEN_STORAGE_KEY = "accessToken";

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
const TAB_STATUSES = ["ALL", "PENDING", "DELIVERING", "COMPLETED", "CANCELLED", "RETURNED"];

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Math.max(0, amount));

// --- 3. OrderItem Component (Giữ nguyên) ---
interface OrderItemProps { order: Order; }
const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");
  const finalPrice = order.totalAmount;

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
        const imageUrl = `${IMAGE_BASE_URL}${item.thumbnail}`;
        const colorAttr = item.attributes?.find((a) => a.code === "color");
        const salePrice = item.quantity > 0 ? item.subtotal / item.quantity : item.price; 

        return (
          <div key={item.id} className="flex gap-4 py-3 items-start ">
            <div className="rounded-lg w-16 h-16 border bg-white shadow-xl justify-center items-center flex">
              <img src={imageUrl} alt={item.name} className="w-12 h-12 object-cover " />
            </div>
            <div className="flex-grow">
              <p className="font-medium text-gray-800 line-clamp-2">{item.name}</p>
              {colorAttr && <p className="text-xs text-gray-400 mt-1">Màu: {colorAttr.value}</p>}
              <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
              {/* <button className="text-sm text-blue-600 hover:underline mt-1">Xem chi tiết</button> */}
            </div>
            <div className="text-right">
              {item.price > salePrice && <p className="text-sm text-gray-400 line-through">{formatCurrency(item.price)}</p>}
              <p className="text-red-600 font-semibold">{formatCurrency(salePrice)}</p>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between items-center text-base pt-4 mt-3 border-t border-gray-100">
        <div className="font-medium">
          <span>Thành tiền:</span>{" "}
          <span className="text-red-600 font-bold">{formatCurrency(finalPrice)}</span>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1 rounded-full ">
          Hỗ trợ
        </button>
      </div>
    </div>
  );
};

// --- 4. MyOrders Component ---
const MyOrders: React.FC = () => {
  const [apiOrders, setApiOrders] = useState<Order[]>([]); 
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]); 
  
  // 🔑 ĐẶT MẶC ĐỊNH LÀ TRUE để hiển thị loading lần đầu
  const [loading, setLoading] = useState(true); 
  
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, size: 10, totalPages: 1 });
  const [orderStatus, setOrderStatus] = useState("ALL");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [inputSearch, setInputSearch] = useState(""); 
  
  // 1. Lấy Access Token từ localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        setAccessToken(token);
    }
    else {
        setError("Không tìm thấy Access Token. Vui lòng đăng nhập.");
        setLoading(false); // 🔑 Tắt loading nếu không có token
    }
  }, []);

  // 2. Hàm Fetch Orders (Chỉ lấy dữ liệu, không có search param)
  const fetchOrders = useCallback(async (page: number, status: string) => {
    if (!accessToken) {
        setLoading(false); 
        return;
    }

    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams({
      page: page.toString(),
      size: pagination.size.toString(),
    });

    if (status !== "ALL") params.append("orderStatus", status);

    try {
      const res = await axios.get<ApiResponse<OrderResponseData>>(`${API_BASE_URL}?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = res.data.data;
      
      setApiOrders(data.items); 
      setPagination({ page: data.page, size: data.size, totalPages: data.totalPages }); 

    } catch (err: any) {
      setError("Không thể tải danh sách đơn hàng.");
      setApiOrders([]);
      setPagination({ page: 1, size: 10, totalPages: 1 });
    } finally {
      setLoading(false); // 🔑 Tắt loading khi fetch xong
    }
  }, [accessToken, pagination.size]); 


  // 3. Logic Lọc trên Client (Chạy khi apiOrders hoặc inputSearch thay đổi)
  useEffect(() => {
    if (!inputSearch.trim()) {
      setFilteredOrders(apiOrders);
      return;
    }
    
    const searchTerm = inputSearch.trim().toLowerCase();
    const numericSearch = parseInt(searchTerm);
    const isIDSearch = !isNaN(numericSearch) && searchTerm.length > 0;
    
    const filtered = apiOrders.filter(order => {
        // Lọc theo ID chính xác
        if (isIDSearch && order.id === numericSearch) {
          return true;
        }

        // Lọc theo Tên sản phẩm (name) hoặc SKU/Mã (sku)
        const itemMatch = order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm) || 
          item.sku.toLowerCase().includes(searchTerm)
        );

        // Lọc theo Mã đơn hàng
        const orderIdMatch = order.id.toString().includes(searchTerm);

        return itemMatch || orderIdMatch;
    });

    setFilteredOrders(filtered);
    
  }, [apiOrders, inputSearch]); 

  // 4. Effect để gọi API (Chạy khi tab, page thay đổi)
  useEffect(() => {
    if (!accessToken) return;
    
    // Nếu đang tìm kiếm, ta không gọi lại API khi inputSearch thay đổi 
    if (inputSearch.trim()) {
        return; 
    }

    fetchOrders(pagination.page, orderStatus);

  }, [fetchOrders, orderStatus, pagination.page, accessToken, inputSearch]);

  useEffect(() => {
    if (inputSearch.trim()) {
        setPagination(p => ({ ...p, page: 1 }));
    }
  }, [inputSearch]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputSearch(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleTabChange = (status: string) => {
    setOrderStatus(status);
    setInputSearch("");
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (!inputSearch.trim()) {
      setPagination((p) => ({ ...p, page: newPage }));
    }
  };

  const isSearching = !!inputSearch.trim();

  return (
    <div className="">
      <div className="">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 border-b border-indigo-100 pb-2">
          <h1 className="text-base md:text-2xl font-extrabold text-[#222]">
            Đơn hàng của tôi
          </h1>
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-[380px]">
            <input
              type="text"
              placeholder="Tìm theo ID, mã đơn hoặc tên sản phẩm"
              value={inputSearch}
              onChange={handleInputChange} 
              className="w-full bg-white rounded-full border border-gray-200 pl-4 pr-10 py-2 text-sm shadow-sm text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </button>
          </form>
        </div>

        <div className=" bg-white rounded-t-xl border border-gray-200 flex justify-between md:justify-start overflow-x-auto my-4">
          {TAB_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => handleTabChange(status)}
              className={`relative px-10 py-4 text-sm md:text-[15px] font-medium transition-all whitespace-nowrap ${
                orderStatus === status
                  ? "text-[#ee4d2d] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#ee4d2d]"
                  : "text-gray-600 hover:text-[#ee4d2d]"
              }`}
            >
              {STATUS_MAP[status] || status}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          {error && <p className="text-center text-red-600 bg-red-50 py-4 rounded-lg">{error}</p>}
          {!error && loading && (
            <div className="flex flex-col items-center justify-center p-16">
              <div
                className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"
              >
              </div>
              <p className="mt-4 text-gray-700">Đang tải danh sách đơn hàng</p>
            </div>
          )}
          
          {!loading && !error && filteredOrders.length > 0 && filteredOrders.map((o) => <OrderItem key={o.id} order={o} />)}

          {!loading && !error && filteredOrders.length === 0 && (
            <p className="text-center py-8">
              {inputSearch.trim() 
                ? `Không tìm thấy đơn hàng khớp với "${inputSearch}".`
                : "Chưa có đơn hàng nào."}
            </p>
          )}
        </div>

        {
          !loading && !error && filteredOrders.length > 0 && pagination.totalPages > 1 && !isSearching && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="px-4 py-2 rounded-lg bg-white border text-gray-700 disabled:opacity-50 hover:bg-gray-100 transition"
            >
              Trang trước
            </button>
            <span className="text-gray-600 font-medium">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="px-4 py-2 rounded-lg bg-white border text-gray-700 disabled:opacity-50 hover:bg-gray-100 transition"
            >
              Trang sau
            </button>
          </div>
          )
        }
      </div>
    </div>
  );
};

export default MyOrders;