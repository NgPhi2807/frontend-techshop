// src/components/ProductDetail/ProductCommitment.tsx

import React from "react";
// 🚀 Import các icons từ Lucide React
import { Smartphone, ShieldCheck, Settings, Tag } from "lucide-react";

// Định nghĩa Interface cho mỗi mục cam kết
interface CommitmentItem {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

// Giả định các Icons và Nội dung dựa trên hình ảnh
const commitmentData: CommitmentItem[] = [
  {
    id: 1, // Icon Lucide: Smartphone (thay cho icon điện thoại)
    icon: <Smartphone className="h-5 w-5 text-white" />,
    title: "Mới, đầy đủ phụ kiện từ nhà sản xuất",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất", // Giữ nội dung ngắn gọn như ảnh gốc
  },
  {
    id: 2, // Icon Lucide: ShieldCheck (thay cho icon lá chắn/bảo vệ)
    icon: <ShieldCheck className="h-5 w-5 text-white" />,
    title: "Bảo hành và Đổi trả",
    description: (
      <>
        Bảo hành 13 tháng tại trung tâm bảo hành Chính hãng, +100 ngày và bảo
        hành rơi vỡ màn hình 60 ngày. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng
        từ nhà sản xuất.{" "}
        <a href="#" className="text-blue-600 hover:underline">
          Xem chi tiết{" "}
        </a>{" "}
      </>
    ),
  },
  {
    id: 3, // Icon Lucide: Settings (thay cho icon bánh răng/công cụ)
    icon: <Settings className="h-5 w-5 text-white" />,
    title: "Quà tặng và Phụ kiện đi kèm",
    description:
      "Điện thoại Tecno camon 30, ốp lưng, bộ sạc, miếng dán cường lực", // Giữ nội dung ngắn gọn như ảnh gốc
  },
  {
    id: 4, // Icon Lucide: Tag (thay cho icon thẻ tag)
    icon: <Tag className="h-6 w-6 text-white" />,
    title: "Đã bao gồm thuế GTGT (VAT)",
    description:
      "Giá sản phẩm đã bao gồm thuế VAT, giúp bạn yên tâm và dễ dàng trong việc tính toán chi phí.",
  },
];

const CommitmentCard: React.FC<CommitmentItem> = ({ icon, description }) => (
  <div className="flex flex-col items-start rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md">
    <div className="flex flex-col items-start gap-2 lg:flex-row">
      <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-600 p-2">
        {icon}{" "}
      </div>
      <p className="text-xs font-normal leading-relaxed text-gray-700">
        {description}{" "}
      </p>{" "}
    </div>{" "}
  </div>
);

export const ProductCommitment: React.FC = () => {
  return (
    <div className="product-commitment w-full">
      <h2 className="mb-6 text-xl font-bold text-gray-800">Cam kết sản phẩm</h2>{" "}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
        {commitmentData.map((item) => (
          <CommitmentCard
            key={item.id}
            id={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}{" "}
      </div>{" "}
    </div>
  );
};

export default ProductCommitment;
