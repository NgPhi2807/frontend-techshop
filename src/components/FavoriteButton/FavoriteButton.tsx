// src/components/FavoriteButton.tsx
import React, { useState } from "react";
// import { useAuthStore } from "../../stores/authStore1"; <--- KHÔNG CẦN DÙNG
import { addFavorite, removeFavorite } from "../../api/interactionApi";
import { toast } from "react-toastify";

interface FavoriteButtonProps {
  productId: number;
  initialIsFavorite: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  initialIsFavorite,
}) => {
  // Loại bỏ việc lấy accessToken từ Zustand:
  // const accessToken = useAuthStore((state) => state.accessToken);

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.info("Bạn cần đăng nhập để yêu thích sản phẩm!");
      return;
    }
    setLoading(true);
    const previousIsFavorite = isFavorite;
    setIsFavorite(!previousIsFavorite);

    try {
      if (previousIsFavorite) {
        await removeFavorite(productId, accessToken);
        toast.success("Đã xóa khỏi danh sách yêu thích.");
      } else {
        await addFavorite(productId, accessToken);
        toast.success("Đã thêm vào danh sách yêu thích! ");
      }
    } catch (error) {
      console.error("Lỗi khi toggle yêu thích:", error);

      setIsFavorite(previousIsFavorite);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleToggleFavorite}
      className={`mt-0 flex cursor-pointer items-center transition-colors duration-150 ${
        loading
          ? "cursor-wait text-gray-400"
          : isFavorite
            ? "text-red-500 hover:text-red-600"
            : "text-gray-500 hover:text-red-500"
      }`}
      style={{ pointerEvents: loading ? "none" : "auto" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mr-0.5 h-4 w-4"
        fill={isFavorite ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {loading ? "Yêu thích" : isFavorite ? "Đã yêu thích" : "Yêu thích"}
    </div>
  );
};

export default FavoriteButton;
