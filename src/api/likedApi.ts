import axios from "axios";

const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8080";

export const fetchMyLiked = async (token: string, page: number, size: number) => {
    const res = await axios.get(`${BASE_URL}/api/customer/my-liked`, {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const removeLikedProduct = async (token: string, id: number) => {
    const res = await axios.delete(`${BASE_URL}/api/interaction/unlike/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};