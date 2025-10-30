import React from "react";

const bottomBannerData = [
  {
    id: 0,
    src: "/src/assets/dienthoaihaypng_1681264414.png",
    alt: "Bottom Banner 1",
  },
];

const BottomBanner: React.FC = () => {
  return (
    <div className="h-[80px]">
      {bottomBannerData.map((banner) => (
        <a href="#" key={banner.id}>
          <img
            src={banner.src}
            alt={banner.alt}
            className="h-full w-full rounded-md object-cover"
          />
        </a>
      ))}
    </div>
  );
};

export default BottomBanner;
