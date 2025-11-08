import React from "react";
import {
  DollarSign,
  Award,
  Truck,
  MapPin,
  Clock,
  Phone,
} from "lucide-react";

const items = [
  { icon: DollarSign, label: "Trả góp 0%, trả sau 300k" },
  { icon: Award, label: "Sản phẩm chính hãng - Xuất VAT đầy đủ" },
  { icon: Truck, label: "Giao nhanh - Miễn phí cho đơn từ ₫" },
  { icon: MapPin, label: "Cửa hàng gần bạn" },
  { icon: Clock, label: "Tra cứu đơn hàng" },
  { icon: Phone, label: "1900 2097" },
];

const HeaderTopBar: React.FC = () => {
  return (
    <div className="hidden lg:block bg-gradient-to-r from-[#e51d38] to-[#ec4352] overflow-hidden mx-auto max-w-screen-xl">
      <div className="relative whitespace-nowrap">
        <div
          className="flex animate-marquee gap-10 px-4 py-3 marquee-container"
          style={{ display: "inline-flex" }}
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-xs text-white"
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
              </div>
            );
          })}
          {/* Lặp lại items để chạy liên tục */}
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`dup-${idx}`}
                className="flex items-center gap-1.5 text-xs text-white"
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeaderTopBar;
