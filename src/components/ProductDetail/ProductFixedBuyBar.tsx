// ProductFixedBuyBar.tsx

import React, { useMemo, useState, useEffect } from "react";
import { Check, ShoppingCart, Loader2 } from "lucide-react";

interface ColorVariant {
  id: number;
  colorName: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  sku: string;
  availableStock: number;
}
interface ProductData {
  id: number;
  name: string;
  variants: any[];
  siblings: any[];
  detail: {
    msrp: string;
    storage: string;
  };
}

interface ProductFixedBuyBarProps {
  currentVariant: ColorVariant;
  productData: ProductData;
  isOutOfStock: boolean;
  isAdding: boolean;
  addedSuccessfully: boolean;
  handleAddToCart: () => void;
}
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL || "";
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Đặt ngưỡng đệm (buffer) tính từ cuối trang.
// Thanh sẽ biến mất khi người dùng cách cuối trang 300px.
const SCROLL_BUFFER = 300;

export const ProductFixedBuyBar: React.FC<ProductFixedBuyBarProps> = ({
  currentVariant,
  productData,
  isOutOfStock,
  isAdding,
  addedSuccessfully,
  handleAddToCart,
}) => {
  // ✅ Mặc định isVisible là TRUE
  const [isVisible, setIsVisible] = useState(true);

  // Logic theo dõi sự kiện cuộn để ẩn thanh khi gần cuối trang
  useEffect(() => {
    const toggleVisibility = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Tính toán khoảng cách từ vị trí hiện tại đến cuối trang
      const distanceFromBottom = scrollHeight - clientHeight - scrollTop;

      // ✅ Đảo ngược logic: Ẩn thanh khi người dùng cuộn đến gần cuối (ví dụ: cách 300px)
      if (distanceFromBottom <= SCROLL_BUFFER) {
        setIsVisible(false); // Ẩn thanh
      } else {
        setIsVisible(true); // Hiện thanh
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Chạy lần đầu để kiểm tra
    toggleVisibility();

    // Dọn dẹp: Gỡ bỏ event listener khi component unmount
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const cartButtonContent = useMemo(() => {
    if (isOutOfStock) {
      return (
        <>
          <span className="px-2 text-xs lg:text-base">Hết hàng</span>{" "}
        </>
      );
    }
    if (isAdding) {
      return (
        <>
          <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
        </>
      );
    }
    if (addedSuccessfully) {
      return (
        <>
          <Check size={18} strokeWidth={2.5} />{" "}
        </>
      );
    }
    return (
      <>
        <div className="flex flex-row items-center justify-center gap-2">
          <ShoppingCart size={18} strokeWidth={2.5} />
          <span className="text-xs font-bold lg:text-sm">Thêm vào giỏ</span>
        </div>
      </>
    );
  }, [isAdding, addedSuccessfully, isOutOfStock]);

  return (
    <>
      {/* Sử dụng isVisible để điều khiển hiển thị */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 m-2 mx-2 max-w-screen-lg rounded-lg border bg-white p-4 shadow-xl transition-transform duration-300 ease-in-out lg:mx-auto ${
          isVisible
            ? "translate-y-0 opacity-100" // Hiện: Dịch chuyển về vị trí ban đầu
            : "pointer-events-none translate-y-full opacity-0" // Ẩn: Dịch chuyển ra khỏi màn hình
        } `}
      >
        <div className="">
          <div className="relative">
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="flex w-full items-center space-x-2 md:w-3/5">
                <img
                  src={`${IMAGE_BASE_URL}${currentVariant.thumbnail}`}
                  alt={productData.name}
                  className="h-10 w-10 rounded-md border border-gray-200 object-contain"
                />
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="text-xs font-semibold text-gray-800 lg:text-sm">
                    {productData.name} {productData.detail.storage} | VN/A -{" "}
                    {currentVariant.colorName}
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-bold text-red-600 lg:text-base">
                      {formatCurrency(currentVariant.price)}
                    </span>
                    {currentVariant.price !== currentVariant.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through lg:text-xs">
                        {formatCurrency(currentVariant.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-row justify-end gap-2 md:w-2/5">
                <button
                  disabled={isOutOfStock}
                  className={`flex basis-3/5 flex-col items-center justify-center gap-1 rounded-lg py-2 font-bold text-white transition-all duration-300 ease-in-out md:basis-[70%] ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-gray-400 opacity-70"
                      : "bg-[linear-gradient(0deg,#d70018,#e45464)] hover:shadow-lg hover:shadow-red-400/40 active:scale-95"
                  }`}
                >
                  <span className="text-sm font-bold">Mua Ngay</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || addedSuccessfully || isOutOfStock}
                  className={`flex basis-2/5 flex-col items-center justify-center gap-1 rounded-lg border py-2 font-bold transition-all duration-300 ease-in-out active:scale-95 md:basis-[40%] lg:flex-row lg:py-3 ${
                    isAdding || addedSuccessfully || isOutOfStock
                      ? "cursor-not-allowed opacity-70"
                      : "hover:bg-red-50"
                  } ${
                    addedSuccessfully
                      ? "border-green-500 bg-green-500 text-white hover:bg-green-500"
                      : isOutOfStock
                        ? "border-gray-400 bg-white text-gray-400"
                        : "border-red-500 bg-white text-red-500"
                  }`}
                >
                  {cartButtonContent}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
