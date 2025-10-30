import { create } from "zustand";

const BASE_URL = ""; 
const API_LOGIN_URL = `${BASE_URL}/api/public/auth/login`;
const API_REGISTER_URL = `${BASE_URL}/api/public/auth/register`;

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface AuthState {
  accessToken: string | null; 
  isAuthenticated: boolean;
  loginLoading: boolean;
  loginError: string | null;
  registerLoading: boolean;
  registerError: string | null;
  
  login: (phone: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => void;
  clearLoginError: () => void;
  clearRegisterError: () => void;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null, 
  isAuthenticated: false,
  loginLoading: false,
  loginError: null,
  registerLoading: false,
  registerError: null,
  
  clearLoginError: () => set({ loginError: null }),
  clearRegisterError: () => set({ registerError: null }),
  
  checkAuthStatus: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      set({ isAuthenticated: !!token, accessToken: token || null }); 
    }
  },

  login: async (phone, password) => {
    set({ loginLoading: true, loginError: null });
    try {
      const response = await fetch(API_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ phone, password }),
      });

      const result = await response.json();

      if (response.ok && result.code === 1000 && result.data?.accessToken) {
        const newAccessToken = result.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        set({ isAuthenticated: true, loginLoading: false, accessToken: newAccessToken });
        return true;
      } else {
        const errorMessage =
          response.status === 401 || response.status === 403
            ? "Số điện thoại hoặc mật khẩu không chính xác."
            : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";

        set({ loginError: errorMessage, loginLoading: false, accessToken: null, isAuthenticated: false });
        return false;
      }
    } catch (err) {
      set({
        loginError: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        loginLoading: false,
        accessToken: null,
        isAuthenticated: false,
      });
      return false;
    }
  },

  register: async (payload) => {
    set({ registerLoading: true, registerError: null });
    try {
      const response = await fetch(API_REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.code === 1000) {
        set({ registerLoading: false });
        return true;
      } else {
        const apiMessage = result.message?.toLowerCase() || "";
        let errorMessage = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";

        const errorMap: { [key: string]: string } = {
          INVALID_PASSWORD_FORMAT:
            "Mật khẩu không hợp lệ. Cần tối thiểu 6 ký tự và chứa ký tự đặc biệt.",
          INVALID_EMAIL_FORMAT: "Địa chỉ email không đúng định dạng.",
        };

        if (result.message && errorMap[result.message]) {
          errorMessage = errorMap[result.message];
        } else if (
          apiMessage.includes("email") &&
          (apiMessage.includes("exist") || apiMessage.includes("duplicate"))
        ) {
          errorMessage = "Email đã tồn tại. Vui lòng sử dụng email khác.";
        } else if (
          apiMessage.includes("phone") &&
          (apiMessage.includes("exist") || apiMessage.includes("duplicate"))
        ) {
          errorMessage =
            "Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.";
        } else if (result.message) {
          errorMessage = result.message;
        }

        set({ registerError: errorMessage, registerLoading: false });
        return false;
      }
    } catch (err) {
      set({
        registerError: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        registerLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ isAuthenticated: false, accessToken: null });
  },
}));
