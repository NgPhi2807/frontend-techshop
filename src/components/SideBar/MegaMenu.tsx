import React from "react";

interface FilterValue {
  value: string;
  label: string;
}
interface FilterGroup {
  code: string;
  label: string;
  values: FilterValue[];
}

type NavItemKey = "phone" | "laptop";

interface MegaMenuProps {
  category: NavItemKey | null;
  mobileData: FilterGroup[];
  laptopData: FilterGroup[];
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  category,
  mobileData,
  laptopData,
}) => {
  if (category !== "phone" && category !== "laptop") {
    return null;
  }
  const data = category === "phone" ? mobileData : laptopData;
  if (data.length === 0) {
    return null;
  }
  const relativeWidth = "456%";

  return (
    <div
      className="absolute left-full top-0 z-50 h-full overflow-y-auto rounded-lg border-l border-gray-200 bg-white p-6 shadow-2xl"
      style={{
        width: relativeWidth,
      }}
    >
      <div className="grid grid-cols-12 gap-x-6 gap-y-4">
        {data.map((group) => (
          <div
            key={group.code}
            className={`col-span-12 mb-1 border-b border-gray-100 pb-3 ${
              group.label === "Hãng sản xuất" || group.label === "Thương hiệu"
                ? "col-span-12"
                : "col-span-4"
            }`}
          >
            <h3 className="mb-2 text-sm font-bold text-gray-900">
              {group.label}
            </h3>
            <div
              className={`grid gap-3 ${
                group.label === "Hãng sản xuất" || group.label === "Thương hiệu"
                  ? "grid-cols-6"
                  : group.label === "Tính năng camera" ||
                      group.label === "Dung lượng RAM"
                    ? "grid-cols-2"
                    : "grid-cols-2"
              }`}
            >
              {group.values.map((item) => (
                <a
                  key={item.value}
                  href={`#filter?${group.code}=${item.value}`}
                  className={`rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-medium transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-600 ${
                    group.label === "Hãng sản xuất" ||
                    group.label === "Thương hiệu"
                      ? "bg-white"
                      : "bg-gray-50"
                  } `}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
