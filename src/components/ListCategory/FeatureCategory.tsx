import React from 'react';

const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL;

interface Feature {
  id: number;
  name: string;
  slug: string;
  categoryType: string;
  logo: string | null;
}

interface ProductFeatureListProps {
  feature: Feature[];
}

const ProductFeatureList: React.FC<ProductFeatureListProps> = ({ feature }) => {
  if (!feature || feature.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full justify-center">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto px-1 pt-3">
        {feature.map((item) => (
          <a
            key={item.id}
            href={`/${item.slug}`}
            className="flex-shrink-0 whitespace-nowrap rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-300 lg:text-sm"
          >
            <div className="flex flex-row items-center justify-center gap-2">
              {item.logo && (
                <img
                  src={`${IMAGE_BASE_URL}${item.logo}`}
                  alt={item.name}
                  className="mb-1 h-8 w-auto object-contain lg:h-12"
                />
              )}
              <p className="text-sm text-black">{item.name}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ProductFeatureList;