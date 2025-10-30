import React from "react";
interface PaymentMethodSelectionProps {
  paymentMethod: "cod" | "bank";
  setPaymentMethod: React.Dispatch<React.SetStateAction<"cod" | "bank">>;
}
const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-lg font-bold text-gray-800">
        Phương thức thanh toán
      </h3>
      <div className="flex flex-col space-y-3">
        <label
          className={`flex cursor-pointer items-center rounded-lg border-2 p-4 transition duration-200 ${
            paymentMethod === "cod"
              ? "border-red-600 bg-red-50 shadow-md"
              : "border-gray-300 hover:border-red-500"
          }`}
          htmlFor="payment-cod"
        >
          <input
            type="radio"
            id="payment-cod"
            name="payment"
            checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")}
            className="hidden" // Ẩn radio button gốc
          />

          <svg
            className={`mr-3 h-6 w-6 flex-shrink-0 ${
              paymentMethod === "cod" ? "text-red-600" : "text-gray-500"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            viewBox="0 0 56 56"
          >
            <path
              fill="currentColor"
              d="M29.885 53a1 1 0 0 0 .23-.08q.114-.057.23-.127l17.991-10.248q1.609-.92 2.447-2.102q.84-1.185.839-3.688v-17.9q0-1.057-.184-1.747L29.885 29.425zm-3.148 0V29.425L5.184 17.108Q5 17.798 5 18.855v17.9q0 2.505.85 3.688t2.436 2.102L26.3 52.793q.114.069.218.127a.8.8 0 0 0 .218.08m1.586-26.333l9.811-5.56l-21.76-12.431l-8.433 4.802q-.78.437-1.287.896zm13.005-7.376l8.64-4.917a7.3 7.3 0 0 0-1.264-.896L32.482 4.241Q30.345 3 28.322 3q-2.045 0-4.181 1.24l-4.665 2.643z"
            />
          </svg>

          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-800 lg:text-base">
              Thanh toán tiền mặt khi nhận hàng (COD)
            </p>
            <p className="text-[10px] text-gray-500 lg:text-xs">
              Thanh toán trực tiếp cho nhân viên giao hàng.
            </p>
          </div>

          {/* Hiển thị dấu check tùy chỉnh */}
          <div
            className={`ml-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
              paymentMethod === "cod"
                ? "border-red-600 bg-red-600"
                : "border-gray-300"
            }`}
          >
            {paymentMethod === "cod" && (
              <div className="h-2 w-2 rounded-full bg-white"></div>
            )}
          </div>
        </label>

        <label
          className={`flex cursor-pointer items-center rounded-lg border-2 p-4 transition duration-200 ${
            paymentMethod === "bank"
              ? "border-red-600 bg-red-50 shadow-md"
              : "border-gray-300 hover:border-red-500"
          }`}
          htmlFor="payment-bank"
        >
          <input
            type="radio"
            id="payment-bank"
            name="payment"
            checked={paymentMethod === "bank"}
            onChange={() => setPaymentMethod("bank")}
            className="hidden" // Ẩn radio button gốc
          />

          <svg
            className={`mr-3 h-6 w-6 flex-shrink-0 ${
              paymentMethod === "bank" ? "text-red-600" : "text-gray-500"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>

          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-800 lg:text-base">
              Thanh toán qua Ngân hàng/QR Code (BANK)
            </p>
            <p className="text-[10px] text-gray-500 lg:text-xs">
              Thanh toán chuyển khoản qua tài khoản ngân hàng hoặc quét QR.
            </p>
          </div>

          <div
            className={`ml-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
              paymentMethod === "bank"
                ? "border-red-600 bg-red-600"
                : "border-gray-300"
            }`}
          >
            {paymentMethod === "bank" && (
              <div className="h-2 w-2 rounded-full bg-white"></div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethodSelection;
