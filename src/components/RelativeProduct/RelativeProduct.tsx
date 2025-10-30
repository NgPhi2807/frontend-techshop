import React, { useState } from "react";

// Xóa import 'swiper/css/grid';
import { Swiper, SwiperSlide, Swiper as SwiperCore } from "swiper/react";
// Xóa import { Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

interface Product {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  special_price: number;
  rating: { average: number };
  promotion: {
    id: number;
    name: string;
    description: string;
  } | null;
}

interface SwiperData {
  page: number;
  items: Product[];
  size: number;
  totalElements: number;
  totalPages: number;
}

interface ProductSwiperProps {
  data: SwiperData;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price);

const ProductSwiper: React.FC<ProductSwiperProps> = ({ data: swiperData }) => {
  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const products = swiperData?.items || [];

  const handlePrev = () => {
    swiper?.slidePrev();
  };
  const handleNext = () => {
    swiper?.slideNext();
  };

  if (!products || products.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Không có sản phẩm nào để hiển thị.
      </div>
    );
  }

  return (
    <div className="group relative mx-auto max-w-screen-xl px-2 2xl:px-0">
      <h2 className="py-4 text-base font-bold text-gray-800 lg:text-xl">
        Sản Phẩm Tương Tự
      </h2>

      <Swiper
        // modules={[Grid]} <-- Đã xóa
        spaceBetween={14}
        slidesPerView={2}
        // grid={{ rows: 2, fill: "row" }} <-- Đã xóa
        onSwiper={setSwiper}
        onSlideChange={(s) => {
          setIsBeginning(s.isBeginning);
          setIsEnd(s.isEnd);
        }}
        breakpoints={{
          // Cập nhật slidesPerView cho 1 hàng
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 }, // Thường dùng 4 hoặc 5 cho desktop
        }}
        // ✅ Xóa class 'h-auto' khỏi Swiper để tránh xung đột với SwiperSlide
        className="mySwiper"
      >
        {products.map((product) => {
          const currentPrice = product.special_price;
          const originalPrice = product.price;

          const discountPercent =
            originalPrice > 0 && currentPrice < originalPrice
              ? Math.round(
                  ((originalPrice - currentPrice) / originalPrice) * 100,
                )
              : 0;

          const hasDiscount = discountPercent > 0;
          const ratingValue = product.rating?.average || 0;
          const promoText =
            product.promotion?.description ||
            "Không phí chuyển đổi khi trả góp 0%...";

          return (
            // ✅ Đã xóa class "!h-auto" ở đây.
            <SwiperSlide key={product.id}>
              <a
                href={`/san-pham/${product.slug}`}
                // ✅ Đã thay thế min-h-[350px] và lg:min-h-[400px] bằng h-full,
                //    đồng thời đảm bảo nội dung card linh hoạt (flex-col)
                //    để tất cả các card có chiều cao đồng nhất trong 1 row.
                className="relative flex h-full flex-col rounded-lg border border-[#e7e7e77d] bg-white p-3"
              >
                <div className="relative h-[150px] w-full py-6 transition-all duration-500 hover:scale-105 lg:h-[200px]">
                  <img
                    src={`${IMAGE_BASE_URL}${product.thumbnail}`}
                    alt={product.name}
                    className="h-full w-full rounded-md object-contain"
                  />
                </div>

                {hasDiscount && (
                  <div className="absolute left-0 top-0 z-20">
                    <div className="relative h-auto w-16 md:w-20">
                      <img
                        src="/src/assets/discount-badge-ui-2025.webp"
                        alt="Discount Badge"
                        className="h-full w-full object-contain"
                      />

                      <span className="absolute inset-0 flex items-center justify-center text-center text-[10px] font-bold leading-tight text-white">
                        Giảm {discountPercent}%
                      </span>
                    </div>
                  </div>
                )}

                <p className="mb-2 line-clamp-2 h-10 text-xs font-semibold text-gray-800 lg:text-sm">
                  {product.name}
                </p>

                <div className="flex flex-grow flex-col">
                  <div className="flex flex-row gap-2">
                    <p className="text-xs font-bold text-red-600 lg:text-sm">
                      {formatPrice(currentPrice)}₫
                    </p>

                    {hasDiscount && (
                      <p className="text-[10px] text-gray-500 line-through lg:text-xs">
                        {formatPrice(originalPrice)}₫
                      </p>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 h-auto rounded bg-gray-200 p-1 text-[10px] font-semibold text-black lg:mb-10 lg:text-xs">
                    {promoText}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                  <div className="flex items-center font-bold text-yellow-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-0.5 h-4 w-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.042a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.042a1 1 0 00-1.175 0l-2.817 2.042c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-gray-900">
                      {ratingValue.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-0 flex cursor-pointer items-center text-gray-500 hover:text-red-500">
                    {/* Heart Icon SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-0.5 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Yêu thích
                  </div>
                </div>
              </a>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <button
        onClick={handlePrev}
        className={`absolute left-0 top-[58%] z-20 hidden transform rounded-r-full bg-black/50 py-3 text-white transition duration-300 md:block ${
          isBeginning
            ? "pointer-events-none opacity-0"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="mr-2 h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className={`absolute right-0 top-[58%] z-20 hidden transform rounded-l-full bg-black/50 py-3 text-white transition duration-300 md:block ${
          isEnd
            ? "pointer-events-none opacity-0"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="ml-2 h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </div>
  );
};

export default ProductSwiper;
