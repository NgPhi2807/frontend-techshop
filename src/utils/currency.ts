// src/utils/currency.ts (hoặc currency.tsx)

/**
 * Định dạng số tiền thành tiền tệ Việt Nam Đồng (VND).
 * @param amount - Số tiền cần định dạng.
 * @returns Chuỗi tiền tệ (ví dụ: "31.990.000₫").
 */
export const formatCurrency = (amount: number): string => {
  const integerAmount = Math.round(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(integerAmount);
};
