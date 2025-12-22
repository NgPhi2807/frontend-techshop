import axios from "axios";

const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export const fetchMyOrders = async (token: string, page: number, size: number, status: string) => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (status !== "ALL") params.append("orderStatus", status);

    const res = await axios.get(`${BASE_URL}/api/customer/my-order?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
};