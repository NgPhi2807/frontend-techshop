import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="bottom-right"
        autoClose={1000}
        closeOnClick
        theme="dark" // Hoặc "colored" nếu bạn muốn màu nền khác nhau        pauseOnFocusLoss
      />
    </>
  );
};

export default ToastProvider;
