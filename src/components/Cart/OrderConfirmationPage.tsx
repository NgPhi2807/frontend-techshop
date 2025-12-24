import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/currency";

// --- Cấu hình Biến Môi trường cho WebSocket ---
// Nối thêm /ws/public vào biến môi trường PUBLIC_WS_BASE_URL
const WS_BASE_URL = `${import.meta.env.PUBLIC_WS_BASE_URL}/ws/public` || "ws://localhost:8080/ws/public";

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
          window.location.replace("/");
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
        if (next === 0 && prev !== 0 && orderData.paymentInfo?.type === "BANK") {
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
    if (!win.WebSocket || !win.Stomp) return;
    if (isPaid) return;

    // Sử dụng URL đã bao gồm /ws/public
    const socket = new win.WebSocket(WS_BASE_URL);
    const stompClient = win.Stomp.over(socket);
    stompClient.debug = () => { };
    stompClient.connect(
      {},
      () => {
        stompClient.subscribe(`/topic/${orderId}`, (msg: any) => {
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
            const expireTime = Date.now() + 5 * 60 * 1000;
            const statusData = { status: "PAID", expireAt: expireTime };
            localStorage.setItem(`paid_status_${orderId}`, JSON.stringify(statusData));
            clearOrderData();
            clearCheckoutItems();
            setIsPaid(true);
          }
        });
      },
      (error: any) => {
        console.error("STOMP Connection Error:", error);
      }
    );

    return () => {
      try {
        if (stompClient && stompClient.connected) {
          stompClient.disconnect(() => { });
        }
      } catch (e) {
        console.error("Error during STOMP disconnect:", e);
      }
    };
  }, [orderId, clearOrderData, clearCheckoutItems, isPaid]);

  const formatCountdown = (totalSeconds: number | null) => {
    if (totalSeconds === null || totalSeconds <= 0) {
      return { time: "00 : 00", expired: isExpiredLocally, minutes: "00", seconds: "00" };
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      time: `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`,
      expired: false,
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  };

  const handleGoToCart = () => {
    clearCheckoutItems();
    window.location.replace("/gio-hang");
  };

  // Sửa kiểu sự kiện để tương thích HTMLElement (cả <a> và <button>)
  const handleGoHome = (event: React.MouseEvent<HTMLElement>) => {
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

  const { paymentInfo, grossAmount, directDiscount, voucherDiscount, totalAmount } = orderData || {};
  const finalAmount = totalAmount ?? 0;
  const { minutes, seconds, expired } = formatCountdown(countdown);
  const isBankPayment = paymentInfo?.type === "BANK" && paymentInfo?.bankAccountNumber && paymentInfo?.qrCodeUrl;
  const isTransactionExpired = isBankPayment && isExpiredLocally;

  if (isPaid) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center ">
        <div className="w-full max-w-xl p-10 text-center ">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 shadow-lg">
            <svg className="h-14 w-14 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-3xl font-extrabold text-red-700">Thanh Toán Thành Công! 🎉</h2>
          <p className="text-lg text-gray-700">Đơn hàng <span className="font-bold text-red-600">#{orderId}</span> đã được xác nhận.</p>
          <p className="mt-3 text-sm italic text-gray-500">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng ngay lập tức.</p>
          <div className="mt-8">
            <button onClick={handleGoHome} className="inline-block w-full rounded-xl bg-red-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition duration-300 hover:bg-red-700 hover:shadow-xl">
              {isRedirecting ? "Đang chuyển hướng..." : "Về Trang Chủ"}
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-400">Trang này sẽ tự động đóng sau 5 phút.</div>
        </div>
      </div>
    );
  }

  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center ">
        <div className="relative flex flex-col items-center rounded-3xl border border-white/60 bg-white/70 px-12 py-10 text-center shadow-lg">
          <div className="relative mb-6 h-14 w-14">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-600" />
            <div className="absolute inset-3 rounded-full bg-blue-600/10" />
          </div>

          <p className="text-lg font-semibold text-gray-800 lg:text-xl">
            {isRedirecting ? "Đang chuyển hướng..." : "Đang xử lý đơn hàng"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {!isRedirecting && (
              <>
                Mã đơn hàng <span className="font-medium text-gray-900">#{orderId}</span>
              </>
            )}
          </p>

          <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="relative flex p-2 lg:p-16 items-center justify-center overflow-hidden ">

        <div className="relative w-full max-w-xl rounded-3xl bg-white/70 p-10 shadow-xl">

          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="mb-3 text-center text-base lg:text-3xl font-extrabold tracking-tight text-gray-900">
            Liên kết không còn hiệu lực
          </h2>
          <p className="mx-auto mb-8 max-w-md text-center text-sm lg:text-base text-gray-600">
            Đơn hàng này đã được xử lý hoặc liên kết xác nhận đã hết hạn.
            Vui lòng quay về trang chủ để tiếp tục mua sắm.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleGoHome}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              Về trang chủ
              <span className="absolute inset-0 -z-10 bg-white/20 opacity-0 transition group-hover:opacity-100" />
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex">
      <ScannerStyle />
      <div className="w-full">
        {isTransactionExpired ? (
          <div className="relative flex w-full items-center justify-center overflow-hidden px-4 py-16 bg-gradient-to-br from-red-50 via-white to-rose-100">

            {/* Blur decoration */}
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-300/40 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-400/40 blur-3xl" />

            <div className="relative w-full max-w-xl animate-fadeIn rounded-3xl border border-white/60 bg-white/70 p-10 text-center shadow-[0_20px_60px_-15px_rgba(220,38,38,0.35)] backdrop-blur-xl">

              {/* Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                <span className="text-4xl text-white">⏰</span>
              </div>

              {/* Title */}
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                Giao dịch đã hết hạn
              </h2>

              {/* Description */}
              <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-600 lg:text-base">
                Thời gian hoàn tất đơn hàng
                <span className="mx-1 font-semibold text-gray-900">#{orderId}</span>
                đã kết thúc.
                <br />
                Vui lòng tiến hành đặt lại nếu bạn vẫn muốn mua sản phẩm.
              </p>

              {/* Action */}
              <button
                onClick={handleGoToCart}
                className="mx-auto inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex w-full flex-col lg:flex-row lg:justify-center lg:space-x-8">
            <div className="mb-4 flex-1 overflow-hidden rounded-lg bg-white shadow-xl lg:mb-0 lg:w-2/3">
              <div className="mx-auto w-full rounded-t-lg border-b border-gray-100 bg-gray-50 p-4 text-center text-sm font-medium text-gray-700 shadow-sm"> Vui lòng không tắt trình duyệt cho đến khi giao dịch được xác nhận! </div>
              <div className="p-8">
                {isBankPayment ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="mb-1 text-xl font-bold text-gray-800">Quét hoặc tải mã QR để thanh toán bằng ứng dụng ngân hàng</h2>
                      <p className="text-sm text-gray-500">Thanh toán qua {paymentInfo?.bankName || "Ngân hàng"}</p>
                    </div>
                    <div className="flex justify-center">
                      <div className={`inline-block border-2 ${expired ? "border-red-400" : "border-gray-200"} rounded-lg p-3 transition-all duration-300`}>
                        {expired ? (
                          <div className="flex h-48 w-48 items-center justify-center rounded-sm bg-gray-100"><p className="text-base font-semibold text-red-600">Giao dịch đã hết hạn</p></div>
                        ) : (
                          <div className="relative h-48 w-48 overflow-hidden rounded-sm">
                            <img src={paymentInfo?.qrCodeUrl} alt="QR Code Thanh Toán" className="h-full w-full object-contain" />
                            <div className="absolute left-0 h-0.5 w-full bg-red-500 shadow-md shadow-red-500/80" style={{ animation: "scan 3s ease-in-out infinite" }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                    {!expired && (
                      <div className="text-center">
                        <a href={paymentInfo?.qrCodeUrl} download={`order_${orderId}_qr.png`} className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 transition duration-150 hover:text-blue-800">Tải xuống mã QR</a>
                      </div>
                    )}
                    <div className="mx-auto max-w-md space-y-3 pt-4">
                      <DetailRow label="Ngân hàng:" value={paymentInfo?.bankName} />
                      <DetailRow label="Số Tài Khoản:" value={paymentInfo?.bankAccountNumber} />
                      <DetailRow label="Chủ tài khoản:" value={paymentInfo?.bankAccountName} />
                      <DetailRow label="Nội dung chuyển khoản:" value={paymentInfo?.transferContent} isContent />
                      <div className="my-4 h-px bg-gray-200"></div>
                      <DetailRow label="Số tiền cần thanh toán:" value={formatCurrency(finalAmount)} isRed />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center text-base text-green-800">
                    <p className="mb-2 text-3xl">🎉</p>
                    <p className="mb-1 text-xl font-bold"> Đơn hàng #{orderId} đã được đặt thành công! </p>
                    <p className="font-medium"> Phương thức: {paymentInfo?.label || "Thanh toán khác"} </p>
                    <p className="mt-3 text-lg"> Bạn sẽ thanh toán {formatCurrency(finalAmount)} khi nhận hàng. </p>
                    <p className="mt-2 text-sm text-green-700"> Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng. </p>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <div className="overflow-hidden rounded-lg bg-white p-6 shadow-xl">
                {isBankPayment && (
                  <div className={`mb-6 border-b border-gray-100 bg-yellow-50 px-2 py-4 text-center ${expired ? "opacity-50" : ""}`}>
                    <p className="mb-1 text-sm font-medium text-gray-500"> Giao dịch {expired ? "đã hết hạn" : "kết thúc trong"} </p>
                    <div className={`text-3xl font-extrabold ${expired ? "text-red-400" : "text-black"}`}> {minutes} : {seconds} </div>
                    <div className="mt-1 text-xs text-gray-400"> Phút : Giây </div>
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="pb-2 text-lg font-bold text-gray-800"> Chi tiết đơn hàng </h4>
                  <DetailRow label="Mã đơn hàng:" value={`#${orderId}`} />
                  <DetailRow label="Phương thức TT:" value={paymentInfo?.label || "Đang xử lý"} />
                  <div className="space-y-2 border-t border-gray-200 pt-3">
                    <DetailRow label="Tổng tiền hàng:" value={formatCurrency(grossAmount ?? 0)} />
                    <DetailRow label="Chiết khấu trực tiếp:" value={`-${formatCurrency(directDiscount ?? 0)}`} isDiscount />
                    <DetailRow label="Chiết khấu voucher:" value={`-${formatCurrency(voucherDiscount ?? 0)}`} isDiscount />
                    <DetailRow label="Phí vận chuyển:" value="Miễn phí" />
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4 font-bold">
                    <span className="text-gray-800">Cần thanh toán:</span>
                    <span className="text-xl font-extrabold text-red-600"> {formatCurrency(finalAmount)} </span>
                  </div>
                </div>
                {isBankPayment && (
                  <div className="pt-8 text-center">
                    <button className="text-sm text-gray-400 transition hover:text-red-500 hover:underline" onClick={handleCancelOrder}> Hủy giao dịch </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center p-6">
                <button onClick={handleGoHome} className="w-full rounded-lg bg-red-600 px-6 py-3 text-center text-lg font-medium text-white transition hover:bg-red-700"> Về trang chủ </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, isRed = false, isContent = false, isDiscount = false, }: { label: string; value: string | undefined; isRed?: boolean; isContent?: boolean; isDiscount?: boolean; }) => (
  <div className={`grid grid-cols-5 gap-x-2 text-sm ${isRed ? "border-b border-gray-100 pb-2" : ""}`}>
    <span className="col-span-2 font-medium text-gray-500">{label}</span>
    <span className={`col-span-3 break-words text-right font-semibold ${isRed ? "text-lg text-red-600" : isDiscount ? "text-green-600" : "text-gray-800"}`}>
      {value}
      {isContent && value && (
        <button onClick={() => navigator.clipboard.writeText(value || "")} className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-800" title="Sao chép nội dung"> [Sao chép] </button>
      )}
    </span>
  </div>
);

export default OrderConfirmationPage;