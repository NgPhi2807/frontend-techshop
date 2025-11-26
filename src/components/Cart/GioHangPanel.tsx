// src/components/Cart/GioHangPanel.tsx

import React, { useMemo, useEffect } from "react"; // 👈 THÊM useEffect
import { formatCurrency } from "../../utils/currency";
import { useCartStore } from "../../stores/cartStore";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { CheckoutPanel } from "./CheckoutPanel";
import emptycart from "../../assets/empty_cart.png";

interface CalculableItem {
  basePrice: number;
  price: number;
  quantity: number;
  isSelected: boolean;
}

const calculateCartTotals = (items: CalculableItem[]) => {
  const selectedItems = items.filter((item) => item.isSelected);

  const tongTien = selectedItems.reduce(
    (sum, item) => sum + item.basePrice * item.quantity,
    0,
  );
  const canThanhToan = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tongKhuyenMai = tongTien - canThanhToan;
  const giamGiaSanPham = tongKhuyenMai;
  const voucher = 0;

  return {
    tongTien,
    tongKhuyenMai: -tongKhuyenMai,
    giamGiaSanPham,
    voucher,
    canThanhToan,
   
  };
};

export const GioHangPanel: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const isCheckingOut = useCartStore((state) => state.isCheckingOut);
  const toggleCheckoutMode = useCartStore((state) => state.toggleCheckoutMode);
  const setCheckoutItems = useCartStore((state) => state.setCheckoutItems);
  const removeSelectedItems = useCartStore(
    (state) => state.removeSelectedItems,
  );
  const toggleAllItemsSelection = useCartStore(
    (state) => state.toggleAllItemsSelection,
  );
  // 👈 Lấy hàm fetchServerCart từ store
  const fetchServerCart = useCartStore((state) => state.fetchServerCart);

  // 💥 Dùng useEffect để gọi fetchServerCart khi component được mount
  useEffect(() => {
    fetchServerCart();
  }, [fetchServerCart]); // Chạy 1 lần khi component được tạo

  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const selectedItems = items.filter((item) => item.isSelected);
  const selectedCount = selectedItems.length;
  const totalItemsCount = items.length;
  const allItemsSelected =
    items.length > 0 && selectedCount === totalItemsCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalItemsCount;
  const handleToggleAll = () => {
    const newSelectedState = !allItemsSelected;
    toggleAllItemsSelection(newSelectedState);
  };
  const handleRemoveSelected = () => {
    if (selectedCount === 0) {
      alert("Vui lòng chọn sản phẩm để xóa.");
      return;
    }
    if (
      window.confirm(`Bạn có chắc muốn xóa ${selectedCount} sản phẩm đã chọn?`)
    ) {
      removeSelectedItems();
    }
  };

  const handleStartCheckout = () => {
    if (selectedCount === 0) {
      alert("Vui lòng chọn sản phẩm để thanh toán.");
      return;
    }
    const itemsToCheckout = selectedItems.map(
      ({ isSelected, ...rest }) => rest,
    );
    setCheckoutItems(itemsToCheckout);
    toggleCheckoutMode(true);
  };

  const handlePlaceOrder = () => {
    alert(
      "🎉 Đơn hàng đã được ĐẶT THÀNH CÔNG! (Tổng: " +
        formatCurrency(totals.canThanhToan) +
        ")",
    );
    toggleCheckoutMode(false);
  };

  const handleGoBack = () => {
    toggleCheckoutMode(false);
  };

  if (items.length === 0 && !isCheckingOut) {
    return (
      <div className="flex flex-row gap-2 rounded-3xl bg-white shadow-xl">
        <div className="flex w-full flex-col justify-center p-6 lg:basis-[60%] lg:p-12">
          <p className="text-base font-semibold text-black lg:text-3xl">
            Chưa có sản phẩm nào trong giỏ hàng
          </p>
          <p className="mt-4 text-sm text-gray-700 lg:text-base">
            Hãy thêm sản phẩm từ trang chi tiết sản phẩm.
          </p>
          <a
            href="/"
            className="mt-6 inline-block w-fit rounded-full bg-[linear-gradient(0deg,#d70018,#e45464)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-red-400/40 active:scale-95"
          >
            🛒 Mua ngay
          </a>
        </div>
        <div className="hidden basis-[40%] p-2 sm:block">
          <img
            src={emptycart.src}
            className="h-full w-full object-cover px-2 lg:px-12"
            alt="Giỏ hàng trống"
          />
        </div>
      </div>
    );
  }

  if (isCheckingOut) {
    return (
      <CheckoutPanel
        totals={totals}
        handlePlaceOrder={handlePlaceOrder}
        handleGoBack={handleGoBack}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="col-span-1 md:col-span-2">
        <div className="mb-4 flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
          <label
            onClick={handleToggleAll}
            className="flex cursor-pointer items-center text-base font-semibold text-gray-800"
          >
            <div
              role="checkbox"
              aria-checked={
                allItemsSelected ? "true" : isIndeterminate ? "mixed" : "false"
              }
              className={`mr-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                allItemsSelected
                  ? "border-red-600 bg-red-600 shadow-md"
                  : isIndeterminate
                    ? "border-red-600 bg-white"
                    : "border-gray-300 bg-white hover:border-red-400"
              } `}
            >
              {(allItemsSelected || isIndeterminate) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${isIndeterminate ? "text-red-600" : "text-white"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {isIndeterminate ? (
                    <path
                      fillRule="evenodd"
                      d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
              )}
            </div>
            Chọn tất cả ({selectedCount}/{totalItemsCount})
          </label>
          <button
            onClick={handleRemoveSelected}
            className={`transition-colors ${selectedCount > 0 ? "text-red-500 hover:text-red-700" : "cursor-not-allowed text-gray-400"}`}
            disabled={selectedCount === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
        {items.map((item) => (
          <CartItem key={item.variantId} item={item} />
        ))}
      </div>

      <CartSummary
        totals={totals}
        selectedCount={selectedCount}
        handleCheckout={handleStartCheckout}
      />
    </div>
  );
};
