import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../utils/currency";

interface VariantOption {
  id: number;
  name: string;
  thumbnail: string;
  price: number;
  old_price: number;
  type_id: 1 | 2;
  type_name: "Dung lượng" | "Màu sắc";
}

interface Promotion {
  title: string;
  items: string[];
}

interface ProductDetailInfoProps {
  productName: string;
  rating: number;
  reviewCount: number;
  variants: VariantOption[];
  promotionData: Promotion;
}

const groupVariants = (variants: VariantOption[]) => {
  const groups: Record<string, VariantOption[]> = {};
  variants.forEach((v) => {
    if (!groups[v.type_name]) {
      groups[v.type_name] = [];
    }
    groups[v.type_name].push(v);
  });
  return groups;
};

const VariantOptionItem: React.FC<{
  option: VariantOption;
  isSelected: boolean;
  onClick: () => void;
}> = ({ option, isSelected, onClick }) => {
  const isColor = option.type_name === "Màu sắc";

  const colorMap: Record<string, string> = {
    Hồng: "bg-pink-300 border-pink-500",
    Đen: "bg-gray-800 border-gray-900 text-white",
    "Xanh dương": "bg-blue-300 border-blue-500",
    Vàng: "bg-yellow-300 border-yellow-500",
    "Xanh lá": "bg-green-300 border-green-500",
  };
  const colorClass = colorMap[option.name] || "bg-gray-100 border-gray-300";

  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isColor ? "flex h-16 w-16 flex-col items-center justify-center border" : "border"} ${
        isSelected
          ? "border-red-600 bg-red-50 text-red-600 ring-2 ring-red-300"
          : "border-gray-300 bg-white hover:border-red-300"
      } `}
    >
      {isColor ? (
        <>
          <div
            className={`h-4 w-4 rounded-full border border-gray-400 ${colorClass}`}
          />
          <span className="mt-1 text-xs text-gray-700">{option.name}</span>
        </>
      ) : (
        <span>{option.name}</span>
      )}
      {(option.name === "128 GB" || option.name === "Xanh lá") && (
        <span className="absolute -right-2 -top-2 rotate-6 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-md">
          Hot
        </span>
      )}
    </button>
  );
};

export const ProductDetailInfo: React.FC<ProductDetailInfoProps> = ({
  productName,
  rating,
  reviewCount,
  variants,
  promotionData,
}) => {
  const groupedVariants = useMemo(() => groupVariants(variants), [variants]);

  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: VariantOption;
  }>({});

  useMemo(() => {
    const initialSelection: { [key: string]: VariantOption } = {};
    Object.keys(groupedVariants).forEach((key) => {
      initialSelection[key] = groupedVariants[key][0];
    });
    setSelectedVariants(initialSelection);
  }, [groupedVariants]);

  const currentVariantPrice =
    selectedVariants[Object.keys(selectedVariants)[0]]?.price ||
    variants[0]?.price ||
    0;
  const currentVariantOldPrice =
    selectedVariants[Object.keys(selectedVariants)[0]]?.old_price ||
    variants[0]?.old_price ||
    0;
  const discountPercent =
    currentVariantOldPrice > 0
      ? Math.round(
          ((currentVariantOldPrice - currentVariantPrice) /
            currentVariantOldPrice) *
            100,
        )
      : 0;

  const bonusPoints = 4247;
  const installmentPayment = currentVariantPrice * 0.08;

  const handleVariantSelect = (variant: VariantOption) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variant.type_name]: variant,
    }));
  };

  return (
    <div className="product-info w-full p-4 lg:p-0">
      <h1 className="mb-1 text-2xl font-bold">{productName}</h1>
      <div className="mb-4 flex items-center border-b border-gray-200 pb-4 text-sm">
        <span className="mr-2 font-bold text-yellow-500">⭐ {rating}</span>
        <span className="mr-4 cursor-pointer font-medium text-blue-600 hover:underline">
          {reviewCount} đánh giá
        </span>
        <span className="cursor-pointer font-medium text-blue-600 hover:underline">
          Thông số kỹ thuật
        </span>
      </div>

      {Object.entries(groupedVariants).map(([typeName, options]) => (
        <div key={typeName} className="mb-6">
          <h3 className="mb-2 font-semibold text-gray-700">
            {typeName}:{" "}
            <span className="font-bold text-red-600">
              {selectedVariants[typeName]?.name || options[0].name}
            </span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {options.map((option) => (
              <VariantOptionItem
                key={option.id}
                option={option}
                isSelected={selectedVariants[typeName]?.id === option.id}
                onClick={() => handleVariantSelect(option)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="mb-6 flex items-center justify-between rounded-lg bg-orange-50 p-5 shadow-inner">
        <div className="flex flex-col">
          <span className="text-4xl font-extrabold text-red-600">
            {formatCurrency(currentVariantPrice)}
          </span>
          {currentVariantOldPrice > 0 && (
            <div className="mt-1 flex items-center">
              <span className="mr-2 text-sm text-gray-500 line-through">
                {formatCurrency(currentVariantOldPrice)}
              </span>
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                -{discountPercent}%
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
            <span>💰 +{formatCurrency(bonusPoints).replace("₫", "")}</span>
          </div>
        </div>

        <div className="mx-4 text-center font-semibold text-gray-500">Hoặc</div>

        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-gray-800">Trả góp</span>
          <span className="mt-1 text-2xl font-extrabold text-red-600">
            {formatCurrency(installmentPayment)}/tháng
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-pink-200 bg-pink-50 p-4 shadow-md">
        <h4 className="mb-3 flex items-center text-lg font-bold text-red-600">
          <span className="mr-2 text-2xl">🎁</span> {promotionData.title}
        </h4>
        <ul className="ml-5 list-disc space-y-2 text-gray-800">
          {promotionData.items.map((item, index) => (
            <li key={index} className="text-sm">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductDetailInfo;
