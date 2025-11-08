import React, { useState, useMemo, useEffect } from "react";

// XÓA: import BackgroundImage from "../../assets/fs-bg-20-10-desk.webp";
// import giftleft from "../../assets/fs-gift-box-2-20-10.webp"; // KHÔNG DÙNG
// import giftright from "../../assets/fs-gift-box-20-10.webp"; // KHÔNG DÙNG
// import header from "../../assets/hs-head-20-10.webp"; // KHÔNG DÙNG

import "swiper/css/grid";
import { Swiper, SwiperSlide, Swiper as SwiperCore } from "swiper/react";
import { Grid } from "swiper/modules";
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
  promotions: {
    id: number;
    name: string;
    description: string;
  } | null;
}

interface FlashSaleSwiperProps {
  datamobile: Product[] | undefined;
  datalaptop: Product[] | undefined;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price);

const FlashSaleSwiper: React.FC<FlashSaleSwiperProps> = ({
  datamobile,
  datalaptop,
}) => {
  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [activeTab, setActiveTab] = useState<"mobile" | "laptop">("mobile");

  const handlePrev = () => {
    swiper?.slidePrev();
  };
  const handleNext = () => {
    swiper?.slideNext();
  };

  const displayedData = useMemo(() => {
    const data = activeTab === "mobile" ? datamobile : datalaptop;
    return Array.isArray(data) ? data : [];
  }, [activeTab, datamobile, datalaptop]);

  useEffect(() => {
    if (swiper) {
      swiper.slideTo(0, 0);
      setIsBeginning(true);
      setIsEnd(false);
    }
  }, [activeTab, swiper]);

  if (
    displayedData.length === 0 &&
    datamobile?.length === 0 &&
    datalaptop?.length === 0
  ) {
    return (
      <div className="p-4 text-center text-gray-500">
        Không có sản phẩm nào đang giảm giá.
      </div>
    );
  }

  return (
    <div className="relative py-0 lg:py-6">
      {/* Title Header */}
      <div className="relative z-30 mx-auto w-full lg:w-fit">
        <div className="relative z-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff4e00] px-10 py-3 lg:rounded-b-none lg:rounded-t-2xl">
          <h2 className="whitespace-nowrap text-base font-black uppercase text-white drop-shadow-lg lg:text-3xl">
            Deal <span className="text-yellow-200">Online Rẻ Giật Mình</span>
          </h2>
        </div>
      </div>

      {/* Outer div for the orange border (rounded-lg) */}
      <div className="rounded-lg border-0 border-[#ff4e00] lg:border-4">
        <div className="group relative h-auto px-0 lg:px-3">
          <div className="flex flex-row justify-center gap-2 pt-4 lg:justify-start">
            <button
              onClick={() => setActiveTab("mobile")}
              className={`rounded-full px-6 py-1.5 text-xs font-bold lg:text-sm ${
                activeTab === "mobile"
                  ? "border-2 border-[#ff4e00] bg-white text-black shadow-md" // 🔑 ACTIVE: Viền cam đậm, nền trắng, chữ đen
                  : "border-2 border-gray-300 bg-white text-gray-800 transition-all duration-200 hover:scale-105 hover:border-[#ff4e00]" // INACTIVE: Viền xám, nền trắng
              }`}
            >
              Điện Thoại HOT
            </button>

            <button
              onClick={() => setActiveTab("laptop")}
              className={`rounded-full px-6 py-1.5 text-xs font-bold lg:text-sm ${
                activeTab === "laptop"
                  ? "border-2 border-[#ff4e00] bg-white text-black shadow-md" // 🔑 ACTIVE: Viền cam đậm, nền trắng, chữ đen
                  : "border-2 border-gray-300 bg-white text-gray-800 transition-all duration-200 hover:scale-105 hover:border-[#ff4e00]" // INACTIVE: Viền xám, nền trắng
              }`}
            >
              Laptop Cấu Hình Mạnh
            </button>
          </div>

          {displayedData.length === 0 ? (
            <div className="py-12 text-center text-lg text-gray-600">
              Không tìm thấy sản phẩm Flash Sale cho danh mục
              {activeTab === "mobile" ? " Mobile" : " Laptop"}.
            </div>
          ) : (
            <Swiper
              modules={[Grid]}
              spaceBetween={14}
              slidesPerView={2}
              onSwiper={setSwiper}
              onSlideChange={(s) => {
                setIsBeginning(s.isBeginning);
                setIsEnd(s.isEnd);
              }}
              breakpoints={{
                640: { slidesPerView: 4 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
                1920: { slidesPerView: 5 },
              }}
              className="mySwiper h-auto"
            >
              {displayedData.map((product) => {
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
                // Xử lý promoText theo cấu trúc interface (object hoặc null)
                const promoText =
                  product.promotions?.description ||
                  "Không phí chuyển đổi khi trả góp 0%...";

                return (
                  <SwiperSlide key={product.id}>
                    <a
                      href={`/san-pham/${product.slug}`}
                      className="relative my-6 flex h-full flex-col rounded-lg bg-white px-3 shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-[150px] w-full py-6 transition-all duration-500 hover:scale-110 lg:h-[180px]">
                        <img
                          src={`${IMAGE_BASE_URL}${product.thumbnail}`}
                          alt={product.name}
                          className="h-full w-full rounded-lg object-contain"
                        />
                      </div>

                      {hasDiscount && (
                        <div className="absolute -top-2 left-2 z-20">
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

                      <div className="">
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

                        <p className="mt-4 line-clamp-2 h-auto rounded bg-gray-200 p-1 text-[10px] font-semibold text-black lg:text-xs">
                          {promoText}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-gray-100 p-3 text-xs">
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
          )}

          {/* Nút điều hướng (Chỉ hiển thị nếu có dữ liệu để cuộn) */}
          {displayedData.length > 0 && (
            <>
              <button
                onClick={handlePrev}
                className={`absolute left-0 top-[50%] z-20 hidden transform rounded-r-full bg-black/50 py-3 text-white transition duration-300 md:block ${
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
                className={`absolute right-0 top-[50%] z-20 hidden transform rounded-l-full bg-black/50 py-3 text-white transition duration-300 md:block ${
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashSaleSwiper;