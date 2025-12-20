import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { updateServerCartQuantity, fetchMyCart } from "../api/cartApi";


interface PaymentInfo {
    type: string;
    label: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    bankName?: string;
    transferContent?: string;
    qrCodeUrl?: string;
    expireAt?: string;
    lifeTime?: string;
}

export interface OrderResponseData {
    orderId: number;
    grossAmount: number;    // Tổng tiền hàng
    directDiscount: number;  // Chiết khấu trực tiếp
    voucherDiscount: number; // Chiết khấu voucher
    totalAmount: number;     // Tổng tiền cuối cùng cần thanh toán
    message: string;
    paymentInfo: PaymentInfo & {
        _calculatedExpireTime?: number;
        type: string,
        label: string
    };
}


export interface ApiResponse<T> {
    code: number;
    timestamp: string;
    data: T;
}



const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
        const [hours, minutes, seconds] = parts;
        return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
};



export interface CartItem {
    variantId: number;
    sku: string;
    name: string; // ✅ Đã có trường name để lưu tên sản phẩm
    price: number;
    basePrice: number;
    color: string;
    thumbnail: string;
    quantity: number;
    isSelected: boolean;
    availableStock: number;
}

interface AddVariant {
    id: number; sku: string; price: number; basePrice: number;
    color: string; thumbnail: string; availableStock: number;
}



interface CartState {
    items: CartItem[];
    checkoutItems: Omit<CartItem, "isSelected">[];
    isCheckingOut: boolean;
    lastPlacedOrderId: number | null;
    lastOrderData: OrderResponseData | null;
    fetchServerCart: () => Promise<void>;
    addItem: (
        variant: AddVariant,
        productName: string, // ✅ Nhận productName từ component
        quantity?: number
    ) => Promise<void>;
    updateItemQuantity: (variantId: number, quantity: number) => Promise<void>;
    removeItem: (variantId: number) => void;
    toggleItemSelection: (variantId: number, isSelected: boolean) => void;
    toggleAllItemsSelection: (isSelected: boolean) => void;
    removeSelectedItems: () => void;
    setCheckoutItems: (selectedItems: Omit<CartItem, "isSelected">[]) => void;
    toggleCheckoutMode: (isCheckingOut: boolean) => void;
    finalizeOrder: (orderId: number, orderData: OrderResponseData) => void;
    clearCheckoutItems: () => void;
    clearOrderData: () => void;
}


