import React from 'react';

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
    <div className="flex w-full">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto py-3">
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={`/${brand.slug}`}
            className="flex-shrink-0 whitespace-nowrap rounded-md border border-gray-300 px-4 py-1.5 text-xs font-bold text-black shadow-sm transition duration-150 hover:border-red-500 hover:text-red-600 lg:text-sm"
          >
            {brand.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ProductBrandList;