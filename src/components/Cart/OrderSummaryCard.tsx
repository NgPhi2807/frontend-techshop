import React from "react";
import { formatCurrency } from "../../utils/currency";
interface Totals {
  tongTien: number;
  giamGiaSanPham: number;
  voucher: number;
  canThanhToan: number;
  diemThuong: number;
  tongKhuyenMai: number;
}

interface OrderSummaryCardProps {
  totals: Totals;
  handlePlaceOrder: () => Promise<void>;
  isPlacingOrder: boolean;
  isLoggedIn: boolean;
  handleSelectOffer: () => void;
  handleUseRewards: () => void;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  totals,
  handlePlaceOrder,
  isPlacingOrder,
  isLoggedIn,
  handleSelectOffer,
  handleUseRewards,
}) => {
  const rewardActionText = isLoggedIn
    ? `✨ Sử dụng ${formatCurrency(totals.diemThuong)} điểm thưởng`
    : "✨ Đăng nhập để sử dụng điểm thưởng";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <button
          onClick={handleSelectOffer}
          className="flex w-full items-center justify-between text-base font-semibold text-red-600 transition duration-150 hover:opacity-80"
        >
          <span>🔖 Chọn hoặc nhập ưu đãi</span> <span>&gt;</span>
        </button>
        <hr className="my-3 border-gray-100" />
        <button
          onClick={handleUseRewards}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-800 transition duration-150 hover:opacity-80"
        >
          <span>{rewardActionText}</span> <span>&gt;</span>
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
              {formatCurrency(totals.tongTien)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Tổng khuyến mãi</span>
            <span className="font-semibold text-red-600">
              - {formatCurrency(totals.tongKhuyenMai + totals.giamGiaSanPham)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Voucher</span>
            <span className="font-semibold text-red-600">
              - {formatCurrency(totals.voucher)}
            </span>
          </div>

          <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
            <span>Phí vận chuyển</span>
            <span className="font-semibold text-gray-800">Miễn phí</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-base font-bold text-gray-800">
            Cần thanh toán
          </span>

          <span className="text-2xl font-extrabold text-red-600">
            {formatCurrency(totals.canThanhToan)}
          </span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className={`mt-4 w-full rounded-lg py-3 text-lg font-bold text-white shadow-lg transition duration-150 ${
            isPlacingOrder
              ? "cursor-not-allowed bg-red-400"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isPlacingOrder ? "Đang xử lý..." : "Đặt hàng"}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Bằng cách xác nhận đơn hàng, bạn đồng ý với Điều khoản sử dụng và
          Chính sách xử lý dữ liệu cá nhân của FPT Shop.
        </p>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
