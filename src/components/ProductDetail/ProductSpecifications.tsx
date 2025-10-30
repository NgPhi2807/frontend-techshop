import React, { useMemo, useState } from "react";

// --- INTERFACE & MAPPINGS ---
interface ProductDetail {
  [key: string]: any;
}

interface ProductSpecificationsProps {
  productDetails: ProductDetail;
}

interface SpecItem {
  label: string;
  value: string | React.ReactNode;
  order: number;
}

const SPEC_MAPPINGS: { [key: string]: { label: string; order: number } } = {
  display_size: { label: "Kích thước màn hình", order: 10 },
  mobile_type_of_display: { label: "Công nghệ màn hình", order: 20 },
  display_resolution: { label: "Độ phân giải màn hình", order: 30 },
  mobile_tan_so_quet: { label: "Tần số quét", order: 40 },
  camera_primary: { label: "Camera sau", order: 50 },
  camera_secondary: { label: "Camera trước", order: 60 },
  chipset: { label: "Chipset", order: 70 },
  cpu: { label: "Loại CPU", order: 80 },
  mobile_ram_filter: { label: "Dung lượng RAM", order: 90 },
  storage: { label: "Bộ nhớ trong", order: 100 },
  iphone_pin_text: { label: "Pin (thông số hãng)", order: 110 },
  battery: { label: "Pin (dung lượng)", order: 120 },
  mobile_cong_sac: { label: "Cổng sạc", order: 130 },
  os_version: { label: "Hệ điều hành", order: 140 },
  laptop_ram: { label: "Dung lượng RAM", order: 91 },
  hdd_sdd: { label: "Ổ cứng", order: 101 },
  vga: { label: "Card đồ họa", order: 150 },
  laptop_filter_gpu: { label: "Loại card đồ họa", order: 151 },
  ports_slots: { label: "Cổng giao tiếp", order: 160 },
  mobile_nfc: { label: "Công nghệ NFC", order: 170 },
  sim: { label: "Thẻ SIM", order: 180 },
  dimensions: { label: "Kích thước", order: 190 },
  product_weight: { label: "Trọng lượng", order: 200 },
  chong_nuoc: { label: "Chuẩn kháng nước/bụi", order: 210 },
  mobile_khang_nuoc_bui: { label: "Chuẩn kháng nước/bụi", order: 211 },
  bluetooth: { label: "Bluetooth", order: 220 },
  wlan: { label: "Wi-Fi", order: 230 },
  display_type: { label: "Tính năng màn hình", order: 240 },
  mobile_display_features: { label: "Tính năng màn hình", order: 241 },
};

const formatSpecsForDisplay = (details: ProductDetail): SpecItem[] => {
  const dataArray: SpecItem[] = [];
  const processedKeys = new Set<string>();

  for (const key in SPEC_MAPPINGS) {
    if (details.hasOwnProperty(key)) {
      const map = SPEC_MAPPINGS[key];
      let value = details[key];

      if (
        !value ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "object" && Object.keys(value).length === 0)
      ) {
        continue;
      }

      if (typeof value === "boolean") {
        value = value ? "Có" : "Không";
      }

      if (Array.isArray(value)) {
        value = value.join(", ");
      }

      if (typeof value === "string") {
        value = value.trim();
        if (value.toLowerCase() === "no_selection") continue;
      }

      if (value) {
        dataArray.push({
          label: map.label,
          value: value,
          order: map.order,
        });
        processedKeys.add(key);
      }
    }
  }

  dataArray.sort((a, b) => a.order - b.order);

  const finalSpecs: SpecItem[] = [];
  const uniqueLabels = new Set<string>();

  for (const spec of dataArray) {
    if (!uniqueLabels.has(spec.label)) {
      uniqueLabels.add(spec.label);
      finalSpecs.push(spec);
    }
  }

  return finalSpecs;
};

// --- RENDERER GIÁ TRỊ (Giữ nguyên) ---
const SpecValueRenderer: React.FC<{ value: string | React.ReactNode }> = ({
  value,
}) => {
  if (typeof value !== "string") return <>{value}</>;
  if (value.includes("<br>")) {
    return (
      <>
        {value.split("<br>").map((line, i) => (
          <p
            key={i}
            className="mb-1 last:mb-0"
            dangerouslySetInnerHTML={{ __html: line.trim() }}
          ></p>
        ))}
      </>
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: value.trim() }}></span>;
};

// --- COMPONENT CHI TIẾT DẠNG BẢNG (Giữ nguyên) ---
const ProductSpecsDetailContent: React.FC<{
  displaySpecs: SpecItem[];
  onClose: () => void;
}> = ({ displaySpecs, onClose }) => {
  return (
    <div className="product-specs-detail flex max-h-[100vh] w-full flex-col">
      {/* Header của Drawer */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-bold text-gray-800">Thông số nổi bật</h2>
        <button
          onClick={onClose}
          className="text-gray-500 transition hover:text-gray-800"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-grow overflow-auto bg-white">
        <div>
          <img src="" alt="" />
        </div>
        {displaySpecs.map((spec, index) => (
          <div key={index} className={`flex border-t border-gray-200 text-sm`}>
            <div className="w-1/3 flex-shrink-0 bg-gray-50 p-3 font-medium text-gray-600">
              {spec.label}
            </div>
            <div className="w-2/3 border-l border-gray-100 p-3 text-xs text-gray-800">
              <SpecValueRenderer value={spec.value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT DRAWER (Giữ nguyên) ---
const Drawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={onClose}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen ? "opacity-50" : "opacity-0"}`}
      ></div>

      <div
        className={`fixed right-0 top-0 h-full transform bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"} w-full max-w-full sm:w-[600px]`} // w-full cho mobile, w-[450px] cho PC
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ĐÃ SỬA ĐỔI ---
export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  productDetails,
}) => {
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  const displaySpecs = useMemo(() => {
    if (!productDetails) return [];
    return formatSpecsForDisplay(productDetails);
  }, [productDetails]);

  if (!productDetails || displaySpecs.length === 0) {
    return null;
  }

  const highlights = displaySpecs.slice(0, 3);
  const hasMoreSpecs = displaySpecs.length > 3;

  return (
    <div className="product-specs-container w-full py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800 lg:text-xl">
          Thông số nổi bật
        </h2>
        {hasMoreSpecs && (
          <button
            onClick={() => setShowDetailDrawer(true)}
            className="rounded-full border border-red-500 px-4 py-1.5 text-xs font-medium text-red-600 transition duration-150 ease-in-out hover:bg-red-50 lg:text-sm"
          >
            Xem tất cả thông số
          </button>
        )}
      </div>

      <div className="flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {highlights.map((spec, index) => (
          <div
            key={index}
            className="flex min-w-0 flex-1 flex-col items-start justify-center p-4"
          >
            <p className="mb-2 text-sm font-semibold text-black lg:text-base">
              {spec.label}
            </p>
            <div className="flex items-center space-x-2">
              <p className="lg:text-báe line-clamp-1 text-xs font-bold text-gray-600">
                {typeof spec.value === "string"
                  ? spec.value.split("<br>")[0].trim()
                  : spec.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Drawer
        isOpen={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
      >
        <ProductSpecsDetailContent
          displaySpecs={displaySpecs}
          onClose={() => setShowDetailDrawer(false)}
        />
      </Drawer>
    </div>
  );
};

export default ProductSpecifications;
