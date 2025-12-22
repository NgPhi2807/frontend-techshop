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

    formData.append('rating', rating.toString());
    formData.append('content', content);

    if (medias && medias.length > 0) {
        medias.forEach((file) => {
            formData.append('medias', file);
        });
    }

    return axios.post(
        `${BASE_URL}/api/interaction/review/${productId}`,
        formData,
        {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        }
    );
};