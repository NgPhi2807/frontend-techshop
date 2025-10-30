import React, { useState } from "react";
import { Star, Camera, X } from "lucide-react";
import { submitReview } from "../../api/reviewApi";
import { toast } from "react-toastify";

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
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  React.useEffect(() => {
    if (!isOpen) {
      setRating(5);
      setContent("");
      setFiles([]);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - files.length);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
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
      <div className="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Đánh giá nhận xét</h2>
          <button
            onClick={onClose}
            className="text-3xl leading-none text-gray-500 hover:text-gray-800"
          >
            <X className="h-6 w-6 stroke-2" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 pb-0">
          <div className="mb-6 flex items-center space-x-4">
            <div className="h-16 w-16 flex-shrink-0">
              <img
                src="/src/assets/cps-ant.webp"
                alt="Rating Badge"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-sm font-semibold text-gray-800 lg:text-lg">
              {productName}
            </p>
          </div>
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-bold">Đánh giá chung</h3>
            <div className="flex items-start justify-between text-center">
              {RATING_LEVELS.map((level) => (
                <div
                  key={level.value}
                  onClick={() => setRating(level.value)}
                  className="group flex cursor-pointer flex-col items-center"
                >
                  <Star
                    className={`h-6 w-6 transition-colors lg:h-8 lg:w-8 ${
                      level.value <= rating
                        ? "fill-yellow-300 stroke-yellow-300 text-yellow-300"
                        : "stroke-gray-300 text-gray-300"
                    }`}
                    fill={level.value <= rating ? "currentColor" : "none"}
                  />
                  <p
                    className={`mt-1 text-xs font-medium lg:text-sm ${level.value === rating ? "text-red-600" : "text-gray-500 group-hover:text-gray-700"}`}
                  >
                    {level.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* NỘI DUNG ĐÁNH GIÁ (TEXTAREA) */}
          <div className="mb-6">
            <textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:ring-red-500"
              placeholder="Xin mời chia sẻ một số cảm nhận về sản phẩm (nhập tối thiểu 15 kí tự)"
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {content.length}/15 ký tự tối thiểu
            </p>
          </div>
=          <div className="mb-6 flex flex-wrap gap-3">
            {/* Input = */}
            <label
              htmlFor="file-upload"
              className="flex h-20 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition duration-150 hover:border-red-500"
            >
              <Camera className="h-6 w-6 text-gray-500" />
              <span className="mt-1 text-xs">
                Thêm hình ảnh ({files.length}/5)
              </span>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden" // Ẩn input mặc định
              disabled={files.length >= 5}
            />
            {/* Image Previews */}
            {files.map((file, index) => (
              <div
                key={index}
                className="relative h-20 w-32 overflow-hidden rounded-lg border border-gray-200"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="h-full w-full object-fill"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white opacity-90 hover:opacity-100"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </form>
        <div className="p-4 pt-0">
          <button
            type="submit"
            form="review-form"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full rounded-lg bg-red-600 px-2 py-2 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-red-700 disabled:bg-red-400"
          >
            {isLoading ? "ĐANG GỬI ĐÁNH GIÁ..." : "GỬI ĐÁNH GIÁ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
