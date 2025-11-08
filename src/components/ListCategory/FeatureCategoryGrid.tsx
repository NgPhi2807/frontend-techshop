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
    <div className="w-full py-3">
      <h1 className="text-base lg:text-xl text-black font-bold pb-2">Chọn theo nhu cầu</h1>

      <div className="flex overflow-x-auto gap-3 lg:grid lg:grid-cols-8 lg:gap-3 lg:px-0">
        {feature.map((item) => (
          <a
            key={item.id}
            href={`/${item.slug}`}
            className="flex-shrink-0 rounded-xl bg-zinc-200 py-2 lg:py-4 text-xs font-medium text-gray-700 lg:text-sm lg:flex-shrink-1"
            style={{ minWidth: '100px' }} 
          >
            <div className="flex flex-col items-center justify-center gap-3">
              {item.logo && (
                <img
                  src={`${IMAGE_BASE_URL}${item.logo}`}
                  alt={item.name}
                  className="h-10 w-auto object-contain lg:h-14 hover:scale-110 transition-transform duration-300"
                />
              )}
              <p className="text-center text-[10px] lg:text-xs text-black">{item.name}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ProductFeatureList;
