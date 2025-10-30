
import axios from "axios";

export interface OrderItemPayload {
  variantId: number;
  quantity: number;
}

export interface BaseOrderPayload {
  orderItems: OrderItemPayload[];
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: "cod" | "bank";
}

export interface ShipOrderPayload extends BaseOrderPayload {
  line: string;
  ward: string;
  district: string;
  province: string;
}

export interface PickupOrderPayload extends BaseOrderPayload {
  storeId: number;
}

export interface PaymentInfo {
  type: string;
  label: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  transferContent?: string;
  qrCodeUrl?: string;
  expireAt?: string;
  lifeTime?: string;
}

export interface OrderResponseData {
  orderId: number;
  amount: number;
  paymentInfo: PaymentInfo;
  message: string;
}

export interface ApiResponse {
  code: number;
  data: OrderResponseData;
  message?: string;
}

export interface Store {
  id: number;
  name: string;
  displayAddress: string;
  location: { latitude: number; longitude: number };
  timeOpen: string;
  timeClose: string;
}

const ROOT_API_URL = import.meta.env.PUBLIC_API_BASE_URL;

export const placeOrderApi = async (
  payload: ShipOrderPayload | PickupOrderPayload,
  isShip: boolean
): Promise<OrderResponseData> => {
  const endpoint = isShip
    ? `${ROOT_API_URL}/api/checkout/ship`
    : `${ROOT_API_URL}/api/checkout/pickup`;

  const accessToken = localStorage.getItem("accessToken");
  const config = accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : {};

  try {
    const response = await axios.post<ApiResponse>(endpoint, payload, config);

    if (response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Đặt hàng thất bại với lỗi không xác định."
      );
    }
  } catch (err) {
    console.error("Lỗi khi đặt hàng:", err);
    
    if (axios.isAxiosError(err) && err.response && err.response.data) {
        throw new Error((err.response.data as { message: string }).message || "Lỗi kết nối.");
    }
    
    throw new Error(`Đặt hàng thất bại: ${(err as Error).message}`);
  }
};

export const fetchStoresApi = async (): Promise<Store[]> => {
    const endpoint = `${ROOT_API_URL}/api/public/store`;
    try {
        const response = await axios.get<{ 
            code: number; 
            data: Store[];
            message?: string;
        }>(endpoint);

        if (response.data.code === 1000 && response.data.data) {
            return response.data.data;
        } else {
            throw new Error(
                response.data.message || "Không tải được danh sách cửa hàng."
            );
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách cửa hàng:", error);
        throw new Error("Không thể kết nối để lấy danh sách cửa hàng.");
    }
};