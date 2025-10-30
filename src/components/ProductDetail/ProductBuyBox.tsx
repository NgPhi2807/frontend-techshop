import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Check, ShoppingCart, Loader2 } from "lucide-react";
import { useCartStore } from "../../stores/cartStore";
import { ProductFixedBuyBar } from "./ProductFixedBuyBar";
import { toast } from "react-toastify";
import ShopList from "./ShopList";
import { formatCurrency } from "../../utils/currency";

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
  availableStock: number;
}

interface ColorVariant {
  id: number;
  colorName: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  sku: string;
  availableStock: number;
}

interface ProductSibling {
  id: number;
  name: string;
  slug: string;
  related_name: string;
  thumbnail: string;
}

interface ProductData {
  id: number;
  thumbnail: string;
  name: string;
  slug: string;
  variants: ProductVariant[];
  siblings: ProductSibling[];
  detail: {
    msrp: string;
    storage: string;
  };
}

interface ProductBuyBoxProps {
  productData: ProductData;
  onVariantSelect: (variantId: number) => void;
}

const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL || "";

export const ProductBuyBox: React.FC<ProductBuyBoxProps> = ({
  productData,
  onVariantSelect,
}) => {
  const { variants, detail, siblings, slug: currentSlug } = productData;
  const addItemToCart = useCartStore((state) => state.addItem);

  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccessfully, setAddedSuccessfully] = useState(false);

  const colorVariants: ColorVariant[] = useMemo(() => {
    return variants.map((v) => {
      const colorAttr = v.attributes.find((attr) => attr.code === "color");
      const variantBasePrice = v.price;
      const variantCurrentPrice =
        v.specialPrice !== null ? v.specialPrice : v.price;

      return {
        id: v.id,
        colorName: colorAttr ? colorAttr.value : "Không màu",
        thumbnail: v.thumbnail,
        price: variantCurrentPrice,
        originalPrice: variantBasePrice,
        sku: v.sku,
        availableStock: v.availableStock,
      };
    });
  }, [variants]);

  const initialSelectedVariant = useMemo(() => {
    const availableVariant = colorVariants.find((v) => v.availableStock > 0);
    return availableVariant?.id || colorVariants[0]?.id || 0;
  }, [colorVariants]);

  const [selectedVariant, setSelectedVariant] = useState<number>(
    initialSelectedVariant,
  );
  
  useEffect(() => {
    if (selectedVariant === 0 && initialSelectedVariant !== 0) {
      setSelectedVariant(initialSelectedVariant);
    }
  }, [initialSelectedVariant]);

  useEffect(() => {
    onVariantSelect(selectedVariant);
  }, [selectedVariant, onVariantSelect]);

  const currentVariant: ColorVariant | undefined = useMemo(() => {
    return (
      colorVariants.find((v) => v.id === selectedVariant) || colorVariants[0]
    );
  }, [selectedVariant, colorVariants]);
  
  const isOutOfStock = currentVariant
    ? currentVariant.availableStock === 0
    : true;

  const allSiblings: ProductSibling[] = useMemo(() => {
    const currentProductItem: ProductSibling = {
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      related_name: detail.storage || "Phiên bản này",
      thumbnail: productData.thumbnail,
    };

    const combinedSiblings = [currentProductItem, ...siblings];

    const uniqueSiblings = combinedSiblings
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.related_name === item.related_name),
      )
      .sort((a, b) => a.related_name.localeCompare(b.related_name));

    return uniqueSiblings;
  }, [
    siblings,
    detail.storage,
    productData.id,
    productData.name,
    productData.slug,
    productData.thumbnail,
  ]);

  const handleAddToCart = useCallback(
    async (shouldRedirect = false) => { // 🔑 THÊM ASYNC VÀO ĐÂY
      if (currentVariant && !isOutOfStock) {
        setIsAdding(true);

        // 🔑 KHÔNG SỬ DỤNG setTimeout, gọi thẳng await
        try {
          const variantPayload = {
            id: currentVariant.id,
            sku: currentVariant.sku,
            price: currentVariant.price,
            basePrice: currentVariant.originalPrice,
            color: currentVariant.colorName,
            thumbnail: currentVariant.thumbnail,
            // 🔑 SỬA LỖI CHÍNH TẢ: availebleStock -> availableStock
            availableStock: currentVariant.availableStock,
          };
          
          // 🔑 SỬ DỤNG AWAIT KHI GỌI HÀM ASYNC TỪ STORE
          await addItemToCart(variantPayload, productData.name, 1);

          if (shouldRedirect) {
            // 🔑 SỬA LỖI CÚ PHÁP TOAST MESSAGE
            toast.success(
              `✅ Đã thêm ${productData.name} - ${currentVariant.colorName} vào giỏ! Đang chuyển hướng...`,
            );
            // Đảm bảo không reset isAdding/isSuccessfully nếu chuyển hướng ngay lập tức
            window.location.assign("/gio-hang"); 
          } else {
            toast.success(
              `🛒 Đã thêm ${productData.name} - ${currentVariant.colorName} vào giỏ!`,
            );
            setAddedSuccessfully(true);
            setTimeout(() => {
              setAddedSuccessfully(false);
            }, 2000);
          }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            toast.error("❌ Lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
        } finally {
            // Đảm bảo dừng trạng thái loading sau khi hoàn tất (thành công hoặc thất bại)
            setIsAdding(false); 
        }

      } else if (isOutOfStock) {
        toast.error(
          `⚠️ ${currentVariant?.colorName || "Sản phẩm"} đã hết hàng!`,
        );
      }
    },
    [currentVariant, addItemToCart, productData.name, isOutOfStock],
  );

  const handleBuyNow = useCallback(() => {
    // Gọi handleAddToCart với shouldRedirect = true
    handleAddToCart(true); 
  }, [handleAddToCart]);

  if (!currentVariant) {
    return (
      <div className="p-4 text-red-500">
        Đang tải hoặc lỗi dữ liệu sản phẩm.
      </div>
    );
  }

  const cartButtonContent = useMemo(() => {
    if (isOutOfStock) {
      return (
        <>
          <span className="px-2 text-xs lg:text-base">Hết hàng</span>
        </>
      );
    }
    if (isAdding) {
      return (
        <>
          <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
          <span className="px-2 text-xs lg:text-base">Đang thêm...</span>
        </>
      );
    }
    if (addedSuccessfully) {
      return (
        <>
          <Check size={18} strokeWidth={2.5} />
          <span className="px-2 text-xs lg:text-base">Đã thêm!</span>
        </>
      );
    }
    return (
      <>
        <ShoppingCart size={18} strokeWidth={2.5} />
        <span className="px-2 text-xs lg:text-base">Thêm vào giỏ</span>
      </>
    );
  }, [isAdding, addedSuccessfully, isOutOfStock]); 

  return (
    <div className="product-buy-box p-0">
      <div className="gradient-border-custom mb-4 w-full rounded-lg px-6 py-4 shadow-sm lg:w-fit">
        <h3 className="text-sm font-normal text-gray-700">Giá sản phẩm</h3>
        <div className="flex items-baseline space-x-3">
          <span className="text-2xl font-bold text-red-600">
            {formatCurrency(currentVariant.price)}
          </span>
          <span className="text-base text-gray-400 line-through">
            {formatCurrency(currentVariant.originalPrice)}
          </span>
        </div>
      </div>
      {allSiblings.length > 1 && (
        <div className="mb-4">
          <h3 className="py-2 text-base font-semibold text-black lg:text-xl">
            Phiên bản
          </h3>
          <div className="flex flex-wrap gap-3">
            {allSiblings.map((item) => (
              <a
                key={item.slug}
                href={`/san-pham/${item.slug}`}
                className={`relative flex min-w-[120px] flex-col items-center justify-center rounded-lg px-4 py-2 text-left transition ${
                  item.slug === currentSlug
                    ? "border-2 border-red-600 bg-red-50 font-bold text-red-600 shadow-md"
                    : "border-[1.5px] border-gray-300 bg-white font-medium text-gray-700 hover:border-red-300"
                }`}
              >
                {item.slug === currentSlug && (
                  <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full border border-red-600 bg-red-600 p-px text-white" />
                )}
                <span className="text-sm font-semibold">
                  {item.related_name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="">
        <h3 className="py-2 text-base font-semibold text-black lg:text-xl">
          Màu sắc
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3">
          {colorVariants.map((variant: ColorVariant) => {
            const isVariantOutOfStock = variant.availableStock === 0;
            return (
              <button
                key={variant.id}
                onClick={() => {
                  if (!isVariantOutOfStock) {
                    setSelectedVariant(variant.id);
                  } else {
                    toast.error(`⚠️ Màu ${variant.colorName} đã hết hàng!`);
                  }
                }}
                disabled={isVariantOutOfStock}
                className={`flex h-20 items-center rounded-lg p-2 text-left transition ${
                  variant.id === selectedVariant
                    ? "relative border-2 border-red-600 shadow-md"
                    : "border-[1.5px] border-gray-400"
                } ${
                  isVariantOutOfStock
                    ? "cursor-not-allowed bg-gray-100 opacity-50"
                    : ""
                }`}
              >
                {variant.id === selectedVariant && (
                  <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full border border-red-600 bg-red-600 p-px text-white" />
                )}
                <div className="flex flex-row items-start gap-2">
                  <img
                    src={`${IMAGE_BASE_URL}${variant.thumbnail}`}
                    alt={variant.colorName}
                    className="mb-1 h-12 w-12 rounded object-contain"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-800 lg:text-base">
                      {variant.colorName}
                    </span>
                    {isVariantOutOfStock ? (
                      <span className="text-xs font-semibold text-red-500">
                        Hết hàng
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(variant.price)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="py-4">
        <ShopList />
      </div>
      <div className="mt-2 flex flex-row gap-2">
        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock || isAdding}
          className={`flex basis-[70%] flex-col items-center justify-center gap-1 rounded-lg py-2 font-bold text-white transition-all duration-300 ease-in-out lg:py-3 ${
            isOutOfStock || isAdding
              ? "cursor-not-allowed bg-gray-400 opacity-70"
              : "bg-[linear-gradient(0deg,#d70018,#e45464)] hover:shadow-lg hover:shadow-red-400/40 active:scale-95"
          }`}
        >
          <span className="text-sm font-bold">MUA NGAY</span>
          <span className="text-[10px] text-white/90 lg:text-xs">
            Giao nhanh từ 2 giờ hoặc nhận tại cửa hàng !!
          </span>
        </button>
        {/* NÚT THÊM VÀO GIỎ */}
        <button
          onClick={() => handleAddToCart(false)}
          disabled={isAdding || addedSuccessfully || isOutOfStock}
          className={`flex basis-[30%] flex-col items-center justify-center gap-2 rounded-lg border py-2 font-bold transition-all duration-300 ease-in-out active:scale-95 lg:flex-row lg:py-3 ${isAdding || addedSuccessfully || isOutOfStock ? "cursor-not-allowed opacity-70" : "hover:bg-red-50"} ${
            addedSuccessfully
              ? "border-green-500 bg-green-500 text-white hover:bg-green-500"
              : isOutOfStock
                ? "border-gray-400 bg-white text-gray-400"
                : "border-red-500 bg-white text-red-500"
          }`}
        >
          {cartButtonContent}
        </button>
      </div>
      <ProductFixedBuyBar
        currentVariant={currentVariant}
        productData={productData}
        isOutOfStock={isOutOfStock}
        isAdding={isAdding}
        addedSuccessfully={addedSuccessfully}
        handleAddToCart={() => handleAddToCart(false)}
      />
    </div>
  );
};

export default ProductBuyBox;