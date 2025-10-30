// src/components/HeaderMain.tsx

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    Menu,
    ChevronDown,
    Search,
    ShoppingCart,
    User,
    MapPin,
    X,
    ChevronRight,
    LogOut,
    Heart, 
    ListChecks, 
    User as UserIcon, 
    DollarSign, 
    Package, 
    Smartphone,
    Monitor,
    Watch,Mic
} from "lucide-react";
import { useCartStore } from "../../stores/cartStore";
import AuthModals from "../Auth/AuthModal";
import { useAuthStore } from "../../stores/authStore";
import { useCustomerProfileStore } from "../../stores/useCustomerProfileStore"; 
import {type LucideIcon } from 'lucide-react'; 
type ModalType = "login" | "register" | null;

interface ProductSuggestionItem {
    id: number;
    name: string;
    slug: string;
    thumbnail: string;
    price: number;
    special_price: number | null;
}

// =========================================================
// MẢNG DỮ LIỆU RIÊNG CHO DROPDOWN TÀI KHOẢN (Giữ nguyên)
// =========================================================

interface UserDropdownItem {
    id: string;
    name: string;
    href: string;
    icon: LucideIcon;
}

const USER_DROPDOWN_ITEMS: UserDropdownItem[] = [
    {
        id: 'profile',
        name: 'Thông tin cá nhân',
        href: '/tai-khoan/thong-tin-ca-nhan',
        icon: UserIcon,
    },
    {
        id: 'orders',
        name: 'Đơn hàng của tôi',
        href: '/tai-khoan/don-hang',
        icon: ListChecks,
    },
    {
        id: 'favorites',
        name: 'Sản phẩm yêu thích',
        href: '/tai-khoan/yeu-thich',
        icon: Heart,
    },
    {
        id: 'address',
        name: 'Địa chỉ nhận hàng',
        href: '/tai-khoan/dia-chi',
        icon: MapPin,
    },
];

// =========================================================
// UTILITIES (Giữ nguyên)
// =========================================================

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    }).format(amount);
};

const debounce = <T extends unknown[]>(
    func: (...args: T) => void,
    delay: number,
) => {
    let timeoutId: number | undefined;
    return (...args: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay) as unknown as number;
    };
};

// CẬP NHẬT: Định nghĩa lại mobileNavItems để chứa href và icon
interface MobileNavItem {
    name: string;
    href: string;
    icon?: LucideIcon;
}

const mobileNavItems: MobileNavItem[] = [
    { name: "Điện thoại", href: "/mobile", icon: Smartphone },
    { name: "Laptop", href: "/laptop", icon: Monitor },
    { name: "Âm thanh, Mic", href: "#", icon: Mic },
    { name: "Đồng hồ, Camera", href: "#", icon: Watch },
];

// --- Sub-Component: ProductSuggestion (Giữ nguyên) ---

interface ProductSuggestionProps {
    suggestions: ProductSuggestionItem[];
    baseImageUrl: string;
}

