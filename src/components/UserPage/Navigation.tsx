import React, { useEffect } from "react";
import {
  Package,
  Heart,
  MapPin,
  Shield,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCustomerProfileStore } from ".././../stores/useCustomerProfileStore";

// Hàm trợ giúp để chuẩn hóa đường dẫn bằng cách loại bỏ dấu '/' ở cuối
const normalizePath = (path: string) => {
  // Loại bỏ các tham số query (sau dấu ?)
  const base = path.split("?")[0];
  // Loại bỏ dấu '/' ở cuối nếu có, trừ khi đường dẫn chỉ là '/'
  return base.endsWith("/") && base.length > 1 ? base.slice(0, -1) : base;
};

interface NavItem {
  icon: LucideIcon;
  text: string;
  href: string;
}

const primaryNavItems: NavItem[] = [
  {
    icon: User,
    text: "Thông Tin Cá Nhân",
    href: "/tai-khoan/thong-tin-ca-nhan",
  },
  {
    icon: Package,
    text: "Đơn hàng của tôi",
    href: "/tai-khoan/don-hang-cua-toi",
  },
  {
    icon: Heart,
    text: "Sản phẩm yêu thích",
    href: "/tai-khoan/yeu-thich",
  },
];

const secondaryNavItems: NavItem[] = [
  {
    icon: MapPin,
    text: "Sổ địa chỉ nhận hàng",
    href: "/tai-khoan/dia-chi-nhan-hang",
  },
  {
    icon: Shield,
    text: "Thông tin bảo hành",
    href: "/tai-khoan/thong-tin-bao-hanh",
  },
];

const footerNavItems: NavItem[] = [
  { icon: LogOut, text: "Đăng xuất", href: "/logout" },
];

interface MyAccountNavigationProps {
  currentPath?: string; 
}

const AccountNavigation: React.FC<MyAccountNavigationProps> = ({
  currentPath, 
}) => {
  const { user, loading, error, fetchProfile } = useCustomerProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const path = React.useMemo(() => {
    if (currentPath) {
      return normalizePath(currentPath);
    }
    if (typeof window !== "undefined") {
      return normalizePath(window.location.pathname);
    }
    return normalizePath("/tai-khoan/thong-tin-ca-nhan"); 
  }, [currentPath]);


  const renderNavSection = (items: NavItem[]) => (
    // Giảm py-2 thành py-1
    <nav className="py-1">
      {items.map((item) => {
        const IconComponent = item.icon;
        
        const normalizedItemHref = normalizePath(item.href);
        const isActive = normalizedItemHref === path;

        // 🔑 SỬA ĐỔI: Giảm padding dọc (py-3 -> py-2.5) và padding ngang (px-4 -> px-3)
        const baseClasses =
          "flex items-center justify-between py-2.5 px-3 transition duration-200 ease-in-out border-l-4 border-transparent group rounded-r-md ";
        const hoverClasses = "hover:bg-red-50 hover:border-red-500";
        const activeClasses = isActive
          ? "border-red-600 bg-red-50 shadow-sm"
          : "";

        // Giữ nguyên kích thước và màu sắc icon/text để đảm bảo khả năng đọc
        const iconClasses = isActive
          ? "mr-3 h-5 w-5 text-red-600 transition" // Giảm mr-4 -> mr-3
          : "mr-3 h-5 w-5 text-gray-600 group-hover:text-red-500 transition"; // Giảm mr-4 -> mr-3

        const textClasses = isActive
          ? "text-sm font-semibold text-red-600"
          : "text-sm font-medium text-gray-700 group-hover:text-red-500";

        return (
          <a
            key={item.text}
            href={item.href}
            className={`w-full ${baseClasses} ${hoverClasses} ${activeClasses}`}
          >
            {/* Giảm translate-x-2 -> translate-x-1 */}
            <div className="flex items-center transition duration-500 ease-in-out group-hover:translate-x-1">
              <IconComponent className={iconClasses} />
              <span className={textClasses}>{item.text}</span>
            </div>
          </a>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-fit rounded-lg bg-gradient-to-br from-white to-gray-50 p-3 font-sans shadow-xl">
      <header className="pb-4">
        {loading && !user ? (
          <div className="flex flex-col items-center">
            <div className="mb-4 h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
            <div className="mb-2 h-5 w-40 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-28 animate-pulse rounded bg-gray-100"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="rounded-full bg-gradient-to-br from-red-500 to-red-600 p-1 shadow-lg">
                <div className="rounded-full bg-white p-3">
                  <User className="h-10 w-10 text-red-600" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
                VIP
              </div>
            </div>
            <div className="w-full">
              {error && !user ? (
                <p className="text-sm font-medium text-red-500">{error}</p>
              ) : (
                <>
                  <h2 className="mb-1 text-xl font-bold text-gray-900">
                    {user?.name}
                  </h2>
                  <p className="mb-3 text-sm font-medium text-gray-500">
                    {user?.phone}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-2 shadow-sm transition hover:shadow-md">
                      <div className="mb-1 flex items-center justify-center">
                        <Package className="mr-1 h-4 w-4 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-600">
                          Đơn hàng
                        </p>
                      </div>
                      <p className="text-lg font-bold text-blue-700">
                        {user?.totalOrders || 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-2 shadow-sm transition hover:shadow-md">
                      <div className="mb-1 flex items-center justify-center">
                        <span className="mr-1 text-xs font-semibold text-emerald-600">
                          💰
                        </span>
                        <p className="text-xs font-semibold text-emerald-600">
                          Tích lũy
                        </p>
                      </div>
                      <p className="text-lg font-bold text-emerald-700">
                        {user?.totalAmountSpent?.toLocaleString() || 0}₫
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="space-y-1">
        {renderNavSection(primaryNavItems)}
        <div className="my-2 border-t border-gray-200"></div> 
        {renderNavSection(secondaryNavItems)}
        <div className="my-2 border-t border-gray-200"></div>
        {renderNavSection(footerNavItems)}
      </div>
    </div>
  );
};

export default AccountNavigation;