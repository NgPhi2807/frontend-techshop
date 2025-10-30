import React from "react";
import { formatCurrency } from "../../utils/currency";

interface Totals {
  tongTien: number;
  tongKhuyenMai: number;
  giamGiaSanPham: number;
  voucher: number;
  canThanhToan: number;
  diemThuong: number;
}

interface CartSummaryProps {
  totals: Totals;
  selectedCount: number;
  handleCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  totals,
  selectedCount,
  handleCheckout,
}) => {
  const {
    tongTien,
    tongKhuyenMai,
    giamGiaSanPham,
    voucher,
    canThanhToan,
    diemThuong,
  } = totals;

  return (
    <div className="col-span-1 space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-800">🎁 Quà tặng</h4>
          <button className="text-sm font-medium text-blue-600 hover:underline">
            Xem quà (4)
          </button>
        </div>
      </div>
      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <button className="flex w-full items-center justify-between text-base font-semibold text-red-600 hover:opacity-80">
          <span>🔖 Chọn hoặc nhập ưu đãi</span> <span>&gt;</span>
        </button>
        <hr className="border-gray-100" />
        <button className="flex w-full items-center justify-center rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm font-medium text-yellow-800 hover:bg-yellow-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.7 12.3a1 1 0 101.4 1.4L13 10.4V14a1 1 0 102 0V9a1 1 0 00-1-1h-5a1 1 0 100 2h3.6l-2.5 2.5z"
              clipRule="evenodd"
            />
          </svg>
          Đăng nhập để sử dụng điểm thưởng
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-3 text-base font-bold text-gray-800">
          Thông tin đơn hàng
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Tổng tiền</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(tongTien)}
            </span>
          </div>
          <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
            <span>Tổng khuyến mãi</span>
            <span className="font-semibold text-red-600">
              {formatCurrency(tongKhuyenMai)}
            </span>
          </div>
          <div className="ml-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-xs">– Giảm giá sản phẩm</span>
              <span className="text-xs text-red-600">
                {formatCurrency(giamGiaSanPham)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">- Voucher</span>
              <span className="text-xs font-semibold text-gray-800">
                {formatCurrency(voucher)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-base font-bold text-gray-800">
            Cần thanh toán
          </span>
          <span className="text-2xl font-extrabold text-red-600">
            {formatCurrency(canThanhToan)}
          </span>
        </div>
        <div className="mt-2 text-right text-sm text-yellow-600">
          <div className="flex items-center justify-end"></div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={selectedCount === 0}
          className={`mt-4 w-full rounded-lg py-3 text-lg font-bold text-white shadow-lg transition duration-150 ${
            selectedCount > 0
              ? "bg-red-600 hover:bg-red-700"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          Xác nhận đơn hàng
        </button>
      </div>
    </div>
  );
};