export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            checkoutItems: [],
            isCheckingOut: false,
            lastPlacedOrderId: null,
            lastOrderData: null,

            fetchServerCart: async () => {
                const token = localStorage.getItem("accessToken");
                if (!token) return;
                const serverItems = await fetchMyCart(token);
                if (serverItems) {
                    // Cần đảm bảo server trả về trường 'name' để không mất dữ liệu
                    set({ items: serverItems as CartItem[] }); 
                    console.log("✅ Giỏ hàng đã đồng bộ từ server:", serverItems);
                } else {
                    console.error("❌ Lỗi lấy giỏ hàng server: Không nhận được dữ liệu.");
                }
            },

            addItem: async (variant, productName, quantity = 1) => {
                const token = localStorage.getItem("accessToken");
                const { items } = get();
                let quantityToUpdate = quantity;
                let existingIndex = items.findIndex((i) => i.variantId === variant.id);
                if (existingIndex > -1) {
                    const existingItem = items[existingIndex];
                    const newTotalQuantity = existingItem.quantity + quantity;

                    if (newTotalQuantity > existingItem.availableStock) {
                        quantityToUpdate = existingItem.availableStock - existingItem.quantity;

                        if (quantityToUpdate <= 0) {
                            console.warn(`Không thể thêm. Sản phẩm đã đạt hoặc vượt quá tồn kho (${existingItem.availableStock}).`);
                            return;
                        }
                        console.warn(`⚠️ Số lượng tối đa đã đạt (${existingItem.availableStock}). Chỉ thêm ${quantityToUpdate} sản phẩm.`);
                    }

                    set((state) => ({
                        items: state.items.map((i) =>
                            i.variantId === variant.id ? { ...i, quantity: i.quantity + quantityToUpdate, name: productName } : i // Thêm cập nhật tên nếu cần
                        ),
                    }));
                } else {
                    if (quantity > variant.availableStock) {
                        console.warn(`Không thể thêm. Số lượng yêu cầu vượt quá tồn kho (${variant.availableStock}).`);
                        return;
                    }

                    const newItem: CartItem = {
                        variantId: variant.id, sku: variant.sku, name: productName, price: variant.price, // ✅ name được lưu ở đây
                        basePrice: variant.basePrice, color: variant.color, thumbnail: variant.thumbnail,
                        quantity, isSelected: true,
                        availableStock: variant.availableStock,
                    };
                    set({ items: [...items, newItem] });
                }

                if (token) {
                    const success = await updateServerCartQuantity(variant.id, quantityToUpdate, token);
                    if (!success) {
                        console.warn("⚠️ Thêm sản phẩm thất bại. Khôi phục trạng thái cũ.");
                        await get().fetchServerCart();
                    }
                }
            },

            updateItemQuantity: async (variantId, quantity) => {
                const token = localStorage.getItem("accessToken");

                let finalQuantity = quantity;
                if (quantity > 0) {
                    const item = get().items.find(i => i.variantId === variantId);

                    if (item && quantity > item.availableStock) {
                        console.warn(`Số lượng mới vượt quá tồn kho (${item.availableStock}). Đặt lại thành ${item.availableStock}.`);
                        finalQuantity = item.availableStock;
                    } else {
                        finalQuantity = quantity;
                    }

                    set((state) => ({
                        items: state.items.map((i) =>
                            i.variantId === variantId ? { ...i, quantity: finalQuantity } : i
                        ),
                    }));
                } else {
                    set((state) => ({
                        items: state.items.filter((i) => i.variantId !== variantId),
                    }));
                    finalQuantity = 0;
                }

                if (token) {
                    const success = await updateServerCartQuantity(variantId, finalQuantity, token);
                    if (!success) {
                        console.warn("⚠️ Cập nhật thất bại. Đang khôi phục giỏ hàng từ server.");
                        await get().fetchServerCart();
                        console.error("Lỗi cập nhật sản phẩm. Đã tải lại giỏ hàng.");
                    }
                }
            },

            removeItem: (variantId) => {
                get().updateItemQuantity(variantId, 0);
            },

            toggleItemSelection: (variantId, isSelected) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.variantId === variantId ? { ...i, isSelected } : i
                    ),
                })),

            toggleAllItemsSelection: (isSelected) =>
                set((state) => ({
                    items: state.items.map((i) => ({ ...i, isSelected })),
                })),

            removeSelectedItems: () =>
                set((state) => ({
                    items: state.items.filter((i) => !i.isSelected),
                })),

            setCheckoutItems: (selectedItems) => set({ checkoutItems: selectedItems }),
            toggleCheckoutMode: (isCheckingOut) => set({ isCheckingOut }),

            finalizeOrder: (orderId, orderData) =>
                set((state) => {
                    const ids = new Set(state.checkoutItems.map((i) => i.variantId));
                    let updatedOrderData = orderData;

                    if (orderData.paymentInfo.lifeTime && !("_calculatedExpireTime" in orderData.paymentInfo)) {
                        const lifeTimeSeconds = timeToSeconds(orderData.paymentInfo.lifeTime);
                        const expireTimeMs = new Date().getTime() + lifeTimeSeconds * 1000;

                        updatedOrderData = {
                            ...orderData,
                            paymentInfo: {
                                ...orderData.paymentInfo,
                                _calculatedExpireTime: expireTimeMs,
                            },
                        };
                        console.log("💾 Đã tính toán và lưu mốc hết hạn cho F5:", new Date(expireTimeMs));
                    }

                    return {
                        items: state.items.filter((i) => !ids.has(i.variantId)),
                        checkoutItems: [],
                        isCheckingOut: false,
                        lastPlacedOrderId: orderId,
                        lastOrderData: updatedOrderData,
                    };
                }),

            clearCheckoutItems: () => set({ checkoutItems: [], lastOrderData: null, lastPlacedOrderId: null }),
            clearOrderData: () => set({ lastOrderData: null, lastPlacedOrderId: null }),
        }),
        {
            name: "cart-local-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                items: state.items,
                checkoutItems: state.checkoutItems,
                isCheckingOut: state.isCheckingOut,
                lastPlacedOrderId: state.lastPlacedOrderId,
                lastOrderData: state.lastOrderData,
            }),
        }
    )
);