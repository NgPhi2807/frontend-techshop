// src/components/Auth/AuthModals.tsx (Phiên bản đã cập nhật)

import React, { useState, useEffect } from "react";
import LoginModal from "./Login";
import RegisterModal from "./Register";
import ForgotPasswordModal from "./ForgotPassword";

type ModalType = "login" | "register" | "forgotPassword" | null;

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
    onAuthenticationSuccess();
  };

  const openLoginModal = () => setActiveModal("login");
  const openRegisterModal = () => setActiveModal("register");
  const openForgotPasswordModal = () => setActiveModal("forgotPassword");

  return (
    <>
      <LoginModal
        isOpen={activeModal === "login"}
        onClose={handleClose}
        onSwitchToRegister={openRegisterModal}
        onSwitchToForgotPassword={openForgotPasswordModal}
      />
      <RegisterModal
        isOpen={activeModal === "register"}
        onClose={handleClose}
        onSwitchToLogin={openLoginModal}
        onSwitchToRegister={openRegisterModal}
      />
      <ForgotPasswordModal
        isOpen={activeModal === "forgotPassword"}
        onClose={handleClose}
        onSwitchToLogin={openLoginModal}
      />
    </>
  );
};

export default AuthModals;