import React, { useState } from "react";
import ProDuctImageGallery from "./ProductImageGallery";
import ProductCommitment from "./ProductCommitment";
import ProductSpecifications from "./ProductSpecifications";
import ProductBuyBox from "./ProductBuyBox";

interface Attribute {
  code: string;
  label: string;
  value: string;
}

interface ProductVariant {
  id: number;
  sku: string;
  thumbnail: string;
  price: number;
  specialPrice: number | null;
  attributes: Attribute[];
}

interface ProductData {
  id: number;
  thumbnail: string;
  variants: ProductVariant[];
  detail: {
    msrp: string;
    storage: string;
  };
  name: string;
  rating: {
    total: string;
    average: string;
  };
}

interface ProductDetailProps {
  product: ProductData;
  productDetails: ProductData["detail"];
}

const ProductDetailClient: React.FC<ProductDetailProps> = ({
  product,
  productDetails,
}) => {
  const initialVariantId = product?.variants?.[0]?.id || 0;

  const [selectedVariantId, setSelectedVariantId] =
    useState<number>(initialVariantId);

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-2 pt-2 lg:flex-row 2xl:px-0">
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        <ProDuctImageGallery
          productData={product}
          selectedVariantId={selectedVariantId}
        />
        <ProductCommitment />
        <ProductSpecifications productDetails={productDetails} />
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        <ProductBuyBox
          productData={product}
          onVariantSelect={setSelectedVariantId}
        />
      </div>
    </div>
  );
};

export default ProductDetailClient;
