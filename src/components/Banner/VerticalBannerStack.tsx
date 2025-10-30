import React from "react";

// Định nghĩa Interface cho dữ liệu Banner
interface BannerItem {
  id: number;
  src: string;
  alt: string;
  href: string;
}

interface VerticalBannerStackProps {
  data: BannerItem[];
}

/**
 * Component hiển thị một chồng (stack) các banner dọc.
 * Nhận dữ liệu (data) là mảng các BannerItem.
 */
const VerticalBannerStack: React.FC<VerticalBannerStackProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null; // Không hiển thị nếu không có dữ liệu
  }

  return (
    <div className="flex h-full w-full flex-col gap-3">
      {data.map((banner) => (
        <a
          href={banner.href}
          key={banner.id}
          // Sử dụng flex-1 để đảm bảo các banner chiếm đều chiều cao trong container
          className="flex-1 overflow-hidden rounded-lg border border-gray-200 transition duration-300 hover:border-rose-300 hover:shadow-lg"
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

export default VerticalBannerStack;
