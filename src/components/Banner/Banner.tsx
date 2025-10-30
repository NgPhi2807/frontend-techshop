import React from "react";
// 1. Import Swiper components và modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

const bottomBannerData = [
  {
    id: 0,
    src: "/src/assets/595x100_iPhone_17_Pro_opensale_v3.webp",
    alt: "Bottom Banner 1",
  },
  {
    id: 1,
    src: "/src/assets/595x100_iPhone_17_Pro_opensale_v3.webp",
    alt: "Bottom Banner 2",
  },
  {
    id: 2,
    src: "/src/assets/595x100_iPhone_17_Pro_opensale_v3.webp",
    alt: "Bottom Banner 3",
  },
  {
    id: 3,
    src: "/src/assets/595x100_iPhone_17_Pro_opensale_v3.webp",
    alt: "Bottom Banner 4",
  },
];

const BottomBanner: React.FC = () => {
  return (
    // Swiper container
    <div className="mx-auto my-4 w-full">
      <Swiper
        // Modules sử dụng
        modules={[Autoplay]}
        slidesPerView={1}
        spaceBetween={12} // Khoảng cách giữa các slide
        breakpoints={{
          768: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
        }}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className="horizontal-banner-swiper overflow-hidden rounded-lg"
      >
        {/* Map dữ liệu vào SwiperSlide */}
        {bottomBannerData.map((banner) => (
          <SwiperSlide key={banner.id}>
            <a
              href="#"
              className="block h-[60px] overflow-hidden rounded-lg border border-gray-200 shadow-md transition duration-300 hover:shadow-lg lg:h-[90px]"
            >
              <img
                src={banner.src}
                alt={banner.alt}
                className="h-auto w-full object-fill"
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BottomBanner;
