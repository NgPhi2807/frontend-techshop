import { create } from "zustand";

const API_URL = import.meta.env.PUBLIC_API_BASE_URL;

interface Address {
  id: number;
  phone: string | null;
  line: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  roleName: string;
  totalOrders: number;
  totalAmountSpent: number;
  addresses: Address[];
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

interface UpdateProfilePayload {
  name: string;
  gender: string;
  birth: string;
}

interface ProfileState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<{ success: boolean; message: string }>;
}

export const useCustomerProfileStore = create<ProfileState>((set, get) => {
  return {
    user: null, // Khởi tạo null, không đọc từ cache
    loading: false,
    error: null,

    fetchProfile: async () => {
      // Bỏ tham số forceUpdate và logic kiểm tra lastFetched
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        set({ user: null, error: "Vui lòng đăng nhập." });
        return;
      }

      set({ loading: true, error: null });
      try {
        const res = await fetch(`${API_URL}/api/customer/my-profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        const json: ApiResponse<UserData> = await res.json();
        if (!res.ok || json.code !== 1000 || !json.data) throw new Error(json.message);

        // Lưu state nhưng KHÔNG lưu vào localStorage
        set({ user: json.data, error: null, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    updateProfile: async (payload) => {
      const accessToken = localStorage.getItem("accessToken");
      set({ loading: true });
      try {
        const res = await fetch(`${API_URL}/api/customer/update-profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const json: ApiResponse<UserData> = await res.json();
        if (!res.ok || json.code !== 1000) throw new Error(json.message);

        const updatedUser = { ...get().user, ...payload } as UserData;

        set({ user: updatedUser, loading: false });

        return { success: true, message: "Thành công" };
      } catch (err: any) {
        set({ loading: false });
        return { success: false, message: err.message };
      }
    },
  };
});