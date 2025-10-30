import React from "react";
import {
  DollarSign,
  RefreshCw,
  Award,
  Truck,
  MapPin,
  Clock,
  Phone,
} from "lucide-react";

const NavItem: React.FC<{ icon: React.ElementType; label: string }> = ({
  icon: Icon,
  label,
}) => (
  <a
    href="#"
    className="flex items-center gap-1.5 text-xs text-white transition hover:text-red-100"
  >
    <Icon className="h-4 w-4" strokeWidth={2} />
    {label}
  </a>
);

const HeaderTopBar: React.FC = () => {
  return (
    <div className="hidden bg-[linear-gradient(to_right,#e51d38_0%,#ec4352_100%)] lg:block">
      <div className="mx-auto max-w-screen-xl py-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-6">
            <NavItem icon={DollarSign} label="Trả góp 0%, trả sau 300k" />

            <NavItem
              icon={Award}
              label="Sản phẩm chính hãng - Xuất VAT đầy đủ"
            />
            <NavItem icon={Truck} label="Giao nhanh - Miễn phí cho đơn từ ₫" />
          </div>

          <div className="flex space-x-6">
            <NavItem icon={MapPin} label="Cửa hàng gần bạn" />
            <NavItem icon={Clock} label="Tra cứu đơn hàng" />
            <NavItem icon={Phone} label="1900 2097" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTopBar;