const ProductSuggestion: React.FC<ProductSuggestionProps> = ({
    suggestions,
    baseImageUrl,
}) => {
    if (suggestions.length === 0) {
        return (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
                <p className="text-sm text-gray-500">
                    Không tìm thấy sản phẩm nào phù hợp.
                </p>
            </div>
        );
    }

    return (
        <div className="max-h-auto absolute left-0 right-0 top-full z-20 mt-1 overflow-y-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="mb-2 px-2 text-xs font-bold uppercase text-red-600">
                Gợi ý sản phẩm
            </div>
            <ul className="divide-y divide-gray-100">
                {suggestions.map((product) => (
                    <li key={product.id}>
                        <a
                            href={`/san-pham/${product.slug}`}
                            className="flex items-center p-2 transition hover:bg-gray-100"
                        >
                            <img
                                src={`${baseImageUrl}${product.thumbnail}`}
                                alt={product.name}
                                className="mr-3 h-12 w-12 flex-shrink-0 rounded border object-contain"
                            />
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-gray-800">
                                    {product.name}
                                </p>
                                <div className="mt-0.5 flex items-baseline gap-2">
                                    <span className="text-sm font-semibold text-red-600">
                                        {formatCurrency(product.special_price || product.price)}
                                    </span>
                                    {product.special_price && (
                                        <span className="text-xs text-gray-500 line-through">
                                            {formatCurrency(product.price)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
            <div className="mt-2 flex justify-center border-t border-gray-100 pt-2">
                <a
                    href={`/tim-kiem?q=${encodeURIComponent(suggestions[0]?.name || "")}`}
                    className="flex items-center text-xs font-semibold text-blue-600 transition hover:text-blue-800"
                >
                    Xem tất cả kết quả
                    <ChevronRight className="ml-1 h-3 w-3" />
                </a>
            </div>
        </div>
    );
};

// --- Main Component: HeaderMain ---

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

const HeaderMain: React.FC = () => {
    // Lấy trạng thái Auth
    const {
        isAuthenticated,
        logout,
    } = useAuthStore();

    // Lấy dữ liệu User Profile
    const { user, loading } = useCustomerProfileStore(); 

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeAuthModal, setActiveAuthModal] = useState<ModalType>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState<
        ProductSuggestionItem[]
    >([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

    const isLoggedIn = isAuthenticated; 
    
    // Dữ liệu người dùng hiển thị
    const userName = user?.name || "Bạn";
    const userPhone = user?.phone || "Chưa có SĐT";
    
    // Dữ liệu tổng đơn hàng và tổng chi tiêu
    const totalOrders = user?.totalOrders ?? 0;
    const totalAmountSpent = user?.totalAmountSpent ?? 0;

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const openLoginModal = () => setActiveAuthModal("login");

    const closeAuthModal = () => {
        setActiveAuthModal(null);
    };

    const handleStoreLogout = () => {
        logout(); 
        setIsDropdownOpen(false); 
        setIsMobileMenuOpen(false); // Thêm đóng menu mobile khi đăng xuất
    };

    const cartItems = useCartStore((state) => state.items);

    const totalCartQuantity = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    // --- Search Suggestion Logic (Giữ nguyên) ---

    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query || query.trim().length < 2) {
            setSearchSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/public/product/search?q=${encodeURIComponent(
                    query,
                )}&size=6`,
            );

            if (!response.ok) {
                throw new Error("Failed to fetch search suggestions");
            }

            const data = await response.json();
            if (data.code === 1000 && data.data && Array.isArray(data.data.items)) {
                setSearchSuggestions(data.data.items as ProductSuggestionItem[]);
            } else {
                setSearchSuggestions([]);
            }
        } catch (error) {
            console.error("Lỗi khi fetch gợi ý tìm kiếm:", error);
            setSearchSuggestions([]);
        }
    }, []);

    const debouncedFetchSuggestions = useMemo(
        () => debounce(fetchSuggestions, 300),
        [fetchSuggestions],
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length >= 2) {
            setIsSuggestionsVisible(true);
            debouncedFetchSuggestions(query);
        } else {
            setIsSuggestionsVisible(false);
            setSearchSuggestions([]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const searchContainer = document.getElementById(
                "search-suggestion-container",
            );
            const userMenuContainer = document.getElementById("user-menu-dropdown");

            if (searchContainer && !searchContainer.contains(event.target as Node)) {
                setIsSuggestionsVisible(false);
            }
            if (userMenuContainer && !userMenuContainer.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- Auth Button Components (PC DROPDOWN) ---

    const AuthButton = isLoggedIn ? (
        <div className="relative hidden flex-shrink-0 md:block" id="user-menu-dropdown">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center rounded-lg bg-[#e45464] px-4 py-2.5 text-white transition hover:bg-red-400"
            >
                <span className="text-sm font-normal">Tài khoản</span>
                <User className="ml-2 h-5 w-5" />
            </button>
            {isDropdownOpen && (
                <div 
                    className="absolute right-0 top-full z-10 mt-2 w-64 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                >
                    <div className="block border-b px-4 py-2 text-sm font-semibold text-gray-700">
                        {/* HIỂN THỊ TÊN VÀ SĐT (PC) */}
                        <p className="truncate">Xin chào, {userName}!</p>
                        <p className="text-xs font-normal text-gray-500 mt-0.5">SĐT: {userPhone}</p>
                    </div>
                    
                    {/* VÙNG THỐNG KÊ MUA HÀNG (PC) */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-3 border-b border-gray-100">
                        <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 leading-tight">Đơn hàng</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight">{totalOrders}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 leading-tight">Đã chi</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight truncate">{formatCurrency(totalAmountSpent)}</p>
                            </div>
                        </div>
                    </div>

                    {/* RENDER CÁC MỤC TỪ MẢNG DỮ LIỆU */}
                    {USER_DROPDOWN_ITEMS.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <a
                                key={item.id}
                                href={item.href}
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                                role="menuitem"
                            >
                                <IconComponent className="mr-2 h-4 w-4" /> {item.name}
                            </a>
                        );
                    })}

                    <button
                        onClick={handleStoreLogout} 
                        className="flex w-full items-center border-t border-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                        role="menuitem"
                    >
                        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                    </button>
                </div>
            )}
        </div>
    ) : (
        // CHƯA ĐĂNG NHẬP (Giữ nguyên)
        <button
            onClick={openLoginModal}
            className="hidden flex-shrink-0 items-center rounded-lg bg-[#e45464] px-4 py-2.5 text-white transition hover:bg-red-400 md:flex"
        >
            <span className="text-sm font-normal">Đăng nhập</span>
            <User className="ml-2 h-5 w-5" />
        </button>
    );

    const MobileAuthInfo = isLoggedIn ? (
        // Mobile: Đã đăng nhập (Điều chỉnh khu vực chào mừng và thống kê)
        <div className="flex flex-col space-y-3">
            {/* KHU VỰC CHÀO MỪNG */}
            <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
                <UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold truncate text-gray-800">Xin chào, {userName}</p>
                    <p className="text-xs font-normal text-gray-600">SĐT: {userPhone}</p>
                </div>
            </div>

            {/* VÙNG THỐNG KÊ MUA HÀNG (MOBILE) */}
            <div className="grid grid-cols-2 gap-2 text-center text-gray-700">
                <div className="rounded-lg bg-gray-100 p-2">
                    <Package className="h-5 w-5 mx-auto text-red-500 mb-1" />
                    <p className="text-xs font-medium">Đơn hàng đã mua</p>
                    <p className="text-sm font-bold text-gray-900">{totalOrders}</p>
                </div>
                <div className="rounded-lg bg-gray-100 p-2">
                    <DollarSign className="h-5 w-5 mx-auto text-green-600 mb-1" />
                    <p className="text-xs font-medium">Tổng tiền đã chi</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{formatCurrency(totalAmountSpent)}</p>
                </div>
            </div>
        </div>
    ) : (
        // Mobile: Chưa đăng nhập (Giữ nguyên)
        <button
            onClick={() => {
                setIsMobileMenuOpen(false);
                openLoginModal();
            }}
            className="flex items-center justify-center rounded-lg bg-[#e45464] px-3 py-2.5 text-white transition hover:bg-red-400 w-full"
        >
            <User className="mr-2 h-5 w-5" />
            <span className="text-sm font-normal">Đăng nhập / Đăng ký</span>
        </button>
    );

    // --- Render ---

    return (
        <>
            <div className="bg-[linear-gradient(to_right,#e51d38_0%,#ec4352_100%)] px-0 md:px-4">
                <div className="mx-auto max-w-7xl py-3">
                    <div className="flex h-12 items-center justify-between gap-4">
                        {/* Logo và Danh mục PC (Giữ nguyên) */}
                        <a
                            href="/"
                            className="hidden flex-shrink-0 items-center pr-2 lg:flex"
                        >
                            <img src="/src/assets/logo.png" alt="Logo" className="h-8" />
                        </a>
                        <a
                            href="/"
                            className="ml-1 flex h-full w-10 flex-shrink-0 items-center justify-center rounded-lg lg:hidden"
                        >
                            <img
                                src="/src/assets/logo-dth_1592615391.png"
                                alt="S Logo"
                                className="h-full w-full object-contain"
                            />
                        </a>
                        <button className="hidden flex-shrink-0 items-center rounded-lg bg-[#e45464] px-3 py-3 text-white transition hover:bg-red-400 md:flex">
                            <Menu className="mr-1 h-5 w-5" />
                            <span className="hidden text-sm font-normal lg:block">
                                Danh mục
                            </span>
                            <ChevronDown className="ml-1 h-4 w-4" />
                        </button>
                        {/* Thanh tìm kiếm + Gợi ý (Giữ nguyên) */}
                        <div
                            id="search-suggestion-container"
                            className="relative max-w-2xl flex-1"
                        >
                            <input
                                type="text"
                                placeholder="Bạn muốn mua gì hôm nay?"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => {
                                    if (searchQuery.trim().length >= 2) {
                                        setIsSuggestionsVisible(true);
                                    }
                                }}
                                className="f w-full rounded-lg py-2.5 pl-12 pr-4 text-sm text-gray-800 transition focus:outline-none"
                            />
                            <div className="absolute left-0 top-0 flex h-full w-12 items-center justify-center text-gray-400">
                                <Search className="h-5 w-5" />
                            </div>

                            {isSuggestionsVisible && searchSuggestions.length > 0 && (
                                <ProductSuggestion
                                    suggestions={searchSuggestions}
                                    baseImageUrl={IMAGE_BASE_URL}
                                />
                            )}
                            {isSuggestionsVisible &&
                                searchQuery.length >= 2 &&
                                searchSuggestions.length === 0 && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
                                        <p className="text-sm text-gray-500">
                                            Không tìm thấy sản phẩm nào cho "{searchQuery}".
                                        </p>
                                    </div>
                                )}
                        </div>
                        {/* Nhóm Icons Mobile (Giỏ hàng, Menu) */}
                        <div className="flex flex-shrink-0 items-center justify-center gap-2 md:hidden">
                            <a
                                href="/gio-hang"
                                className="relative flex items-center text-sm text-white transition hover:text-red-100"
                            >
                                <ShoppingCart className="h-7 w-7" />
                                {totalCartQuantity > 0 && (
                                    <span className="absolute -top-1 right-0 inline-flex h-5 w-5 translate-x-1/2 transform items-center justify-center rounded-full bg-[#ffd785] text-xs font-bold leading-none text-black">
                                        {totalCartQuantity}
                                    </span>
                                )}
                            </a>
                            <button
                                onClick={toggleMenu}
                                className="mt-1 flex items-center px-2 text-sm text-white transition hover:text-red-100"
                            >
                                <Menu className="h-7 w-7" />
                            </button>
                        </div>
                        {/* Giỏ hàng PC & Auth Button PC (Giữ nguyên) */}
                        <a
                            href="/gio-hang"
                            className="relative hidden flex-shrink-0 items-center px-2 text-sm text-white transition hover:text-red-100 md:flex"
                        >
                            <ShoppingCart className="h-7 w-7" />
                            <span className="ml-1 font-normal">Giỏ hàng</span>
                            {totalCartQuantity > 0 && (
                                <span className="absolute -top-1 right-0 inline-flex h-5 w-5 translate-x-1/2 transform items-center justify-center rounded-full bg-[#ffd785] text-xs font-bold leading-none text-black">
                                    {totalCartQuantity}
                                </span>
                            )}
                        </a>
                        {AuthButton}
                    </div>
                </div>
                {/* Overlay Mobile (Giữ nguyên) */}
                <div
                    className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 md:hidden ${
                        isMobileMenuOpen
                            ? "pointer-events-auto opacity-50"
                            : "pointer-events-none opacity-0"
                    }`}
                    onClick={toggleMenu}
                ></div>
                {/* Mobile Sidebar */}
                <div
                    className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between bg-red-600 p-3 text-white shadow-md">
                            <h2 className="text-lg font-bold">Menu</h2>
                            <button
                                onClick={toggleMenu}
                                className="rounded-full transition hover:bg-red-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        {/* Khối chứa thông tin người dùng và menu cuộn được */}
                        <div className="flex-1 overflow-y-auto pb-4">
                            
                            {/* Vùng chào mừng, thống kê, và Đăng nhập/đăng ký */}
                            <div className="flex flex-col border-b border-gray-100 p-4">
                                {MobileAuthInfo}
                            </div>

                            {/* RENDER MỤC TÀI KHOẢN TRÊN MOBILE */}
                            {isLoggedIn && (
                                <div className="flex flex-col border-b border-gray-100 pb-2">
                                    <div className="px-3 py-2 text-base font-semibold text-gray-800">Quản lý Tài khoản</div>
                                    <nav>
                                        <ul className="m-0 list-none p-0">
                                            {USER_DROPDOWN_ITEMS.map((item) => {
                                                const IconComponent = item.icon;
                                                return (
                                                    <li key={item.id}>
                                                        <a
                                                            href={item.href}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="flex items-center justify-between p-3 text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <span className="flex items-center font-medium text-sm">
                                                                <IconComponent className="mr-3 h-4 w-4" /> 
                                                                {item.name}
                                                            </span>
                                                            <ChevronRight className="h-4 w-4" />
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </nav>
                                </div>
                            )}

                            {/* Nav mobile (Danh mục sản phẩm) */}
                            <nav>
                                <ul className="m-0 list-none p-0">
                                    <div className="px-3 py-2 text-base font-semibold text-gray-800">Danh mục</div>
                                    {mobileNavItems.map((item, index) => {
                                        const IconComponent = item.icon || ChevronRight; // Fallback icon
                                        return (
                                            <li key={index}>
                                                <a
                                                    href={item.href} 
                                                    className="flex items-center text-sm justify-between p-3 text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <span className="flex items-center font-medium">
                                                        {item.icon && <IconComponent className="mr-3 h-4 w-4 text-gray-500" />}
                                                        {item.name}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </div>
                        
                        {isLoggedIn && (
                            <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0">
                                <button
                                    onClick={handleStoreLogout} 
                                    className="flex w-full"
                                >
                                    <LogOut className="mr-2 h-4 w-4 text-gray-800" />
                                    <span className="text-sm font-normal">Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AuthModals
                initialModal={activeAuthModal}
                onAuthenticationSuccess={closeAuthModal}
            />
        </>
    );
};

export default HeaderMain;