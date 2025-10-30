// src/components/HeroMainBanner.tsx
import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules"; // Đã thêm Pagination
const navSlideData = [
  {
    id: 0,
    title: "IPHONE 17 SERIES",
    subtitle: "Mua ngay",
    src: "/src/assets/iphone17.webp",
    alt: "iPhone 17 Banner",
  },
  {
    id: 1,
    title: "GALAXY S25 ULTRA",
    subtitle: "Giá tốt chốt ngay",
    src: "/src/assets/s25.webp",
    alt: "Galaxy S25 Banner",
  },
  {
    id: 2,
    title: "XIAOMI 15T SERIES",
    subtitle: "Ưu đãi đến 5 triệu++",
    src: "/src/assets/xiaomi.webp",
    alt: "Xiaomi 15T Banner",
  },
  {
    id: 3,
    title: "IPHONE AIR",
    subtitle: "Nhanh tay sở hữu",
    src: "/src/assets/690x300_iPhone_Air_opensale_v3.webp",
    alt: "AirPods Pro 3 Banner",
  },
  {
    id: 4,
    title: "HONOR MAGIC",
    subtitle: "Ưu đãi quà 12",
    src: "/src/assets/honor-magic-v5-home.webp",
    alt: "Honor Magic Banner",
  },
];

const bottomBannerData = [
  {
    id: 0,
    src: "/src/assets/Camp-laptop-T9_Right-banner-1.webp", // Giả định các file này tồn tại
    alt: "Bottom Banner 1",
  },
  {
    id: 1,
    src: "/src/assets/AW11-right-banner.webp",
    alt: "Bottom Banner 2",
  },
  {
    id: 2,
    src: "/src/assets/Right-S25-FE.webp",
    alt: "Bottom Banner 3",
  },
];

const HeroMainBanner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideToLoop(index);
    }
  };

  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const renderNavItem = (item: (typeof navSlideData)[0]) => {
    const isActive = item.id === activeIndex;

    return (
      <div
        key={item.id}
        className={`hidden relative z-10 sm:flex min-w-[150px] flex-shrink-0 cursor-pointer flex-col items-center p-2 transition-all duration-200 ease-in-out ${
          isActive
            ? "bg-gray-200 text-red-600 shadow-md"
            : "bg-white text-gray-700 hover:text-red-600"
        }`}
        onClick={() => handleTabClick(item.id)}
      >
        <p className={`m-0 text-xs font-bold leading-tight lg:m-1`}>
          {item.title}
        </p>
        <p
          className={`m-0 mt-1 text-[12px] leading-none ${
            isActive ? "text-gray-600" : "text-gray-500"
          }`}
        >
          {item.subtitle}
        </p>
      </div>
    );
  };

  return (
    <main className="flex h-full flex-grow flex-col">
      <div className="hide-scrollbar mx-0 flex flex-nowrap justify-center overflow-x-auto scroll-smooth rounded-t-lg bg-white md:mx-3">
        {navSlideData.map((item) => renderNavItem(item))}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="group flex flex-1 gap-4 px-0 md:px-3">
          <div className="relative h-full flex-1 overflow-hidden rounded-lg lg:rounded-none lg:rounded-b-lg border bg-white shadow-lg">
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 transform rounded-r-full bg-black/50 py-3 text-white opacity-0 transition duration-300 group-hover:opacity-100 md:block md:opacity-0"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 transform rounded-l-full bg-black/50 py-3 text-white opacity-0 transition duration-300 group-hover:opacity-100 md:block md:opacity-0"
            >
              <ChevronRight className="h-7 w-7" />
            </button>

            <Swiper
              ref={swiperRef}
              modules={[Autoplay, Pagination]} // Đã thêm Pagination module
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              initialSlide={activeIndex}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }} // Thuộc tính này sẽ được kích hoạt
              className="h-full w-full"
              onSlideChange={(swiper) => {
                setActiveIndex(swiper.realIndex);
              }}
            >
              {navSlideData.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="aspect-[16/8] h-full w-full object-cover lg:aspect-[16/7]"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HeroMainBanner;