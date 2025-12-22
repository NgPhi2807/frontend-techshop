import { create } from "zustand";

const API_URL = import.meta.env.PUBLIC_API_BASE_URL;
const CACHE_KEY = "customerProfileCache";
const CACHE_DURATION = 5 * 60 * 1000;
const isClient = typeof window !== "undefined";

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
  lastFetched: number | null;
  fetchProfile: (forceUpdate?: boolean) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<{ success: boolean; message: string }>;
}

export const useCustomerProfileStore = create<ProfileState>((set, get) => {
  const cache = isClient ? JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") : {};

  return {
    user: cache.user || null,
    loading: false,
    error: null,
    lastFetched: cache.lastFetched || null,

    fetchProfile: async (forceUpdate = false) => {
      if (!isClient) return;
      const { lastFetched, user } = get();
      const now = Date.now();

      if (!forceUpdate && user && lastFetched && now - lastFetched < CACHE_DURATION) return;

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

        const newState = { user: json.data, error: null, loading: false, lastFetched: Date.now() };
        set(newState);
        localStorage.setItem(CACHE_KEY, JSON.stringify(newState));
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
        const newState = { ...get(), user: updatedUser, loading: false };
        set(newState);
        localStorage.setItem(CACHE_KEY, JSON.stringify(newState));
        return { success: true, message: "Thành công" };
      } catch (err: any) {
        set({ loading: false });
        return { success: false, message: err.message };
      }
    },
  };
});