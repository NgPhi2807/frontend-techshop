// src/components/Review/ProductRatingSummary.tsx
import React, { useState } from "react";
import ReviewModal from "./postPreview";
// ✅ Import useAuthStore
import { useAuthStore } from "../../stores/authStore";
import { toast } from "react-toastify"; // Đảm bảo bạn đã cài đặt react-toastify và ToastContainer
// --- Interfaces & StarIcon (Không đổi) ---

interface ProductRating {
  total: number;
  star1: number;
  star2: number;
  star3: number;
  star4: number;
  star5: number;
  average: number;
}

interface ProductRatingSummaryProps {
  data: ProductRating;
  productId: number;
  productName: string;
}

// Helper to render the star icons (Giữ nguyên)
const StarIcon = ({
  fill,
  color = "yellow",
}: {
  fill: boolean;
  color?: "yellow" | "red";
}) => {
  const baseColor = color === "red" ? "text-red-600" : "text-yellow-400";
  const fillColor = fill ? baseColor : "text-gray-300";

  return (
    <svg
      className={`h-4 w-4 ${fillColor}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.691h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.045a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.045a1 1 0 00-1.175 0l-2.817 2.045c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.001 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.691l1.07-3.292z" />
    </svg>
  );
};
// --- End StarIcon ---

const ProductRatingSummary: React.FC<ProductRatingSummaryProps> = ({
  data,
  productId,
  productName,
}) => {
  const { total, star1, star2, star3, star4, star5, average } = data;
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Lấy trạng thái đăng nhập từ store
  const { isAuthenticated } = useAuthStore(); // Array of star counts from 5 to 1 for easier mapping

  const starCounts = [
    { star: 5, count: star5 },
    { star: 4, count: star4 },
    { star: 3, count: star3 },
    { star: 2, count: star2 },
    { star: 1, count: star1 },
  ]; // Function to calculate the percentage of a star count

  const getPercentage = (count: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  }; // Function to render the yellow stars for the average rating

  const renderAverageStars = (avg: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => {
        const isFilled = i < Math.floor(avg);
        return <StarIcon key={i} fill={isFilled} color="yellow" />;
      });
  }; // ❌ LOẠI BỎ ALERT trong hàm này

  const handleReviewSuccess = () => {};
  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để có thể gửi đánh giá sản phẩm này."); // Nếu dùng toastify, bạn sẽ dùng: toast.error("Vui lòng đăng nhập...")
      return;
    }
    setIsModalOpen(true); // Mở modal nếu đã đăng nhập
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex flex-col p-4 md:flex-row md:gap-6 md:p-6">
          {/* Left Column (30%) */}
          <div className="flex basis-[30%] flex-col items-center border-b border-gray-100 pb-4 md:items-start md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <div className="mb-2 flex items-baseline">
              <span className="bg-gradient-to-br from-rose-500 to-red-600 bg-clip-text text-5xl font-bold text-transparent">
                {average.toFixed(1)}
              </span>

              <span className="ml-2 text-xl font-medium text-gray-400">/5</span>
            </div>

            <div className="mb-2 flex gap-1">{renderAverageStars(average)}</div>

            <div className="mb-4 text-sm font-medium text-gray-500">
              <span className="text-gray-700">{total.toLocaleString()}</span>
              lượt đánh giá
            </div>

            <button
              onClick={handleWriteReviewClick} // ✅ Sử dụng hàm kiểm tra
              className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-10 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:from-rose-600 hover:to-red-700 md:w-fit"
            >
              Viết đánh giá
            </button>
          </div>
          {/* Right Column (70%) */}
          <div className="flex w-full flex-col gap-4 lg:w-[70%] lg:flex-row">
            {/* Phần 1: Biểu đồ sao */}
            <div className="w-full space-y-2.5 lg:w-[60%]">
              {starCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3">
                  {/* Star Label */}
                  <div className="flex w-12 flex-shrink-0 items-center gap-1 text-sm font-semibold text-gray-700">
                    <span>{star}</span>
                    <svg
                      className="h-3.5 w-3.5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.691h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.045a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.045a1 1 0 00-1.175 0l-2.817 2.045c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.001 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.691l1.07-3.292z" />
                    </svg>
                  </div>
                  {/* Progress Bar */}
                  <div className="relative h-2 flex-grow overflow-hidden rounded-lg bg-gray-200">
                    <div
                      className="h-full rounded-lg transition-all duration-300"
                      style={{
                        width: `${getPercentage(count)}%`,
                        background:
                          star >= 4
                            ? "linear-gradient(to right, #f43f5e, #ef4444)"
                            : "linear-gradient(to right, #fda4af, #fca5a5)",
                      }}
                    />
                  </div>
                  {/* Count Label */}
                  <div className="w-20 flex-shrink-0 text-right">
                    <span className="text-sm font-semibold text-gray-700">
                      {count}
                    </span>

                    <span className="ml-1 text-xs text-gray-500">đánh giá</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Phần 2: Thống kê phần trăm */}
            <div className="flex w-full flex-col lg:w-[40%]">
              <div className="grid grid-cols-3 divide-x divide-gray-200 rounded-lg bg-gray-50 p-3 shadow-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-rose-600">
                    {total > 0 ? ((star5 / total) * 100).toFixed(0) : 0}%
                  </div>

                  <div className="text-xs text-gray-500">Xuất sắc</div>
                </div>

                <div className="px-2 text-center">
                  <div className="text-xl font-bold text-amber-600">
                    {total > 0 ? ((star4 / total) * 100).toFixed(0) : 0}%
                  </div>

                  <div className="text-xs text-gray-500">Tốt</div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold text-gray-600">
                    {total > 0
                      ? (((star1 + star2 + star3) / total) * 100).toFixed(0)
                      : 0}
                    %
                  </div>

                  <div className="text-xs text-gray-500">Trung bình</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal component */}
      <ReviewModal
        productId={productId}
        productName={productName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default ProductRatingSummary;
