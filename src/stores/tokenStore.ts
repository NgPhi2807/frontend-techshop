import { create } from "zustand";
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;
const API_REFRESH_URL = `${BASE_URL}/api/public/auth/refresh_token`;

const REFRESH_INTERVAL = 29 * 60 * 1000;
interface TokenState {
  lastRefresh: number | null;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  refreshAccessToken: () => Promise<void>;
}

let refreshIntervalId: ReturnType<typeof setInterval> | null = null;
export const useTokenStore = create<TokenState>((set) => ({
  lastRefresh: null,
  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      return;
    }

    try {
      const response = await fetch(API_REFRESH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (response.ok && result.code === 1000 && result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        set({ lastRefresh: Date.now() });
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } catch (err) {}
  },

  startAutoRefresh: () => {
    if (typeof window === "undefined" || refreshIntervalId) return;

    const run = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (accessToken && refreshToken) {
        await useTokenStore.getState().refreshAccessToken();
      } else {
        useTokenStore.getState().stopAutoRefresh();
      }
    };

    run();

    refreshIntervalId = setInterval(run, REFRESH_INTERVAL);
  },
  stopAutoRefresh: () => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }
  },
}));
