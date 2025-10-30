// useCustomerProfileStore.ts

import { create } from "zustand";

const API_URL = import.meta.env.PUBLIC_API_BASE_URL;
const CACHE_KEY = "customerProfileCache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
const isClient = typeof window !== "undefined";


interface Address {
  id: number;
  phone: string | null;
  line: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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

interface ProfileState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchProfile: (forceUpdate?: boolean) => Promise<void>; 
}


export const useCustomerProfileStore = create<ProfileState>((set, get) => {
  const cache = isClient && localStorage.getItem(CACHE_KEY)
    ? JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
    : {};

  return {
    user: cache.user || null,
    loading: false,
    error: null,
    lastFetched: cache.lastFetched || null,

    fetchProfile: async (forceUpdate = false) => {
      if (!isClient) return;

      const { lastFetched, user } = get();
      const now = Date.now();
      
      if (!forceUpdate && user && lastFetched && now - lastFetched < CACHE_DURATION) {
        return;
      }
      
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        set({ user: null, error: "Vui lòng đăng nhập để xem hồ sơ." });
        return;
      }

      set({ loading: true, error: null });

      try {
        const res = await fetch(`${API_URL}/api/customer/my-profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const json: ApiResponse<UserData> = await res.json();
        
        if (!res.ok || json.code !== 1000 || !json.data) {
          throw new Error(json.message || "Không thể tải dữ liệu hồ sơ.");
        }

        const newState = {
          user: json.data, 
          error: null,
          loading: false,
          lastFetched: Date.now(),
        };
        
        set(newState);
        localStorage.setItem(CACHE_KEY, JSON.stringify(newState));
      } catch (err: any) {
        console.error("❌ Fetch profile error:", err);
        set({
          error: err.message || "Không thể kết nối đến máy chủ.",
          loading: false,
        });
      }
    },
  };
});