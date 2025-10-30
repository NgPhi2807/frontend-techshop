import React, { useState, useMemo } from "react";

import "swiper/css/grid";
import { Swiper, SwiperSlide, Swiper as SwiperCore } from "swiper/react";
import { Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

// Giả sử IMAGE_BASE_URL được định nghĩa trong môi trường
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

// --- Interfaces (Giữ nguyên) ---
interface Feature {
  id: number;
  name: string;
  slug: string;
  categoryType: string;
  logo: string | null;
}
interface Brand {
  id: number;
  name: string;
  slug: string;
  categoryType: string;
  logo: string | null;
}

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

// Thay đổi FlashSaleSwiperProps thành MobileCategorySwiperProps
interface MobileCategorySwiperProps {
  dataiphone: Product[]; // Dữ liệu cho iPhone
  datasamsung: Product[]; // Dữ liệu cho Samsung
  brands: Brand[];
  feature: Feature[];
}

// Thêm type cho category
type Category = "iphone" | "samsung";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price);

// Đổi tên component
const CategoryProductSwiper: React.FC<MobileCategorySwiperProps> = ({
  dataiphone,
  datasamsung,
  brands,
  feature,
}) => {
  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  // Thêm state để quản lý category đang chọn, mặc định là 'iphone'
  const [selectedCategory, setSelectedCategory] = useState<Category>("iphone");

  const handlePrev = () => {
    swiper?.slidePrev();
  };
  const handleNext = () => {
    swiper?.slideNext();
  };

  // 1. Lấy dữ liệu và tiêu đề dựa trên category đang chọn
  const { currentData, title } = useMemo(() => {
    if (selectedCategory === "iphone") {
      return {
        currentData: dataiphone,
        title: "iPhone Nổi Bật",
      };
    } else {
      // selectedCategory === 'samsung'
      return {
        currentData: datasamsung,
        title: "Samsung Nổi Bật",
      };
    }
  }, [selectedCategory, dataiphone, datasamsung]);

  // Kiểm tra dữ liệu chung
  if (!currentData || currentData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Không có sản phẩm {title} nào.
      </div>
    );
  }

  const visibleBrands = brands;
  const visibleFeature = feature;

  // Class cho tab đang active
  const activeTabClass = "";
  const inactiveTabClass = "";

  return (
    <div className="group relative">
      {/* --- Category Selector (Thêm vào đây) --- */}
      {/* Category Selector (Đã sửa) */}
      <div className="flex justify-center gap-2">
        <div className="relative flex h-auto w-full items-center justify-center gap-2 rounded-t-lg border-b-[2px] border-red-600 shadow">
          <div className="flex w-full">
            <button
              onClick={() => setSelectedCategory("iphone")}
              className={`w-1/2 rounded-t-lg px-4 py-3 text-center text-sm font-semibold uppercase lg:text-xl ${
                selectedCategory === "iphone"
                  ? "border-r border-red-200 bg-gradient-to-t from-red-50 to-gray-200 text-red-600"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              iPhone Nổi Bật
            </button>
            <button
              onClick={() => setSelectedCategory("samsung")}
              className={`w-1/2 rounded-t-lg px-4 py-2 text-center text-sm font-semibold uppercase transition duration-200 lg:text-xl ${
                selectedCategory === "samsung"
                  ? "border-l border-red-200 bg-gradient-to-t from-red-50 to-gray-200 text-red-600"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Samsung Nổi Bật
            </button>
          </div>
        </div>
      </div>
      {/* -------------------------------------- */}

      {/* Feature Section (Giữ nguyên) */}
      {feature.length > 0 && (
        <div className="flex w-full justify-center">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto px-1 py-3">
            {visibleFeature.map((item) => (
              <a
                key={item.id}
                href={`/${item.slug}`}
                className="flex-shrink-0 whitespace-nowrap rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-300 lg:text-sm"
              >
                <div className="flex flex-row items-center justify-center gap-2">
                  {item.logo && (
                    <img
                      src={`${IMAGE_BASE_URL}${item.logo}`}
                      alt={item.name}
                      className="mb-1 h-8 w-auto object-contain lg:h-12"
                    />
                  )}
                  <p className="text-sm text-black">{item.name}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Brands Section (Giữ nguyên) */}
      {brands.length > 0 && (
        <div className="flex w-full justify-center">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto px-1 py-3">
            {visibleBrands.map((brand) => (
              <a
                key={brand.id}
                href={`/${brand.slug}`}
                className="flex-shrink-0 whitespace-nowrap rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition duration-150 hover:border-red-500 hover:text-red-600 lg:text-sm"
              >
                {brand.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Swiper Section (Sử dụng currentData) */}
      <Swiper
        modules={[Grid]}
        spaceBetween={14}
        slidesPerView={2}
        grid={{ rows: 2, fill: "row" }}
        onSwiper={setSwiper}
        onSlideChange={(s) => {
          setIsBeginning(s.isBeginning);
          setIsEnd(s.isEnd);
        }}
        // Reset Swiper on category change (key change forces re-render)
        key={selectedCategory}
        breakpoints={{
          640: { slidesPerView: 3, grid: { rows: 2, fill: "row" } },
          1024: { slidesPerView: 4, grid: { rows: 2, fill: "row" } },
        }}
        className="mySwiper h-auto"
      >
        {currentData.map((product) => {
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
            <SwiperSlide key={product.id}>
              <a
                href={`/san-pham/${product.slug}`}
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

                  <p className="mb-6 mt-2 line-clamp-2 h-auto rounded bg-gray-200 p-1 text-[10px] font-semibold text-black lg:mb-10 lg:text-xs">
                    {promoText}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs lg:mt-12">
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
      {/* Navigation buttons (Giữ nguyên) */}
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

export default CategoryProductSwiper;
