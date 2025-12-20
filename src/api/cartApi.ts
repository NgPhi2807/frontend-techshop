
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

interface CartItemFromServer {
 variantId: number;
 sku: string;
 name: string;
 price: number;
 basePrice: number;
 color: string;
 thumbnail: string;
 quantity: number;
 isSelected: boolean;
 availableStock: number; // <-- TRƯỜNG MỚI: Số lượng tồn kho
}


export const updateServerCartQuantity = async (
 variantId: number,
 quantity: number, // Quantity là 0 để xóa sản phẩm
 token: string
): Promise<boolean> => {
 try {
  const res = await fetch(`${BASE_URL}/api/cart/add`, {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
   },
   body: JSON.stringify({ variantId, quantity }),
  });

  if (!res.ok) {
   const errorBody = await res.text();
   console.error(`❌ Cart update error: ${res.status}`, errorBody);
   return false; 
  }
  return true; 
 } catch (error) {
  console.error("❌ Network or fetch error in updateServerCartQuantity:", error);
  return false;
 }
};


export const fetchMyCart = async (
 token: string
): Promise<CartItemFromServer[] | null> => {
 try {
  const res = await fetch(`${BASE_URL}/api/cart/my-cart`, {
   headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
   console.error(`Fetch cart failed: ${res.status}`);
   return null;
  }
  const json = await res.json();
  
  const serverItems: CartItemFromServer[] = json.data.map((entry: any) => ({
   variantId: entry.item.id,
   sku: entry.item.sku,
   name: entry.item.name || "",
   price: entry.item.specialPrice ?? entry.item.price,
   basePrice: entry.item.price,
   color:
    entry.item.attributes?.find(
     (a: any) => a.code === "color"
    )?.value || "Không xác định",
   thumbnail: entry.item.thumbnail,
   quantity: entry.quantity,
   isSelected: true,
   availableStock: entry.item.availableStock //
  }));

  return serverItems;
 } catch (err) {
  console.error("❌ Lỗi lấy giỏ hàng server:", err);
  return null;
 }
};