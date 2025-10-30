// src/components/Auth/Login.tsx
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/authStore"; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  // onSwitchToLogin: () => void; // Loại bỏ vì nó là LoginModal
  onSwitchToForgotPassword: () => void; // 👈 PROP MỚI
}

const LoginModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgotPassword, // 👈 SỬ DỤNG PROP MỚI
}) => {
  const [identifier, setIdentifier] = useState(""); // Dùng cho SĐT hoặc Email
  const [password, setPassword] = useState("");

  const {
    login,
    loginLoading: loading,
    loginError: error,
    clearLoginError: clearError,
  } = useAuthStore();

  useEffect(() => {
    if (!isOpen && error) {
      clearError();
    }
  }, [isOpen, error, clearError]);

  if (!isOpen) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(identifier, password);

    if (success) {
      toast.success("Đăng nhập thành công! 🎉");
      onClose();
      setIdentifier("");
      setPassword("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="hover:shadow-3xl relative w-11/12 max-w-md transform rounded-lg bg-white p-8 shadow-2xl transition-all duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-base font-extrabold text-gray-900 lg:text-xl">
            Đăng nhập Tài khoản
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Chào mừng bạn quay trở lại
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="identifier"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Số điện thoại hoặc Email
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="Nhập số điện thoại hoặc email của bạn"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                clearError();
              }}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* 👈 THÊM NÚT QUÊN MẬT KHẨU */}
          <div className="flex justify-end">
            <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm font-medium text-rose-600 transition hover:text-rose-700 hover:underline"
            >
                Quên mật khẩu?
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600">⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-rose-600 py-3 font-semibold text-white shadow-md transition duration-200 hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Tiếp tục"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <button
            onClick={onSwitchToRegister}
            className="font-bold text-rose-600 transition hover:text-rose-700 hover:underline"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;