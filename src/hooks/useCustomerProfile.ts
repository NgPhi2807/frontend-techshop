import { useState, useEffect } from "react";

// --- Interfaces ---

/** Kiểu dữ liệu người dùng từ API */
export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string | null;
  birth: string | null;
  avatar: string | null;
  isActive: boolean;
  isGuest: boolean;
  roleName: string;
  totalOrders: number;
  totalAmountSpent: number;
  createdAt: string;
  updatedAt: string;
  addresses: any[];
}

/** Kiểu dữ liệu phản hồi API */
export interface ApiResponse<T> {
  code: number;
  timestamp: string;
  data: T;
  message?: string;
}

/** Kiểu trả về của Hook */
export interface ProfileHook {
  response: ApiResponse<UserData> | null;
  loading: boolean;
  error: string | null;
}

// --- API Endpoint ---
const API_URL =
  "https://obscure-spoon-4j65gr6xqv5x3jj6-8080.app.github.dev/api/customer/profile";

export const useCustomerProfile = (): ProfileHook => {
  const [response, setResponse] = useState<ApiResponse<UserData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("Không tìm thấy Access Token. Vui lòng đăng nhập.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(
            errorBody.message ||
              `Lỗi HTTP: ${res.status}. Phiên đăng nhập hết hạn?`,
          );
        }

        const json: ApiResponse<UserData> = await res.json();

        if (json.code === 1000 && json.data) {
          setResponse(json);
        } else {
          throw new Error(json.message || "Không thể tải dữ liệu hồ sơ.");
        }
      } catch (err: any) {
        console.error("Lỗi khi tải hồ sơ:", err);
        setError(err.message || "Đã xảy ra lỗi khi kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { response, loading, error };
};
