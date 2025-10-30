// RegisterModal.tsx

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/authStore";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
}

const RegisterModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    register,
    registerLoading: loading,
    registerError: error,
    clearRegisterError: setError,
  } = useAuthStore();

  if (!isOpen) {
    if (error) {
      setError();
    }
    return null;
  }

  const validateForm = () => {
    setValidationError(null);
    if (!name.trim()) return "Tên không được để trống.";
    if (!email.match(/^\S+@\S+\.\S+$/)) return "Email không hợp lệ.";
    if (!phone.match(/^[0-9]{10,12}$/))
      return "Số điện thoại không hợp lệ. Vui lòng nhập 10-12 chữ số.";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
      return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (ví dụ: !@#$%^&*).";
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError();

    const formError = validateForm();
    if (formError) {
      setValidationError(formError);
      return;
    }

    const payload = { name, email, password, phone };

    const success = await register(payload);

    if (success) {
      toast.success("Đăng ký thành công! Chuyển sang đăng nhập.");

      setName("");
      setEmail("");
      setPassword("");
      setPhone("");

      onSwitchToLogin();
    }
  };

  const displayError = validationError || error;

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
            Tạo Tài khoản mới
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu hành trình mua sắm của bạn
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleRegister}>
          {/* Tên */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {" "}
              Họ và tên{" "}
            </label>
            <input
              type="text"
              id="name"
              placeholder="Nhập họ và tên của bạn"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setValidationError(null);
                setError();
              }}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {" "}
              Email{" "}
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError(null);
                setError();
              }}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label
              htmlFor="reg-phone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {" "}
              Số điện thoại{" "}
            </label>
            <input
              type="tel"
              id="reg-phone"
              placeholder="10-12 chữ số"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setValidationError(null);
                setError();
              }}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label
              htmlFor="reg-password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {" "}
              Mật khẩu{" "}
            </label>
            <input
              type="password"
              id="reg-password"
              placeholder="Tối thiểu 6 ký tự và có 1 ký tự đặc biệt"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationError(null);
                setError();
              }}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* Hiển thị lỗi */}
          {displayError && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600">
                ⚠️ {displayError}
              </p>
            </div>
          )}

          {/* Nút Đăng ký */}
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-rose-600 py-3 font-semibold text-white shadow-md transition duration-200 hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đăng ký Tài khoản"
            )}
          </button>
        </form>

        {/* Chuyển sang Đăng nhập */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Bạn đã có tài khoản?{" "}
          <button
            onClick={onSwitchToLogin}
            className="font-bold text-rose-600 transition hover:text-rose-700 hover:underline"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
