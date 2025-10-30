// src/components/Auth/ForgotPassword.tsx (Phiên bản đã cập nhật)
import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
// Loại bỏ import toast
import { useAuthStore } from "../../stores/authStore"; 

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

// 💡 Component Popup Thông báo Thành công Tùy chỉnh
interface SuccessPopupProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ onClose, onSwitchToLogin }) => {
    return (
        <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu đã được gửi!</h3>
            <p className="text-gray-600 mb-6">
                Vui lòng kiểm tra hộp thư email của bạn (bao gồm cả thư mục Spam) để nhận liên kết khôi phục mật khẩu.
            </p>
            <button
                onClick={onSwitchToLogin}
                className="w-full rounded-lg bg-rose-600 py-3 font-semibold text-white shadow-md transition duration-200 hover:bg-rose-700"
            >
                Quay lại Đăng nhập
            </button>
            <button
                onClick={onClose}
                className="mt-3 w-full text-sm font-medium text-gray-500 transition hover:text-gray-700 hover:underline"
            >
                Đóng
            </button>
        </div>
    );
};

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  // 👈 THÊM STATE ĐỂ HIỂN THỊ POPUP THÀNH CÔNG
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const { 
    forgotPassword, 
    forgotPasswordLoading: loading, 
    forgotPasswordError: requestError,
  } = useAuthStore(); 

  // Hàm đóng modal chính và reset state
  const handleCloseModal = () => {
    onClose();
    setEmail("");
    setShowSuccessPopup(false);
    // Lưu ý: Nếu có hàm clearForgotPasswordError trong store, nên gọi ở đây.
  };

  if (!isOpen) {
    return null;
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await forgotPassword(email);

    if (success) {
        // 💡 Thay thế toast bằng việc hiển thị popup tùy chỉnh
        setShowSuccessPopup(true);
    }
  };

  // Nếu popup thành công đang hiển thị, chúng ta sẽ render nó thay vì form
  const ModalContent = showSuccessPopup ? (
    <SuccessPopup 
        onClose={handleCloseModal} 
        onSwitchToLogin={() => {
            handleCloseModal(); // Đóng Forgot Password Modal
            onSwitchToLogin(); // Mở Login Modal
        }} 
    />
  ) : (
    <>
      <button
        onClick={handleCloseModal} // Sử dụng hàm đóng mới
        className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mb-6 text-center">
        <h2 className="text-base font-extrabold text-gray-900 lg:text-xl">
          Quên Mật Khẩu
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Nhập địa chỉ email để khôi phục mật khẩu của bạn.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleResetPassword}>
        <div>
          <label
            htmlFor="reset-email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email của bạn
          </label>
          <input
            type="email"
            id="reset-email"
            name="email"
            placeholder="Nhập email đã đăng ký"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // clearForgotPasswordError(); 
            }}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            required
          />
        </div>

        {/* Hiển thị lỗi từ store */}
        {requestError && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm font-medium text-red-600">⚠️ {requestError}</p>
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
              Đang gửi yêu cầu...
            </>
          ) : (
            "Gửi Yêu Cầu Khôi Phục"
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button
          onClick={onSwitchToLogin}
          className="text-sm font-medium text-gray-500 transition hover:text-gray-700 hover:underline"
        >
          Quay lại Đăng nhập
        </button>
      </div>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleCloseModal}
    >
      <div
        className={`hover:shadow-3xl relative w-11/12 max-w-md transform rounded-lg bg-white p-8 shadow-2xl transition-all duration-500 
            ${showSuccessPopup ? 'max-w-sm' : ''} `} // Giảm kích thước modal nếu là popup thành công
        onClick={(e) => e.stopPropagation()}
      >
        {ModalContent}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;