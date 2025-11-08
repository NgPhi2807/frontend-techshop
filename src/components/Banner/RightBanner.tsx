import React from "react";
import banner1 from "/src/assets/Camp-laptop-T9_Right-banner-1.webp";
import banner2 from "/src/assets/AW11-right-banner.webp";
import banner3 from "/src/assets/Right-S25-FE.webp";

const bottomBannerData = [
  {
    id: 0,
    src: banner1.src, 
    alt: "Bottom Banner 1",
  },
  {
    id: 1,
    src: banner2.src, 
    alt: "Bottom Banner 2",
  },
  {
    id: 2,
    src: banner3.src, 
    alt: "Bottom Banner 3",
  },
  {
    id: 3,
    src: banner3.src,
    alt: "Bottom Banner 3",
  },
];

const BottomBanner: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      {bottomBannerData.map((banner) => (
        <a
          href="#"
          key={banner.id}
          className="flex-1 overflow-hidden border border-gray-200 shadow-md"
        >
          <img
            src={banner.src}
            alt={banner.alt}
            className="h-full w-full object-cover"
          />
        </a>
      ))}
    </div>
  );
};

export default BottomBanner;