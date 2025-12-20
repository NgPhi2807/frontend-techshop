// src/components/Cart/CartItem.tsx

import React, { useState } from "react";
import { formatCurrency } from "../../utils/currency";
import { useCartStore } from "../../stores/cartStore";
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

// CẬP NHẬT INTERFACE ITEM: Thêm availableStock
interface Item {
  variantId: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  basePrice: number;
  thumbnail: string;
  isSelected: boolean;
  availableStock: number; // ✨ Đã thêm trường tồn kho
}

interface Combo {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  isSelected: boolean;
}

interface CartItemProps {
  item: Item;
}

const availableCombos: Combo[] = [
  {
    id: 1,
    name: "Combo Sim TD149 kèm Bảo hành",
    price: 199000,
    originalPrice: 449000,
    isSelected: true,
  },
  {
    id: 2,
    name: "Combo eSIM TD149 kèm Bảo hành",
    price: 199000,
    originalPrice: 449000,
    isSelected: false,
  },
];

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const [combos, setCombos] = useState<Combo[]>(availableCombos);
  const quantity = item.quantity;
  const stock = item.availableStock; // Lấy giá trị tồn kho

  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const toggleItemSelection = useCartStore(
    (state) => state.toggleItemSelection,
  );

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;

    if (newQuantity <= 0) {
      handleRemove();
      return;
    }

    const maxAllowedQuantity = Math.min(99, stock);

    if (newQuantity > maxAllowedQuantity) {
      alert(`Số lượng tối đa cho sản phẩm này là ${maxAllowedQuantity}.`);
      return;
    }

    updateItemQuantity(item.variantId, newQuantity);
  };

  const handleRemove = () => {
    updateItemQuantity(item.variantId, 0);
  };

  const handleToggleSelection = () => {
    toggleItemSelection(item.variantId, !item.isSelected);
  };

  const handleToggleCombo = (comboId: number) => {
    setCombos((prevCombos) =>
      prevCombos.map((combo) =>
        combo.id === comboId
          ? { ...combo, isSelected: !combo.isSelected }
          : combo,
      ),
    );
  };

  return (
    <div className="mb-3 rounded-lg border border-gray-100 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex flex-grow items-start gap-3 lg:w-3/5 lg:flex-grow-0">
          <button
            onClick={handleToggleSelection}
            aria-checked={item.isSelected}
            role="checkbox"
            type="button"
            className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
              item.isSelected
                ? "border-red-600 bg-red-600 shadow-md"
                : "border-gray-300 bg-white hover:border-red-400"
            } `}
          >
            {item.isSelected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          {/* Ảnh */}
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 p-1 lg:h-20 lg:w-20">
            <img
              src={`${IMAGE_BASE_URL}${item.thumbnail}`}
              alt={item.name}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="mb-1 line-clamp-2 text-sm font-normal text-gray-900">
              {item.sku}
            </h4>

            <div className="flex flex-col gap-1 sm:items-start sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Màu:</span>
                <select
                  className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs"
                  value={item.color}
                  onChange={() => {}}
                >
                  <option value={item.color}>{item.color}</option>
                </select>
              </div>
              <div>
                {/* ✨ PHẦN HIỂN THỊ TỒN KHO ✨ */}
                {stock > 0 && (
                  <div className="flex items-center gap-1">
                    {/* Icon cảnh báo nhỏ */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-yellow-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100 2 1 1 0 000-2zm-1-4a1 1 0 00-2 0v4a1 1 0 002 0V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={`text-xs font-medium ${stock <= 5 ? "text-red-500" : "text-gray-600"}`}
                    >
                      {stock <= 5
                        ? `Còn ${stock} sản phẩm`
                        : `Còn hàng (${stock})`}
                    </span>
                  </div>
                )}
                {stock === 0 && (
                  <div className="text-xs font-medium text-red-500">
                    Sản phẩm này đã hết hàng
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 lg:flex-grow lg:flex-row lg:justify-end lg:pt-0">
          <div className="hidden flex-shrink-0 text-right lg:block lg:w-[150px]">
            <div className="text-base font-semibold text-red-600">
              {formatCurrency(item.price)}
            </div>
            {item.price !== item.basePrice && (
              <div className="text-xs text-gray-400 line-through">
                {formatCurrency(item.basePrice)}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end lg:hidden">
            <div className="mb-0.5 text-sm font-semibold text-red-600">
              {formatCurrency(item.price * quantity)}
            </div>
            <div className="text-xs text-gray-400 line-through">
              {formatCurrency(item.basePrice * quantity)}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center rounded border border-gray-300">
            <button
              onClick={() => handleQuantityChange(-1)} // Gửi ngay số lượng mới
              className="flex h-8 w-8 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50"
              disabled={quantity === 1} // Không cho giảm khi quantity = 1 (nên dùng nút xóa)
            >
              -
            </button>
            <input
              type="text"
              value={quantity}
              readOnly
              className="h-8 w-10 border-x border-gray-300 bg-white text-center text-sm"
            />
            <button
              onClick={() => handleQuantityChange(1)} // Gửi ngay số lượng mới
              className="flex h-8 w-8 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50"
              disabled={quantity >= stock || quantity >= 99} // Vô hiệu hóa nếu đạt max hoặc hết stock
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove} // Gửi số lượng 0
            className="flex-shrink-0 p-1 text-gray-400 transition-colors hover:text-red-500 lg:ml-2"
            aria-label="Xóa sản phẩm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
