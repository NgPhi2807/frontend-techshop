import { useState, useEffect, useCallback } from "react";
import { fetchMyLiked, removeLikedProduct } from "../api/likedApi";
import { useAuthStore } from "../stores/authStore1";
import { toast } from "react-toastify";

export const useMyLiked = () => {
    const { accessToken, checkAuthStatus } = useAuthStore();
    const [apiProducts, setApiProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, size: 10, totalPages: 1 });
    const [inputSearch, setInputSearch] = useState("");

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const loadData = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetchMyLiked(accessToken, pagination.page, pagination.size);
            const data = response.data;
            setApiProducts(data.items);
            setPagination(p => ({ ...p, totalPages: data.totalPages }));
        } catch (err) {
            setError("Không thể tải danh sách sản phẩm yêu thích.");
        } finally {
            setLoading(false);
        }
    }, [accessToken, pagination.page, pagination.size]);

    useEffect(() => {
        if (accessToken) loadData();
    }, [loadData, accessToken]);

    const handleRemove = async (id: number) => {
        if (!accessToken) return;
        try {
            await removeLikedProduct(accessToken, id);
            setApiProducts(prev => prev.filter(p => p.id !== id));
            toast.success("Đã xóa khỏi danh sách yêu thích!");
        } catch (err) {
            toast.error("Lỗi khi xóa sản phẩm.");
        }
    };

    useEffect(() => {
        const term = inputSearch.trim().toLowerCase();
        if (!term) {
            setFilteredProducts(apiProducts);
            return;
        }
        setFilteredProducts(apiProducts.filter(p =>
            p.name.toLowerCase().includes(term) || p.id.toString().includes(term)
        ));
    }, [apiProducts, inputSearch]);

    return {
        accessToken,
        loading,
        error,
        filteredProducts,
        pagination,
        setPagination,
        inputSearch,
        setInputSearch,
        handleRemove,
        loadData
    };
};