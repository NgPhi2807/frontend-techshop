import axios from "axios";
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function fetchProductReviews(
 productId: number | string,
) {
 const response = await axios.get(`${BASE_URL}/api/public/product/review`, {
  params: {
   size: 10,
   page: 1,
   productId: productId
  }
 });

 return response.data;
}


export const submitReview = async (
 productId: number,
 rating: number,
 content: string,
 medias: File[],
 accessToken: string
) => {
 const formData = new FormData();
 
 formData.append('productId', productId.toString());
 formData.append('rating', rating.toString());
 formData.append('content', content);
 
 medias.forEach((file) => {
  formData.append('medias', file, file.name); 
 });

 return axios.post(
  `${BASE_URL}/interaction/review/${productId}`,
  formData,
  {
   headers: {
    Authorization: `Bearer ${accessToken}`,
   },
  }
 );

};