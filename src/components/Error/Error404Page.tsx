import React from "react";
import { Home, Search, ChevronRight, Smartphone, Laptop, Headset, ArrowLeft } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const categories = [
    { name: "Điện thoại", icon: <Smartphone size={20} />, href: "/dien-thoai" },
    { name: "Laptop", icon: <Laptop size={20} />, href: "/laptop" },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Minh họa số 404 cách điệu */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-black text-gray-200 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
            <p className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-widest">
              Ối! Lỗi đường dẫn
            </p>
            <div className="h-1 w-20 bg-red-600 mt-2 rounded-full"></div>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl text-gray-600 mb-8 font-medium">
          Trang bạn đang tìm kiếm hiện không tồn tại hoặc đã được thay đổi.
        </h2>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={cat.href}
              className="flex items-center justify-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-red-200 transition-all group"
            >
              <span className="text-gray-500 group-hover:text-red-600 transition-colors">
                {cat.icon}
              </span>
              <span className="font-semibold text-gray-700">{cat.name}</span>
            </a>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/"
            className="flex w-full sm:w-auto items-center justify-center rounded-full bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-200 transition duration-300 hover:bg-red-700 hover:-translate-y-1"
          >
            <Home className="mr-2 h-5 w-5" />
            VỀ TRANG CHỦ
          </a>
          <button
            onClick={() => window.history.back()}
            className="flex w-full sm:w-auto items-center justify-center rounded-full bg-white border border-gray-300 px-8 py-4 text-sm font-bold text-gray-700 transition duration-300 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            QUAY LẠI TRANG TRƯỚC
          </button>
        </div>

        <p className="mt-12 text-sm text-gray-400">
          Cần hỗ trợ gấp? Gọi ngay <span className="text-red-600 font-bold">1900.xxxx</span> (8:00 - 21:30)
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;