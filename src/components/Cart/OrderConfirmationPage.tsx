import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/currency";

const timeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
};

import {
  useCartStore,
  type OrderResponseData as BaseOrderResponseData,
} from "../../stores/cartStore";

interface PaymentInfo {
  type: "COD" | "BANK" | string;
  label: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  transferContent?: string;
  qrCodeUrl?: string;
  expireAt?: string;
  lifeTime?: string;
  _calculatedExpireTime?: number;
}

interface OrderResponseData extends Omit<BaseOrderResponseData, "paymentInfo"> {
  paymentInfo: PaymentInfo;
}

interface OrderConfirmationPageProps {
  orderId: string;
}

// --- CSS KEYFRAMES CHO QR CODE SCANNER ---
const SCANNER_ANIMATION_KEYFRAMES = `
    @keyframes scan {
        0% { top: 0; }
        50% { top: calc(100% - 2px); }
        100% { top: 0; }
    }
`;

const ScannerStyle = () => (
  <style dangerouslySetInnerHTML={{ __html: SCANNER_ANIMATION_KEYFRAMES }} />
);

// --- MAIN COMPONENT ---
const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
}) => {
  const lastOrderData = useCartStore(
    (state) => state.lastOrderData,
  ) as OrderResponseData | null;
  const clearCheckoutItems = useCartStore((state) => state.clearCheckoutItems);
  const clearOrderData = useCartStore((state) => state.clearOrderData);

  const [orderData, setOrderData] = useState<OrderResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isExpiredLocally, setIsExpiredLocally] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // State xác nhận thanh toán thành công
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const id = Number(orderId);

    const savedStatus = localStorage.getItem(`paid_status_${orderId}`);

    if (savedStatus) {
      try {
        const parsedStatus = JSON.parse(savedStatus);
        const now = Date.now();

        if (parsedStatus.expireAt && now < parsedStatus.expireAt) {
          setIsPaid(true);
          setIsLoading(false);
          return;
        } else {
          localStorage.removeItem(`paid_status_${orderId}`);
        }
      } catch (e) {
        localStorage.removeItem(`paid_status_${orderId}`);
      }
    }

    if (!orderId || isNaN(id)) {
      setError("Mã đơn hàng không hợp lệ.");
      setIsLoading(false);
      return;
    }

    let data: OrderResponseData | null = null;
    if (lastOrderData && lastOrderData.orderId === id) {
      data = lastOrderData;

      let initialCountdown = 0;
      const now = new Date().getTime();

      if (data.paymentInfo?._calculatedExpireTime) {
        const expireTime = data.paymentInfo._calculatedExpireTime;
        initialCountdown = Math.max(0, Math.floor((expireTime - now) / 1000));
      } else if (data.paymentInfo?.lifeTime) {
        initialCountdown = timeToSeconds(data.paymentInfo.lifeTime);
      } else if (data.paymentInfo?.expireAt) {
        const expireTime = new Date(data.paymentInfo.expireAt).getTime();
        initialCountdown = Math.max(0, Math.floor((expireTime - now) / 1000));
      }

      if (data.paymentInfo?.type === "BANK") {
        if (initialCountdown <= 0) {
          clearOrderData();
          setIsExpiredLocally(true);
          setCountdown(0);
        } else {
          setCountdown(initialCountdown);
        }
      } else {
        setCountdown(initialCountdown);
      }

      setOrderData(data);
      setError(null);
    } else {
      if (
        lastOrderData?.paymentInfo?.type === "BANK" &&
        Number(lastOrderData.orderId) === id &&
        lastOrderData.totalAmount !== undefined
      ) {
        setOrderData(lastOrderData);
        setIsExpiredLocally(true);
        setCountdown(0);
        setError(null);
      } else {
        setError("Không tìm thấy thông tin đơn hàng này hoặc đã hết hạn.");
      }
    }
    setIsLoading(false);
  }, [orderId, lastOrderData, clearOrderData]);

  useEffect(() => {
    if (!isPaid) return;

    const savedStatus = localStorage.getItem(`paid_status_${orderId}`);
    if (savedStatus) {
      const { expireAt } = JSON.parse(savedStatus);
      const timeLeft = expireAt - Date.now();

      if (timeLeft > 0) {
        const timeoutId = setTimeout(() => {
          localStorage.removeItem(`paid_status_${orderId}`);
          window.location.replace("/"); // Hoặc reload lại để hiện lỗi
        }, timeLeft);

        return () => clearTimeout(timeoutId);
      } else {
        localStorage.removeItem(`paid_status_${orderId}`);
        window.location.replace("/");
      }
    }
  }, [isPaid, orderId]);

  useEffect(() => {
    if (countdown === null || countdown <= 0 || !orderData) return;

    const timerId = setInterval(() => {
      setCountdown((prev) => {
        const next = prev !== null && prev > 0 ? prev - 1 : 0;
        if (
          next === 0 &&
          prev !== 0 &&
          orderData.paymentInfo?.type === "BANK"
        ) {
          clearOrderData();
          setIsExpiredLocally(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [countdown, clearOrderData, orderData]);

  useEffect(() => {
    const win = window as any;
    if (!win.SockJS || !win.Stomp) return;
    if (isPaid) return;
    const socket = new win.SockJS("https://api.motchillx.site/ws/public");
    const stompClient = win.Stomp.over(socket);
    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/${orderId}`, (msg: any) => {
        console.log("📩 New Message:", msg.body);
        let isSuccess = false;
        const body = msg.body;
        if (body === "PAID" || body === '"PAID"') {
          isSuccess = true;
        } else {
          try {
            const data = JSON.parse(body);
            if (data?.status === "PAID" || data === "PAID") {
              isSuccess = true;
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }

        if (isSuccess) {
          console.log("✅ Xác nhận thanh toán thành công!");

          const expireTime = Date.now() + 5 * 60 * 1000; 
          const statusData = {
            status: "PAID",
            expireAt: expireTime,
          };

          localStorage.setItem(
            `paid_status_${orderId}`,
            JSON.stringify(statusData),
          );

          clearOrderData();
          clearCheckoutItems();
          setIsPaid(true);
        }
      });
    });

    return () => {
      if (stompClient && stompClient.connected) stompClient.disconnect();
    };
  }, [orderId, clearOrderData, clearCheckoutItems, isPaid]);

  const formatCountdown = (
    totalSeconds: number | null,
  ): { time: string; expired: boolean; minutes: string; seconds: string } => {
    if (totalSeconds === null || totalSeconds <= 0) {
      return {
        time: "00 : 00",
        expired: isExpiredLocally,
        minutes: "00",
        seconds: "00",
      };
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    return {
      time: `${formattedMinutes} : ${formattedSeconds}`,
      expired: false,
      minutes: formattedMinutes,
      seconds: formattedSeconds,
    };
  };

  const handleGoToCart = () => {
    clearCheckoutItems();
    window.location.replace("/gio-hang");
  };

  const handleGoHome = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setIsRedirecting(true);
    clearCheckoutItems();
    window.location.replace("/");
  };

  const handleCancelOrder = () => {
    clearOrderData();
    clearCheckoutItems();
    window.location.replace("/gio-hang");
  };

  const {
    paymentInfo,
    grossAmount,
    directDiscount,
    voucherDiscount,
    totalAmount,
  } = orderData || {};

  const finalAmount = totalAmount ?? 0;
  const { minutes, seconds, expired } = formatCountdown(countdown);

  const isBankPayment =
    paymentInfo?.type === "BANK" &&
    paymentInfo?.bankAccountNumber &&
    paymentInfo?.qrCodeUrl;

  const isTransactionExpired = isBankPayment && isExpiredLocally;

 if (isPaid) {
   return (
     <div className="flex min-h-[60vh] items-center justify-center ">
       <div className="w-full max-w-xl p-10 text-center ">
         <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 shadow-lg">
           <svg
             className="h-14 w-14 text-red-600"
             fill="none"
             stroke="currentColor"
             viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg"
           >
             <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
             />
           </svg>
         </div>

         <h2 className="mb-2 text-3xl font-extrabold text-red-700">
           Thanh Toán Thành Công! 🎉
         </h2>

         {/* Nội dung */}
         <p className="text-lg text-gray-700">
           Đơn hàng <span className="font-bold text-red-600">#{orderId}</span>{" "}
           đã được xác nhận.
         </p>
         <p className="mt-3 text-sm italic text-gray-500">
           Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng ngay lập tức.
         </p>

         <div className="mt-8">
           <a
             href="/"
             onClick={handleGoHome}
             className="inline-block w-full rounded-xl bg-red-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition duration-300 hover:bg-red-700 hover:shadow-xl"
           >
             {isRedirecting ? "Đang chuyển hướng..." : "Về Trang Chủ"}
           </a>
         </div>

         {/* Ghi chú */}
         <div className="mt-4 text-xs text-gray-400">
           Trang này sẽ tự động đóng sau 5 phút.
         </div>
       </div>
     </div>
   );
 }
 

 // ------------------------------------------------
 // 2. MÀN HÌNH LOADING
 // ------------------------------------------------
 if (isLoading || isRedirecting) {
   return (
     <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
       <div className="flex flex-col items-center">
         <svg
           className="mb-3 h-8 w-8 animate-spin text-blue-600"
           xmlns="http://www.w3.org/2000/svg"
           fill="none"
           viewBox="0 0 24 24"
         >
           <circle
             className="opacity-25"
             cx="12"
             cy="12"
             r="10"
             stroke="currentColor"
             strokeWidth="4"
           ></circle>
           <path
             className="opacity-75"
             fill="currentColor"
             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
           ></path>
         </svg>
         <p className="text-xl font-semibold text-gray-700">
           {isRedirecting
             ? "Đang chuyển hướng..."
             : `Đang tải thông tin đơn hàng #${orderId}...`}
         </p>
       </div>
     </div>
   );
 }

 // ------------------------------------------------
 // 3. MÀN HÌNH LỖI (Cải tiến UI)
 // ------------------------------------------------
 if (error || !orderData) {
   return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
       <div className="w-full max-w-lg rounded-2xl border border-red-300 bg-white p-10 shadow-2xl">
         <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 shadow-xl">
           <svg
             className="h-14 w-14 text-red-600"
             fill="none"
             stroke="currentColor"
             viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg"
           >
             <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
             />
           </svg>
         </div>

         <h2 className="mb-2 text-3xl font-extrabold text-red-700">
           Liên Kết Đã Hết Hạn
         </h2>
         <p className="mb-6 text-lg text-gray-600">
           Giao dịch đã hoàn tất hoặc liên kết xác nhận đơn hàng không còn tồn
           tại.
         </p>
         <button
           onClick={handleGoHome}
           className="rounded-xl bg-blue-600 px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-blue-700"
         >
           Về trang chủ
         </button>
       </div>
     </div>
   );
 }

  return (
    <div className="flex">
      <ScannerStyle />

      <div className="w-full">
        {isTransactionExpired ? (
          <div className="flex w-full items-center justify-center px-4 py-14">
            <div className="animate-fadeIn w-full max-w-xl rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-2xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-md">
                <span className="text-5xl">⏰</span>
              </div>
              <h2 className="mb-3 text-2xl font-extrabold text-red-600 lg:text-3xl">
                Giao Dịch Đã Hết Hạn!
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-700 lg:text-lg">
                Thời gian để hoàn tất đơn hàng
                <span className="font-bold text-gray-900"> #{orderId} </span>
                đã kết thúc.
                <br />
                Vui lòng tiến hành đặt lại nếu bạn vẫn muốn mua sản phẩm.
              </p>
              <button
                onClick={handleGoToCart}
                className="mx-auto inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-red-700 hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H3m4 8v1a3 3 0 003 3h4a3 3 0 003-3v-1m-9-4h.01M17 12h.01"
                  />
                </svg>
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex w-full flex-col lg:flex-row lg:justify-center lg:space-x-8">
            <div className="mb-4 flex-1 overflow-hidden rounded-lg bg-white shadow-xl lg:mb-0 lg:w-2/3">
              <div className="mx-auto w-full rounded-t-lg border-b border-gray-100 bg-gray-50 p-4 text-center text-sm font-medium text-gray-700 shadow-sm">
                Vui lòng không tắt trình duyệt cho đến khi giao dịch được xác
                nhận!
              </div>
              <div className="p-8">
                {isBankPayment ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="mb-1 text-xl font-bold text-gray-800">
                        Quét hoặc tải mã QR để thanh toán bằng ứng dụng ngân
                        hàng
                      </h2>
                      <p className="text-sm text-gray-500">
                        Thanh toán qua {paymentInfo?.bankName || "Ngân hàng"}
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <div
                        className={`inline-block border-2 ${expired ? "border-red-400" : "border-gray-200"} rounded-lg p-3 transition-all duration-300`}
                      >
                        {expired ? (
                          <div className="flex h-48 w-48 items-center justify-center rounded-sm bg-gray-100">
                            <p className="text-base font-semibold text-red-600">
                              Giao dịch đã hết hạn
                            </p>
                          </div>
                        ) : (
                          <div className="relative h-48 w-48 overflow-hidden rounded-sm">
                            <img
                              src={paymentInfo?.qrCodeUrl}
                              alt="QR Code Thanh Toán"
                              className="h-full w-full object-contain"
                            />
                            <div
                              className="absolute left-0 h-0.5 w-full bg-red-500 shadow-md shadow-red-500/80"
                              style={{
                                animation: "scan 3s ease-in-out infinite",
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!expired && (
                      <div className="text-center">
                        <a
                          href={paymentInfo?.qrCodeUrl}
                          download={`order_${orderId}_qr.png`}
                          className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 transition duration-150 hover:text-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                            <path
                              fillRule="evenodd"
                              d="M10 2a1 1 0 011 1v7a1 1 0 11-2 0V3a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Tải xuống mã QR</span>
                        </a>
                      </div>
                    )}

                    <div className="mx-auto max-w-md space-y-3 pt-4">
                      <DetailRow
                        label="Ngân hàng:"
                        value={paymentInfo?.bankName}
                      />
                      <DetailRow
                        label="Số Tài Khoản:"
                        value={paymentInfo?.bankAccountNumber}
                      />

                      <DetailRow
                        label="Chủ tài khoản:"
                        value={paymentInfo?.bankAccountName}
                      />
                      <DetailRow
                        label="Nội dung chuyển khoản:"
                        value={paymentInfo?.transferContent}
                        isContent
                      />

                      <div className="my-4 h-px bg-gray-200"></div>

                      <DetailRow
                        label="Số tiền cần thanh toán:"
                        value={formatCurrency(finalAmount)}
                        isRed
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center text-base text-green-800">
                    <p className="mb-2 text-3xl">🎉</p>
                    <p className="mb-1 text-xl font-bold">
                      Đơn hàng #{orderId} đã được đặt thành công!
                    </p>
                    <p className="font-medium">
                      Phương thức: {paymentInfo?.label || "Thanh toán khác"}
                    </p>
                    <p className="mt-3 text-lg">
                      Bạn sẽ thanh toán **{formatCurrency(finalAmount)}** khi
                      nhận hàng.
                    </p>
                    <p className="mt-2 text-sm text-green-700">
                      Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn
                      hàng.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHỤ (Countdown & Order Summary) */}
            <div className="w-full lg:w-1/3">
              <div className="overflow-hidden rounded-lg bg-white p-6 shadow-xl">
                {isBankPayment && (
                  <div
                    className={`mb-6 border-b border-gray-100 bg-yellow-50 px-2 py-4 text-center ${expired ? "opacity-50" : ""}`}
                  >
                    <p className="mb-1 text-sm font-medium text-gray-500">
                      Giao dịch {expired ? "đã hết hạn" : "kết thúc trong"}
                    </p>

                    <div
                      className={`text-3xl font-extrabold ${expired ? "text-red-400" : "text-black"}`}
                    >
                      {minutes} : {seconds}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Phút : Giây
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="pb-2 text-lg font-bold text-gray-800">
                    Chi tiết đơn hàng
                  </h4>

                  <DetailRow label="Mã đơn hàng:" value={`#${orderId}`} />
                  <DetailRow
                    label="Phương thức TT:"
                    value={paymentInfo?.label || "Đang xử lý"}
                  />

                  <div className="space-y-2 border-t border-gray-200 pt-3">
                    <DetailRow
                      label="Tổng tiền hàng:"
                      value={formatCurrency(grossAmount ?? 0)}
                    />
                    <DetailRow
                      label="Chiết khấu trực tiếp:"
                      value={`-${formatCurrency(directDiscount ?? 0)}`}
                      isDiscount
                    />
                    <DetailRow
                      label="Chiết khấu voucher:"
                      value={`-${formatCurrency(voucherDiscount ?? 0)}`}
                      isDiscount
                    />
                    <DetailRow label="Phí vận chuyển:" value="Miễn phí" />
                  </div>

                  <div className="flex justify-between border-t border-gray-200 pt-4 font-bold">
                    <span className="text-gray-800">Cần thanh toán:</span>
                    <span className="text-xl font-extrabold text-red-600">
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                </div>

                {isBankPayment && (
                  <div className="pt-8 text-center">
                    <button
                      className="text-sm text-gray-400 transition hover:text-red-500 hover:underline"
                      onClick={handleCancelOrder}
                    >
                      Hủy giao dịch
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center p-6">
                <a
                  href="/"
                  className="w-full rounded-lg bg-red-600 px-6 py-3 text-center text-lg font-medium text-white transition hover:bg-red-700"
                  role="button"
                  onClick={handleGoHome}
                >
                  Về trang chủ
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

// --- SUB COMPONENT ---
const DetailRow = ({
  label,
  value,
  isRed = false,
  isContent = false,
  isDiscount = false,
}: {
  label: string;
  value: string | undefined;
  isRed?: boolean;
  isContent?: boolean;
  isDiscount?: boolean;
}) => (
  <div
    className={`grid grid-cols-5 gap-x-2 text-sm ${isRed ? "border-b border-gray-100 pb-2" : ""}`}
  >
    <span className="col-span-2 font-medium text-gray-500">{label}</span>
    <span
      className={`col-span-3 break-words text-right font-semibold ${
        isRed
          ? "text-lg text-red-600"
          : isDiscount
            ? "text-green-600"
            : "text-gray-800"
      }`}
    >
      {value}
      {isContent && value && (
        <button
          onClick={() => navigator.clipboard.writeText(value || "")}
          className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
          title="Sao chép nội dung"
        >
          [Sao chép]
        </button>
      )}
    </span>
  </div>
);
