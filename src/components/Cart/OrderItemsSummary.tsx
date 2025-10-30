import React from "react";
import { formatCurrency } from "../../utils/currency";
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

interface CheckoutItem {
  variantId: number;
  sku: string;
  name: string;
  price: number;
  basePrice: number;
  color: string;
  thumbnail: string;
  quantity: number;
}

interface OrderItemsSummaryProps {
  checkoutItems: CheckoutItem[];
}

const OrderItemsSummary: React.FC<OrderItemsSummaryProps> = ({
  checkoutItems,
}) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h3 className="mb-4 text-lg font-bold text-gray-800">
        Sản phẩm trong đơn ({checkoutItems.length})
      </h3>
      {checkoutItems.map((item) => (
        <div
          key={item.variantId}
          className="flex items-start justify-between border-b border-gray-100 py-3 last:border-b-0"
        >
          <div className="flex gap-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 p-2">
              <img
                src={`${IMAGE_BASE_URL}${item.thumbnail}`}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">{item.name}</p>

              <p className="text-xs text-gray-500">
                Màu: {item.color} | SL: {item.quantity}
              </p>
            </div>
          </div>

          <div className="ml-4 flex-shrink-0 text-right">
            <span className="text-base font-semibold text-red-600">
              {formatCurrency(item.price * item.quantity)}
            </span>

            <span className="block text-xs text-gray-400 line-through">
              {formatCurrency(item.basePrice * item.quantity)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItemsSummary;
