import React, { useState } from "react";
import {
  Smartphone,
  Laptop,
  ChevronRight,
  Headphones,
  Watch,
  Home,
  Package,
  Monitor,
} from "lucide-react";
export interface FilterValue {
  value: string;
  label: string;
}

export interface FilterGroup {
  code: string;
  label: string;
  values: FilterValue[];
}

export interface NavItem {
  icon: React.ElementType;
  label: string;
  key?: "phone" | "laptop";
  href: string;
}

const navItems: NavItem[] = [
  { icon: Smartphone, label: "Điện thoại", key: "phone", href: "/mobile" },
  { icon: Laptop, label: "Laptop", key: "laptop", href: "/laptop" },
  { icon: Headphones, label: "Âm thanh", href: "/am-thanh" },
  { icon: Watch, label: "Đồng hồ, Camera", href: "/dong-ho-camera" },
  { icon: Home, label: "Đồ gia dụng", href: "/do-gia-dung" },
  { icon: Package, label: "Phụ kiện", href: "/phu-kien" },
  { icon: Monitor, label: "PC", href: "/pc" },
];

interface SidebarNavProps {
  mobilefilter: FilterGroup[];
  laptopfilter: FilterGroup[];
}

const SidebarNav: React.FC<SidebarNavProps> = ({

}) => {
  const [hoveredKey, setHoveredKey] = useState<NavItem["key"] | null>(null);
  const HOVER_BUFFER_WIDTH_CLASS = "pr-4";
  return (
    <div
      className={`relative h-full ${HOVER_BUFFER_WIDTH_CLASS}`}
      onMouseLeave={() => setHoveredKey(null)}
    >
      <nav
        className={`h-full rounded-lg border border-gray-200 bg-white p-3 shadow-xl`}
      >
        <ul className="list-none">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.key && item.key === hoveredKey;

            return (
              <li key={index}>
                <a
                  href={item.href}
                  className={`flex cursor-pointer items-center rounded-lg p-3 font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600 ${
                    isActive ? "bg-red-50 text-red-600" : ""
                  }`}
                  onMouseEnter={() => setHoveredKey(item.key || null)}
                >
                  <Icon className="mr-3 h-5 w-5 text-red-600" strokeWidth={2} />
                  <div className="flex-1 text-sm">{item.label}</div>

                  {item.key && (
                    <ChevronRight
                      className={`ml-2 h-4 w-4 ${
                        isActive ? "text-red-600" : "text-gray-400"
                      }`}
                      strokeWidth={2}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
   
    </div>
  );
};

export default SidebarNav;
