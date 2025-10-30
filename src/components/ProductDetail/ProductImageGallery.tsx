import React, { useState, useMemo, useEffect } from "react";
// ⚠️ You'll need to install swiper: npm install swiper
import { Swiper, SwiperSlide } from "swiper/react";
// 引入 SwiperCore
import SwiperCore from "swiper";
// Import các module cần thiết. Pagination (nếu muốn) và A11y
import { A11y, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
// Thêm style cho Pagination
import "swiper/css/pagination";

const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

// --- Interfaces (kept as is) ---
interface Variant {
  id: number;
  sku: string;
  thumbnail: string;
}

interface Rating {
  total: string;
  average: string;
}

interface Product {
  name: string;
  thumbnail: string;
  variants: Variant[];
  rating: Rating;
}

interface ProductImageGalleryProps {
  productData: Product;
  selectedVariantId: number;
}

interface ThumbnailItem {
  url: string;
  isVariant: boolean;
  id: number;
}

// --- Helper Functions (kept as is) ---
const buildImageUrl = (url: string): string => {
  return `${IMAGE_BASE_URL}${url}`;
};

const FeatureTabs = [{ label: "Nổi bật", icon: "⭐", isSelected: true }];

// --- SimpleStarRating Component (kept as is) ---
const SimpleStarRating: React.FC<Rating> = ({ average, total }) => {
  const avg = parseFloat(average);
  const totalReviews = parseInt(total);

  return (
    <div className="flex items-center space-x-2 text-base">
      <Star
        className="h-4 w-4 flex-shrink-0 fill-yellow-400 text-yellow-400"
        fill="currentColor"
      />
      <span className="font-semibold text-red-600">{avg.toFixed(1)}</span>
      <span className="text-gray-500">({totalReviews} đánh giá)</span>
    </div>
  );
};

// --- ProductImageGallery Component (Modified to use Swiper for main image) ---
export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productData,
  selectedVariantId,
}) => {
  const { name, thumbnail, variants, rating } = productData;

  // State để lưu instance của Swiper ảnh chính
  const [mainSwiper, setMainSwiper] = useState<SwiperCore | null>(null);

  const allThumbnails: ThumbnailItem[] = useMemo(() => {
    const primaryImage: ThumbnailItem = {
      url: thumbnail,
      isVariant: false,
      id: 0,
    };

    const variantImages: ThumbnailItem[] = variants.map((v) => ({
      url: v.thumbnail,
      isVariant: true,
      id: v.id,
    }));

    // Start with primary image, then variants
    return [primaryImage, ...variantImages];
  }, [thumbnail, variants]);

  // State để theo dõi index ảnh hiện tại
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const totalImages = allThumbnails.length;

  const selectedVariantIndex: number = useMemo(() => {
    // Tìm index của variant đã chọn trong allThumbnails
    const index = allThumbnails.findIndex(
      (item) => item.id === selectedVariantId && item.isVariant,
    );
    return index !== -1 ? index : 0;
  }, [selectedVariantId, allThumbnails]);

  // --- EFFECT: Đồng bộ khi biến thể (variant) thay đổi ---
  useEffect(() => {
    // Nếu biến thể thay đổi, trượt Swiper đến vị trí mới
    if (mainSwiper && selectedVariantIndex !== currentImageIndex) {
      mainSwiper.slideTo(selectedVariantIndex);
      // currentImageIndex sẽ được cập nhật bởi onSlideChange
    } else if (mainSwiper && selectedVariantIndex === 0) {
      // Trường hợp biến thể bị hủy chọn, đảm bảo trượt về ảnh chính
      mainSwiper.slideTo(0);
    }
  }, [selectedVariantId, selectedVariantIndex, mainSwiper]);

  // --- HANDLERS CHO ĐIỀU HƯỚNG BẰNG BUTTON ---
  const handleNext = (): void => {
    if (mainSwiper) {
      mainSwiper.slideNext();
    }
  };

  const handlePrev = (): void => {
    if (mainSwiper) {
      mainSwiper.slidePrev();
    }
  };

  // --- HANDLER CHO THUMBNAIL CLICK ---
  const handleThumbnailClick = (index: number): void => {
    if (mainSwiper) {
      mainSwiper.slideTo(index);
    }
  };
  // --------------------------------------------------------

  // Kết hợp FeatureTabs và allThumbnails cho Thumbnail Swiper
  const swiperContent = [
    ...FeatureTabs.map((tab) => ({ ...tab, isTab: true })),
    ...allThumbnails.map((item) => ({ ...item, isTab: false })),
  ];

  return (
    <div className="product-gallery w-full">
      <h1 className="pb-4 text-base font-bold lg:text-xl">{name}</h1>
      <div className="mb-4">
        <SimpleStarRating average={rating.average} total={rating.total} />
      </div>

      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg bg-white">
        <Swiper
          onSwiper={setMainSwiper}
          // 2. Cập nhật state khi trượt
          onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
          // 3. Thiết lập index ban đầu
          initialSlide={currentImageIndex}
          // Thêm các module cần thiết
          modules={[A11y, Pagination]}
          speed={300} // Tốc độ trượt
          loop={true} // Lặp lại khi hết ảnh
          pagination={{
            type: "fraction", // Hiển thị số trang
            el: ".swiper-pagination-custom", // Chỉ định class cho pagination
          }}
          className="h-full w-full"
        >
          {/* Lặp qua allThumbnails để tạo slide cho ảnh chính */}
          {allThumbnails.map((item, index) => (
            <SwiperSlide key={`main-slide-${item.url}`}>
              <div className="flex h-full w-full items-center justify-center">
                <img
                  src={buildImageUrl(item.url)}
                  alt={`${name} - ${index + 1}`}
                  className="h-full w-56 object-contain transition-opacity duration-300"
                />
              </div>
            </SwiperSlide>
          ))}

          {/* Hiển thị số trang tùy chỉnh (fraction) */}
          <div className="swiper-pagination-custom absolute bottom-3 left-4 z-10 px-2 text-xs font-bold text-black">
            {currentImageIndex + 1}/{totalImages}
          </div>
        </Swiper>

        {/* Navigation Buttons cho Main Image (Sử dụng handlePrev/Next mới) */}
        <button
          onClick={handlePrev}
          className="group absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition hover:bg-black/50"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="h-5 w-5 transition group-hover:scale-110" />
        </button>
        <button
          onClick={handleNext}
          className="group absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition hover:bg-black/50"
          aria-label="Ảnh kế tiếp"
        >
          <ChevronRight className="h-5 w-5 transition group-hover:scale-110" />
        </button>
      </div>

      {/* Thumbnail Bar with Swiper */}
      {/* ⚠️ ĐÃ SỬA: Đổi className để căn giữa Swiper */}
      <div className="product-thumbnails-swiper relative flex justify-center">
        <Swiper
          modules={[A11y]}
          spaceBetween={8} // Space between slides
          slidesPerView={"auto"} // Auto width for slides
          className="w-auto pb-2" // Đã đổi từ 'w-full' sang 'w-auto'
        >
          {swiperContent.map((item, index) => {
            const imageIndex = index - FeatureTabs.length;
            const isSelected = !item.isTab && imageIndex === currentImageIndex;

            if (item.isTab) {
              return (
                <SwiperSlide key={`tab-${index}`} className="!w-fit">
                  <button className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-white text-xs font-medium shadow-lg transition">
                    <span className="text-xl">{item.icon}</span> {item.label}
                  </button>
                </SwiperSlide>
              );
            } else {
              return (
                <SwiperSlide key={`thumb-${item.url}`} className="!w-fit">
                  <div
                    onClick={() => handleThumbnailClick(imageIndex)}
                    className={`flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 bg-white ${
                      isSelected
                        ? "border-red-600"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <img
                      src={buildImageUrl(item.url)}
                      alt={`Variant ${item.id}`}
                      className="h-12 w-12 object-cover"
                    />
                  </div>
                </SwiperSlide>
              );
            }
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductImageGallery;
