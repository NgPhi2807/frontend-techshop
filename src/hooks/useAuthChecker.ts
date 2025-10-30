import React, { useEffect } from "react";
import { useAuthStore } from "../stores/authStore"; // Thay đổi đường dẫn nếu cần

const AuthChecker = () => {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    console.log("Client-side: Calling checkAuthStatus...");
    checkAuthStatus();
  }, [checkAuthStatus]);

  return null;
};

export default AuthChecker;
