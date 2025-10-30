// OrderConfirmationPage.tsx (Phiên bản đã cập nhật để tách 2 phần)

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
    type: string;
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

// --- CSS KEYFRAMES ---
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
    const [isRedirecting, setIsRedirecting] = useState(false); // State quản lý việc chuyển hướng

    // --- useEffect: TẢI DỮ LIỆU BAN ĐẦU VÀ KIỂM TRA HẾT HẠN (Giữ nguyên) ---
    useEffect(() => {
        const id = Number(orderId);
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

            if (data.paymentInfo?.type === "bank") {
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
            // Xử lý trường hợp người dùng quay lại link cũ đã hết hạn
            if (lastOrderData?.paymentInfo?.type === "bank" && Number(lastOrderData.orderId) === id && lastOrderData.amount !== undefined) {
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

    // --- useEffect: LOGIC ĐẾM NGƯỢC (Giữ nguyên) ---
    useEffect(() => {
        if (countdown === null || countdown <= 0 || !orderData) return;

        const timerId = setInterval(() => {
            setCountdown((prev) => {
                const next = prev !== null && prev > 0 ? prev - 1 : 0;
                if (
                    next === 0 &&
                    prev !== 0 &&
                    orderData.paymentInfo?.type === "bank"
                ) {
                    clearOrderData();
                    setIsExpiredLocally(true);
                }

                return next;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [countdown, clearOrderData, orderData]);

    // --- HÀM FORMAT COUNTDOWN (Giữ nguyên) ---
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

    // --- HANDLER CHUYỂN HƯỚNG VỀ GIỎ HÀNG TỪ THÔNG BÁO HẾT HẠN (Giữ nguyên) ---
    const handleGoToCart = () => {
        clearCheckoutItems();
        window.location.replace("/gio-hang");
    };

    // --- HANDLER CHUYỂN HƯỚNG VỀ TRANG CHỦ (Giữ nguyên) ---
    const handleGoHome = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
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

    // --- KHAI BÁO BIẾN ĐỂ FIX LỖI TS (Giữ nguyên) ---
    const { amount, paymentInfo } = orderData || {};
    const finalAmount = amount ?? 0;
    const { minutes, seconds, expired } = formatCountdown(countdown);

    const isBankPayment =
        paymentInfo?.type === "bank" &&
        paymentInfo?.bankAccountNumber &&
        paymentInfo?.qrCodeUrl;
    const isTransactionExpired = isBankPayment && isExpiredLocally;
    if (isLoading || isRedirecting) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <p className="text-xl font-semibold">
                    {isRedirecting ? "Đang chuyển hướng..." : `Đang tải thông tin đơn hàng #${orderId}...`}
                </p>
            </div>
        );
    }
    if (error && !isTransactionExpired) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <p className="mb-4 text-2xl font-bold text-red-600">❌ Lỗi Truy Cập</p>
                <p className="max-w-md text-lg text-gray-700">
                    {error}
                </p>
                <a
                    href="/"
                    className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-lg font-bold text-white transition hover:bg-blue-700"
                    role="button"
                    onClick={handleGoHome}
                >
                    Về trang chủ
                </a>
            </div>
        );
    }
    
    return (
        <div className="flex">
            <ScannerStyle />
            
            <div className="w-full">
                
 
                
               {isTransactionExpired ? (
    <div className="w-full flex justify-center items-center py-14 px-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 text-center animate-fadeIn">

            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center shadow-md">
                <span className="text-5xl">⏰</span>
            </div>

            {/* Title */}
            <h2 className="mb-3 text-2xl lg:text-3xl font-extrabold text-red-600">
                Giao Dịch Đã Hết Hạn!
            </h2>

            {/* Description */}
            <p className="mb-6 text-gray-700 text-sm lg:text-lg leading-relaxed">
                Thời gian để hoàn tất đơn hàng 
                <span className="font-bold text-gray-900"> #{orderId} </span>
                đã kết thúc.  
                <br />Vui lòng tiến hành đặt lại nếu bạn vẫn muốn mua sản phẩm.
            </p>

            {/* CTA Button */}
            <button
                onClick={handleGoToCart}
                className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto rounded-lg bg-red-600 hover:bg-red-700
                px-6 py-3 text-base font-semibold text-white transition shadow-md hover:shadow-lg"
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
): (
                    <div className=" flex flex-col lg:flex-row lg:justify-center lg:space-x-8 mt-4 w-full">
                        
                        <div className="flex-1 lg:w-2/3 rounded-lg bg-white shadow-xl overflow-hidden mb-4 lg:mb-0">
                <div className="mx-auto w-full rounded-t-lg border-b border-gray-100 bg-gray-50 p-4 text-center text-sm font-medium text-gray-700 shadow-sm">
                    Vui lòng không tắt trình duyệt cho đến khi giao dịch được xác
                    nhận!
                </div>
                            <div className="p-8">
                                {isBankPayment ? (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h2 className="mb-1 text-xl font-bold text-gray-800">
                                                Quét hoặc tải mã QR để thanh toán bằng ứng dụng ngân hàng
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
                                    // Thông báo COD
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-base text-green-800 text-center">
                                        <p className="mb-2 text-3xl">🎉</p>
                                        <p className="mb-1 text-xl font-bold">
                                            Đơn hàng #{orderId} đã được đặt thành công!
                                        </p>
                                        <p className="font-medium">
                                            Phương thức: **{paymentInfo?.label || "Thanh toán khác"}**
                                        </p>
                                        <p className="mt-3 text-lg">
                                            Bạn sẽ thanh toán {formatCurrency(finalAmount)} khi nhận
                                            hàng.
                                        </p>
                                        <p className="mt-2 text-sm text-green-700">
                                            Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:w-1/3 w-full ">
                            <div className="p-6 rounded-lg bg-white shadow-xl overflow-hidden">
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
                                        Thông tin đơn hàng
                                    </h4>
                                    
                                    <DetailRow label="Mã đơn hàng:" value={`#${orderId}`} />
                                    <DetailRow 
                                        label="Phương thức TT:" 
                                        value={paymentInfo?.label || "Đang xử lý"} 
                                    />
                                    
                                    <div className="border-t border-gray-200 pt-3">
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
                              <div className=" p-6 flex justify-center items-center ">
                                    <a
                                        href="/"
                                        className=" w-full rounded-lg bg-red-600 py-3 px-6 text-center text-lg font-medium text-white transition hover:bg-red-700"
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

// --- Components phụ đã Tối giản hóa (Giữ nguyên) ---

const DetailRow = ({
    label,
    value,
    isRed = false,
    isContent = false,
}: {
    label: string;
    value: string | undefined;
    isRed?: boolean;
    isContent?: boolean;
}) => (
    <div
        className={`grid grid-cols-5 gap-x-2 text-sm ${isRed ? "border-b border-gray-100 pb-2" : ""}`}
    >
        <span className="col-span-2 font-medium text-gray-500">{label}</span>
        <span
            className={`col-span-3 text-right font-semibold ${isRed ? "text-lg text-red-600" : "text-gray-800"}`}
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