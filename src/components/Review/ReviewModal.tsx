import React, { useState, useEffect } from "react";
import { Star, Camera, X } from "lucide-react";
import { submitReview } from "../../api/reviewApi";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/authStore1"; // Đảm bảo đường dẫn này đúng với file store của bạn

interface ReviewModalProps {
  productId: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RATING_LEVELS = [
  { value: 1, label: "Rất Tệ" },
  { value: 2, label: "Tệ" },
  { value: 3, label: "Bình thường" },
  { value: 4, label: "Tốt" },
  { value: 5, label: "Tuyệt vời" },
];

const ReviewModal: React.FC<ReviewModalProps> = ({
  productId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { accessToken, checkAuthStatus } = useAuthStore();

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen, checkAuthStatus]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setRating(5);
      setContent("");
      setFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - files.length);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));

      setFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newUrls]);
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 2. Sử dụng accessToken trực tiếp từ store
    if (!accessToken) {
      toast.error("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    if (content.trim().length < 15) {
      toast.error("Nội dung đánh giá phải có tối thiểu 15 ký tự.");
      return;
    }

    setIsLoading(true);
    try {
      await submitReview(productId, rating, content, files, accessToken);
      toast.success("Cảm ơn bạn! Đánh giá đã được gửi thành công.");
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gửi đánh giá thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Đánh giá sản phẩm</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X className="h-6 w-6 stroke-2" />
          </button>
        </div>

        <form id="review-form" onSubmit={handleSubmit} className="p-6">
          {/* PRODUCT INFO */}
          <div className="mb-6 flex items-center space-x-4">
            <div className="h-16 w-16 flex-shrink-0">
              <img
                src="/src/assets/cps-ant.webp"
                alt="Product"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-sm font-bold text-gray-800 lg:text-lg">
              {productName}
            </p>
          </div>

          {/* RATING SECTION */}
          <div className="mb-8">
            <h3 className="mb-4 text-center text-base font-bold text-gray-700">
              Bạn thấy sản phẩm này như thế nào?
            </h3>
            <div className="flex items-start justify-between">
              {RATING_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setRating(level.value)}
                  className="flex flex-col items-center group flex-1"
                >
                  <Star
                    className={`h-7 w-7 transition-all lg:h-9 lg:w-9 ${level.value <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                      }`}
                  />
                  <p
                    className={`mt-2 text-[10px] font-medium lg:text-xs ${level.value === rating ? "text-red-600" : "text-gray-500"
                      }`}
                  >
                    {level.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* TEXTAREA */}
          <div className="mb-4">
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-300 p-4 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
              placeholder="Xin mời chia sẻ một số cảm nhận về sản phẩm (tối thiểu 15 kí tự)"
            />
            <div className="mt-1 flex justify-between text-[11px]">
              <span className={content.length < 15 ? "text-red-500" : "text-green-500"}>
                {content.length < 15 ? `Cần thêm ${15 - content.length} ký tự` : "Độ dài hợp lệ"}
              </span>
              <span className="text-gray-400">{content.length} ký tự</span>
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="mb-6 flex flex-wrap gap-3">
            <label
              htmlFor="file-upload"
              className={`flex h-20 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${files.length >= 5
                ? "bg-gray-50 border-gray-200 cursor-not-allowed"
                : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                }`}
            >
              <Camera className="h-6 w-6 text-gray-400" />
              <span className="mt-1 text-[10px] font-medium text-gray-500">
                {files.length}/5 Ảnh
              </span>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={files.length >= 5}
              />
            </label>

            {previews.map((url, index) => (
              <div key={index} className="relative h-20 w-24 overflow-hidden rounded-xl border border-gray-200 group">
                <img src={url} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black bg-opacity-50 text-white hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-red-600 py-3 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "ĐANG XỬ LÝ..." : "GỬI ĐÁNH GIÁ"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;