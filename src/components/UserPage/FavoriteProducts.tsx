import React from "react";
import { useMyLiked } from "../../hooks/useMyLiked";

const LikedItem: React.FC<{ product: any; onRemove: (id: number) => void }> = ({ product, onRemove }) => {
    const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;
    const productUrl = `/san-pham/${product.slug}`;

    return (
        <div className="flex items-center gap-4 p-4 mb-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all">
            <a href={productUrl} className="w-20 h-20 flex-shrink-0 border rounded-lg overflow-hidden bg-gray-50 flex justify-center items-center hover:opacity-80 transition">
                <img src={`${IMAGE_BASE_URL}${product.thumbnail}`} alt={product.name} className="w-16 h-16 object-cover" />
            </a>

            <div className="flex-grow min-w-0">
                <a href={productUrl} className="block group">
                    <h3 className="font-semibold text-gray-800 truncate text-sm md:text-base group-hover:text-red-600 transition-colors">
                        {product.name}
                    </h3>
                </a>
                <p className="text-xs text-gray-400 mt-1 italic">Mã: #{product.id}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-red-600 font-bold">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.special_price)}</span>
                    {product.price > product.special_price && (
                        <span className="text-xs text-gray-400 line-through">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2 min-w-[90px]">
                <a href={productUrl} className="px-4 py-1.5 bg-gray-100 text-gray-700 text-center text-xs font-medium rounded-full hover:bg-gray-200 transition-colors">
                    Chi tiết
                </a>
                <button
                    onClick={() => onRemove(product.id)}
                    className="px-4 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-full hover:bg-red-600 hover:text-white transition-colors"
                >
                    Xóa
                </button>
            </div>
        </div>
    );
};

const MyLiked: React.FC = () => {
    const {
        accessToken, loading, error, filteredProducts,
        pagination, setPagination, inputSearch, setInputSearch, handleRemove
    } = useMyLiked();

    if (!accessToken && !loading) {
        return <div className="p-10 text-center text-gray-500">Vui lòng đăng nhập để xem sản phẩm yêu thích.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto ">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">Sản phẩm yêu thích</h1>
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Tìm trong danh sách..."
                        value={inputSearch}
                        onChange={(e) => setInputSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-full px-5 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none shadow-sm"
                    />
                </div>
            </div>

            <div className="min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <p className="text-center text-red-500 bg-red-50 py-4 rounded-lg">{error}</p>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map(p => (
                        <LikedItem key={p.id} product={p} onRemove={handleRemove} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-100 text-gray-400">
                        {inputSearch ? `Không tìm thấy "${inputSearch}"` : "Bạn chưa yêu thích sản phẩm nào."}
                    </div>
                )}
            </div>

            {!inputSearch && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                        className="px-4 py-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
                    >
                        Trang trước
                    </button>
                    <span className="font-medium text-gray-600 text-sm">Trang {pagination.page} / {pagination.totalPages}</span>
                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                        className="px-4 py-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyLiked;