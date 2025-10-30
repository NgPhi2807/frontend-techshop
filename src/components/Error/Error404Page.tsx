// NotFoundPage.tsx

import React from "react";
import { Home, Search, ChevronRight, AlertTriangle } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    // Container chính: Đảm bảo trang chiếm toàn bộ chiều cao màn hình (min-h-screen)
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Box nội dung chính */}
      <div className="mx-auto w-full max-w-lg rounded-lg p-6 text-center sm:p-10">
        {/* Biểu tượng */}
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-14 w-14 text-red-500 sm:h-16 sm:w-16" />
        </div>

        {/* Tiêu đề lỗi */}
        <h1 className="mb-2 text-7xl font-extrabold tracking-tight text-gray-900 sm:text-8xl">
          404
        </h1>

        {/* Thông điệp chính */}
        <p className="mb-4 text-2xl font-bold text-red-600 sm:text-3xl">
          Trang không tìm thấy
        </p>

        {/* Mô tả chi tiết */}
        <p className="mb-8 text-base text-gray-500 sm:text-lg">
          Rất tiếc, địa chỉ bạn đang tìm đã không còn tồn tại hoặc đã bị di
          chuyển.
        </p>

        <div className="flex items-center justify-center">
          <a
            href="/"
            className="flex w-fit items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:scale-[1.02] hover:bg-red-700"
          >
            <Home className="mr-2 h-5 w-5" />
            Về Trang Chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
