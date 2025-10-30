// api/reviewApi.ts
import axios from "axios";

// Giả định bạn đã định nghĩa biến môi trường này
const BASE_URL = "http://localhost:8080/api"; 

// --- HÀM TẢI ĐÁNH GIÁ (ĐÃ ĐƯỢC CHUYỂN SANG DÙNG AXIOS) ---
export async function fetchProductReviews(
 productId: number | string,
) {
 const response = await axios.get(`${BASE_URL}/public/product/review`, {
  params: {
   size: 10,
   page: 1,
   productId: productId
  }
 });

 return response.data;
}

// ----------------------------------------------------------------------

/**
 * Gửi đánh giá sản phẩm lên API.
 * ❌ Đã loại bỏ mọi lệnh console.log/alert/toast
 */
export const submitReview = async (
 productId: number,
 rating: number,
 content: string,
 medias: File[],
 accessToken: string
) => {
 const formData = new FormData();
 
 // Đảm bảo productId được gửi trong form data (Thực hành tốt)
 formData.append('productId', productId.toString());
 
 formData.append('rating', rating.toString());
 formData.append('content', content);
 
 // Thêm các file ảnh vào FormData
 medias.forEach((file) => {
  formData.append('medias', file, file.name); 
 });

 // Gửi request POST
 return axios.post(
  `${BASE_URL}/interaction/review/${productId}`,
  formData,
  {
   headers: {
    Authorization: `Bearer ${accessToken}`,
   },
  }
 );
 // Lưu ý: Nếu alert vẫn còn xuất hiện, nó phải ở trong hàm onSuccess() 
 // trong component gọi ReviewModal, hoặc logic được gọi sau đó.
};