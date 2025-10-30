import { useState, useEffect, useCallback } from "react";

interface Product {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  special_price: number;
  rating: { average: number } | null;
  promotion: {
    id: number;
    name: string;
    description: string;
    discountType: string;
    discountValue: number;
    startDate: string;
    endDate: string;
    status: string;
    scope: string;
  } | null;
}

interface ApiData {
  page: number;
  items: Product[];
  size: number;
  totalElements: number;
  totalPages: number;
}
// -----------------

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;
const DEFAULT_PAGE_SIZE = 20;

const useProductList = (
  categorySlug: string,
  appliedFilters: Record<string, string[]>,
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentSize, setCurrentSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = useCallback(
    (size: number, filters: Record<string, string[]>) => {
      const params = new URLSearchParams();
      params.append("size", size.toString());

      Object.entries(filters).forEach(([code, values]) => {
        if (values.length > 0) {
          const combinedValue = values.join(",");
          params.append(code, combinedValue);
        }
      });
      return params.toString();
    },
    [],
  );

  const fetchData = useCallback(
    async (size: number) => {
      setLoading(true);
      setError(null);
      try {
        if (!API_BASE_URL) {
          throw new Error("PUBLIC_API_BASE_URL is not defined in environment.");
        }
        const queryString = buildQueryString(size, appliedFilters);
        const url = `${API_BASE_URL}/api/public/product/filter/${categorySlug}?${queryString}`;
        console.log(`[useProductList] Fetching API URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Lỗi HTTP: ${response.status}`);
        }
        const result: { code: number; data: ApiData } = await response.json();

        if (result.code === 1000 && result.data && result.data.items) {
          setProducts(result.data.items);
          setCurrentSize(result.data.items.length);
          setTotalElements(result.data.totalElements);
        } else {
          setProducts([]);
          setTotalElements(0);
          setCurrentSize(0);
          if (Object.keys(appliedFilters).length === 0) {
            setError("Không tìm thấy dữ liệu sản phẩm.");
          }
        }
      } catch (e) {
        console.error("Lỗi khi fetch API:", e);
        setError("Lỗi kết nối hoặc xử lý dữ liệu.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, appliedFilters, buildQueryString],
  );

  useEffect(() => {
    fetchData(DEFAULT_PAGE_SIZE);
    setCurrentSize(DEFAULT_PAGE_SIZE);
  }, [fetchData]);
  const remainingCount = totalElements - products.length;
  const sizeToFetch = currentSize + DEFAULT_PAGE_SIZE;
  const canLoadMore = products.length < totalElements;
  const countToShow = Math.min(remainingCount, DEFAULT_PAGE_SIZE);
  const handleLoadMore = () => {
    if (loading || !canLoadMore) return;
    fetchData(sizeToFetch);
  };

  return {
    products,
    loading,
    error,
    canLoadMore,
    countToShow,
    handleLoadMore,
  };
};

export default useProductList;
