import React from "react";

const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL || "/";
import FavoriteButton from "../FavoriteButton/FavoriteButton";

interface Product {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  special_price: number;
  rating: { average: number } | null;
  promotion: {
    id: number;
    name: string;
    description: string;
    discountType: string;
    discountValue: number;
    startDate: string;
    endDate: string;
    status: string;
    scope: string;
  } | null;
}

interface ProductGridProps {
  products: Product[];
  categorySlug: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price);
const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categorySlug,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="col-span-full flex h-40 items-center justify-center p-4 text-center text-gray-500">
        Không tìm thấy sản phẩm theo tiêu chí này !!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => {
        const currentPrice = product.special_price;
        const originalPrice = product.price;

        const discountPercent =
          originalPrice > 0 && currentPrice < originalPrice
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;
        const initialIsFavorite = false;

        const hasDiscount = discountPercent > 0;
        const ratingValue = product.rating?.average || 0;
        const promoText =
          product.promotion?.description ||
          "Không phí chuyển đổi khi trả góp 0%...";

        return (
          <a
            href={`/san-pham/${product.slug}`}
            key={product.id}
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
              <div className="absolute left-0 top-0">
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

              <FavoriteButton
                productId={product.id}
                initialIsFavorite={initialIsFavorite}
              />
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default ProductGrid;
