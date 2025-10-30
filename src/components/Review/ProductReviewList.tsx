// src/components/ProductDetail/ProductReviewList.tsx
import React from "react";
import { StarIcon, ClockIcon } from "@heroicons/react/20/solid"; // Sử dụng ClockIcon cho ngày tháng
import { CheckBadgeIcon } from "@heroicons/react/24/outline"; // Dùng CheckBadgeIcon (outline)

// Định nghĩa TypeScript (giữ nguyên)
interface ReviewMedia {
  id: number;
  mediaType: string;
  url: string;
  altText: string | null;
}

interface ReviewCustomer {
  id: number;
  name: string;
}

interface ReviewItem {
  id: number;
  content: string;
  customer: ReviewCustomer;
  productId: number;
  createdAt: string;
  rating: number;
  medias: ReviewMedia[];
  purchased: boolean;
  // Giả định thêm thuộc tính cho các Tag/Badge (vì API hiện tại chưa có)
  attributes?: string[];
}

interface ReviewData {
  page: number;
  items: ReviewItem[];
  size: number;
  totalElements: number;
  totalPages: number;
}

interface ProductReviewListProps {
  data: ReviewData | null;
}

const renderStars = (rating: number) => {
  const stars = [];
  const ratingText = rating >= 5 ? "Tuyệt vời" : rating >= 4 ? "Tốt" : "Ổn";
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i <= rating ? "text-yellow-400" : "text-gray-300"
        } transition-colors`}
        aria-hidden="true"
      />,
    );
  }
  return (
    <div className="flex items-center space-x-1">
      <div className="space-1 flex items-center justify-center">{stars}</div>
      <span className="ml-4 text-xs font-normal text-gray-800">
        {ratingText}
      </span>
    </div>
  );
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  const seconds = 1;
  const minutes = 60 * seconds;
  const hours = 60 * minutes;
  const days = 24 * hours;
  const months = 30 * days;
  const years = 365 * days;

  if (diffInSeconds < minutes) {
    return `${diffInSeconds} giây trước`;
  } else if (diffInSeconds < hours) {
    const value = Math.floor(diffInSeconds / minutes);
    return `${value} phút trước`;
  } else if (diffInSeconds < days) {
    const value = Math.floor(diffInSeconds / hours);
    return `${value} giờ trước`;
  } else if (diffInSeconds < months) {
    const value = Math.floor(diffInSeconds / days);
    return `${value} ngày trước`;
  } else if (diffInSeconds < years) {
    const value = Math.floor(diffInSeconds / months);
    return `${value} tháng trước`;
  } else {
    const value = Math.floor(diffInSeconds / years);
    return `${value} năm trước`;
  }
};

// Hàm lấy chữ cái đầu
const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0]?.toUpperCase() || "U";
};

const ProductReviewList: React.FC<ProductReviewListProps> = ({ data }) => {
  if (!data || data.items.length === 0) {
    return (
      <div className="my-4 rounded-lg bg-gray-50 p-4 text-gray-500">
        Chưa có đánh giá nào cho sản phẩm này.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl pt-6">
      <div className="rounded-lg bg-white p-4">
        {data.items.map((review) => (
          <div key={review.id} className="px-2 py-4">
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="w-full flex-shrink-0 pr-4 lg:w-3/12">
                <div className="flex items-center justify-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-white shadow-md`}
                    style={{
                      backgroundColor: `#${((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")}`,
                    }}
                  >
                    {getInitials(review.customer.name)}
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="truncate text-base font-bold text-gray-800">
                      {review.customer.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-9/12">
                <div className="">{renderStars(review.rating)}</div>

                <p className="py-4 text-sm text-gray-700">{review.content}</p>

                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="mr-1 h-3.5 w-3.5" />
                  Đăng vào {formatTimeAgo(review.createdAt)}
                </div>
              </div>
              {/* {review.medias && review.medias.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.medias.map((media) => (
                  <img
                    key={media.id}
                    src={media.url}
                    alt={media.altText || "Review image"}
                    className="h-20 w-20 cursor-pointer rounded-md border object-cover transition hover:border-blue-500"
                  />
                ))}
              </div>
            )} */}
            </div>
          </div>
        ))}

        {data.totalPages > 1 && (
          <div className="pt-6 text-center">
            <button className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
              Xem thêm đánh giá
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewList;
