import React from "react";
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

interface Brand {
  id: number;
  name: string;
  slug: string;
  categoryType: string;
  logo: string | null;
}

interface ProductBrandListProps {
  brands: Brand[];
}

const ProductBrandList: React.FC<ProductBrandListProps> = ({ brands }) => {
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-3">
      <h1 className="pb-2 text-base lg:text-xl font-bold text-black">Chọn theo hãng</h1>
      <div className="flex overflow-x-auto gap-2 lg:grid lg:grid-cols-10 lg:gap-2">
        {brands.map((item) => (
          <a
            key={item.id}
            href={`/${item.slug}`}
            className="flex h-9 min-w-[70px] flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white flex-shrink-0"
          >
            {item.logo && (
              <img
                src={`${IMAGE_BASE_URL}${item.logo}`}
                alt={item.name}
                className="mb-1 h-4 w-auto object-contain hover:scale-105"
              />
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ProductBrandList;
