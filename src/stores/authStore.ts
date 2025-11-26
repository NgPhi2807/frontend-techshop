// src/stores/authStore.ts
import { create } from "zustand";
import Cookies from "js-cookie";

import { loginApi, registerApi, refreshTokenApi, resetPasswordApi } from "../api/authApi"; 
const REFRESH_TIMEOUT = 29 * 60 * 1000; // 29 minutes
const COOKIE_EXPIRY_DAYS = 7; 

const COOKIE_OPTIONS = {
    secure: false,
    sameSite: "Lax",
    path: "/",
    expires: COOKIE_EXPIRY_DAYS,
} as const;

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface AuthState {
    isAuthenticated: boolean;
    loginLoading: boolean;
    loginError: string | null;
    registerLoading: boolean;
    registerError: string | null;
    forgotPasswordLoading: boolean;
    forgotPasswordError: string | null;
    refreshTimerId: NodeJS.Timeout | number | null;
    login: (identifier: string, password: string) => Promise<boolean>; // Chấp nhận identifier (SĐT/Email)
    register: (payload: RegisterPayload) => Promise<boolean>;
    logout: () => void;
    clearLoginError: () => void;
    clearRegisterError: () => void;
    forgotPassword: (email: string) => Promise<boolean>; 
    checkAuthStatus: () => Promise<void>;
    _refreshToken: (isScheduled?: boolean) => Promise<boolean>; // Thêm _refreshToken vào interface
}

export const useAuthStore = create<AuthState>((set, get) => {

    const _setAuthTokens = (accessToken: string, refreshToken: string) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        Cookies.set("accessToken", accessToken, COOKIE_OPTIONS);
        Cookies.set("refreshToken", refreshToken, COOKIE_OPTIONS);
    };

    const _removeAuthTokens = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("refreshToken", { path: "/" });
    };

    const _stopTokenRefresh = () => {
        const { refreshTimerId } = get();
        if (refreshTimerId !== null) {
            clearTimeout(refreshTimerId);
            set({ refreshTimerId: null });
        }
    };

    const _scheduleTokenRefresh = (timeout: number) => {
        _stopTokenRefresh();
        const id = setTimeout(async () => {
            await get()._refreshToken(true); 
        }, timeout);

        set({ refreshTimerId: id });
    };
    
    const _refreshToken = async (isScheduled = false): Promise<boolean> => {
        const currentRefreshToken = Cookies.get("refreshToken"); 
        const existingAccessToken = Cookies.get("accessToken");

        if (!currentRefreshToken) {
            if (existingAccessToken) {
                set({ isAuthenticated: true });
            } else {
                set({ isAuthenticated: false });
            }
            return false;
        }

        if (!isScheduled) set({ isAuthenticated: true });

        try {
            const result = await refreshTokenApi(currentRefreshToken);
            
            if (result.code === 1000 && result.data?.accessToken) {
                _setAuthTokens(result.data.accessToken, result.data.refreshToken);
                set({ isAuthenticated: true });
                _scheduleTokenRefresh(REFRESH_TIMEOUT);
                return true;
            } else {
                _stopTokenRefresh();
                _removeAuthTokens();
                set({ isAuthenticated: false }); 
                return false;
            }
        } catch (err) {
            _stopTokenRefresh();
            _removeAuthTokens();
            set({ isAuthenticated: false });
            return false;
        }
    };

    return {
        isAuthenticated: false,
        loginLoading: false,
        loginError: null,
        registerLoading: false,
        registerError: null,
        forgotPasswordLoading: false,
        forgotPasswordError: null, 
        refreshTimerId: null,

        _refreshToken, 

        clearLoginError: () => set({ loginError: null }),
        clearRegisterError: () => set({ registerError: null }),

        checkAuthStatus: async () => {
            if (typeof window === "undefined") return;
            await new Promise((r) => setTimeout(r, 100));
            const refreshTokenInCookie = Cookies.get("refreshToken"); 
            const accessToken = Cookies.get("accessToken");
            if (refreshTokenInCookie) {
                await get()._refreshToken(false); 
            } else if (accessToken) {
                set({ isAuthenticated: true });
            } else {
                set({ isAuthenticated: false });
            }
        },

        login: async (identifier, password) => {
            set({ loginLoading: true, loginError: null });
            try {
                const result = await loginApi(identifier, password);
                if (result.code === 1000 && result.data?.accessToken) {
                    _setAuthTokens(result.data.accessToken, result.data.refreshToken);
                    set({ isAuthenticated: true, loginLoading: false });
                    _scheduleTokenRefresh(REFRESH_TIMEOUT);
                    return true;
                } else {
                    set({
                        loginError: result.message || "Sai thông tin đăng nhập.",
                        loginLoading: false,
                    });
                    return false;
                }
            } catch (err) {
                set({
                    loginError: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
                    loginLoading: false,
                });
                return false;
            }
        },

        register: async (payload) => {
            set({ registerLoading: true, registerError: null });
            try {
                const result = await registerApi(payload);

                if (result.code === 1000) {
                    set({ registerLoading: false });
                    return true;
                } else {
                    set({
                        registerError: result.message || "Đăng ký thất bại.",
                        registerLoading: false,
                    });
                    return false;
                }
            } catch (err) {
                set({
                    registerError: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
                    registerLoading: false,
                });
                return false;
            }
        },

        forgotPassword: async (email: string) => {
            set({ forgotPasswordLoading: true, forgotPasswordError: null });
            try {
                const result = await resetPasswordApi(email); 

                if (result.code === 1000) {
                    set({ forgotPasswordLoading: false });
                    return true;
                } else {
                    set({
                        forgotPasswordError: result.message || "Gửi yêu cầu thất bại.",
                        forgotPasswordLoading: false,
                    });
                    return false;
                }
            } catch (err) {
                set({
                    forgotPasswordError: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
                    forgotPasswordLoading: false,
                });
                return false;
            }
        },

        logout: () => {
            _stopTokenRefresh();
            _removeAuthTokens(); 
            set({ isAuthenticated: false, loginLoading: false, registerLoading: false });
            
            if (typeof window !== "undefined") {
                window.location.replace("/");
            }
        },
    };
});