// src/components/Auth/AuthModals.tsx (Phiên bản đã cập nhật)

import React, { useState, useEffect } from "react";
import LoginModal from "./Login"; 
import RegisterModal from "./Register"; 
import ForgotPasswordModal from "./ForgotPassword"; // 👈 THÊM COMPONENT NÀY

type ModalType = "login" | "register" | "forgotPassword" | null; // 👈 CẬP NHẬT TYPE

interface AuthModalsProps {
  initialModal: ModalType;
  onAuthenticationSuccess: () => void; 
}

const AuthModals: React.FC<AuthModalsProps> = ({
  initialModal,
  onAuthenticationSuccess,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(initialModal);

  useEffect(() => {
    setActiveModal(initialModal);
  }, [initialModal]);

  const handleClose = () => {
    setActiveModal(null);
    // Lưu ý: Chỉ gọi onAuthenticationSuccess() nếu việc đóng modal là do Đăng nhập thành công,
    // nhưng trong cấu trúc này, ta giữ nguyên logic của bạn.
    onAuthenticationSuccess(); 
  };

  const openLoginModal = () => setActiveModal("login");
  const openRegisterModal = () => setActiveModal("register");
  const openForgotPasswordModal = () => setActiveModal("forgotPassword"); // 👈 HÀM MỚI

  return (
    <>
      <LoginModal
        isOpen={activeModal === "login"}
        onClose={handleClose}
        onSwitchToRegister={openRegisterModal}
        onSwitchToForgotPassword={openForgotPasswordModal} // 👈 PROP MỚI
      />
      <RegisterModal
        isOpen={activeModal === "register"}
        onClose={handleClose}
        onSwitchToLogin={openLoginModal}
        // onSwitchToRegister={openRegisterModal} // (Tự chuyển sang chính nó không cần thiết)
      />
      {/* 👈 COMPONENT MỚI */}
      <ForgotPasswordModal
        isOpen={activeModal === "forgotPassword"}
        onClose={handleClose}
        onSwitchToLogin={openLoginModal} // Quay lại màn hình Đăng nhập
      />
    </>
  );
};

export default AuthModals;