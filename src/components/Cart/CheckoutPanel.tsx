import React, { useState, useEffect } from "react";
import { useCartStore } from "../../stores/cartStore";
import { useCustomerProfileStore } from "../../stores/useCustomerProfileStore"; // Import store
import AddressFilterPanel from "./AddressFilterPanel";
import PaymentMethodSelection from "./PaymentMethodSelection";
import OrderItemsSummary from "./OrderItemsSummary";
import CustomerInfoForm from "./CustomerInfoForm";
import OrderSummaryCard from "./OrderSummaryCard";
import {
  placeOrderApi,
  fetchStoresApi,
  type ShipOrderPayload,
  type PickupOrderPayload,
  type OrderItemPayload,
  type Store,
} from "../../api/orderApi";

// --- Interfaces ---
interface AddressUnit { code: number; name: string; division_type: string; codename: string; }
interface Province extends AddressUnit { phone_code: number; districts?: District[]; }
interface District extends AddressUnit { province_code: number; wards?: Ward[]; }
interface Ward extends AddressUnit { district_code: number; }
interface Totals { tongTien: number; tongKhuyenMai: number; giamGiaSanPham: number; voucher: number; canThanhToan: number; }
interface CheckoutPanelProps { totals: Totals; handleGoBack: () => void; }
interface CheckoutItem { variantId: number; sku: string; name: string; price: number; basePrice: number; color: string; thumbnail: string; quantity: number; }

export const CheckoutPanel: React.FC<CheckoutPanelProps> = ({ totals, handleGoBack }) => {
  const finalizeOrder = useCartStore((state) => state.finalizeOrder);
  const toggleCheckoutMode = useCartStore((state) => state.toggleCheckoutMode);
  const checkoutItems = useCartStore((state) => state.checkoutItems) as CheckoutItem[];

  // --- Profile Store ---
  const { user, fetchProfile } = useCustomerProfileStore();

  // --- Local State ---
  const [deliveryMethod, setDeliveryMethod] = useState<"ship" | "pickup">("ship");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK">("COD");

  const [customerInfo, setCustomerInfo] = useState({ fullName: "", phone: "", email: "" });
  const [shipAddress, setShipAddress] = useState<{
    line: string; ward: number | string; district: number | string; province: number | string;
  }>({ line: "", ward: "", district: "", province: "" });

  const [isAddressPanelOpen, setIsAddressPanelOpen] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false); // Modal chọn địa chỉ cũ

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // --- Effects ---

  // 1. Fetch Profile khi mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Tự động điền dữ liệu nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        fullName: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      });

      const defaultAddr = user.addresses?.find((a) => a.isDefault);
      if (defaultAddr) {
        setShipAddress({
          line: defaultAddr.line,
          ward: defaultAddr.ward,
          district: defaultAddr.district,
          province: defaultAddr.province,
        });
      }
    }
  }, [user]);

  // Load stores cho Pickup
  useEffect(() => {
    if (deliveryMethod === "pickup" && stores.length === 0 && !isLoadingStores) {
      const loadStores = async () => {
        setIsLoadingStores(true);
        try {
          const storeList = await fetchStoresApi();
          setStores(storeList);
          if (storeList.length > 0) setSelectedStoreId(storeList[0].id);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setIsLoadingStores(false);
        }
      };
      loadStores();
    }
  }, [deliveryMethod]);

  // --- Handlers ---

  const handleAddressSave = (address: { province: number; district: number; ward: number; line: string; }) => {
    setShipAddress(address);
    setIsAddressPanelOpen(false);
  };

  const handleSelectOldAddress = (addr: any) => {
    setShipAddress({
      line: addr.line,
      ward: addr.ward,
      district: addr.district,
      province: addr.province,
    });
    setShowAddressList(false);
  };

  const handleAddNewAddress = () => {
    setShipAddress({ line: "", ward: "", district: "", province: "" });
    setShowAddressList(false);
    setIsAddressPanelOpen(true);
  };

  const handlePlaceOrder = async () => {
    setError(null);
    setIsPlacingOrder(true);

    if (!customerInfo.fullName || !customerInfo.phone) {
      setError("Vui lòng nhập Họ và tên, Số điện thoại.");
      setIsPlacingOrder(false);
      return;
    }

    const basePayload = {
      orderItems: checkoutItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      fullName: customerInfo.fullName,
      phone: customerInfo.phone,
      email: customerInfo.email,
      paymentMethod: paymentMethod,
    };

    let finalPayload: ShipOrderPayload | PickupOrderPayload;
    const isShip = deliveryMethod === "ship";

    if (isShip) {
      const pName = provinces.find((p) => p.code === shipAddress.province)?.name || shipAddress.province;
      const dName = districts.find((d) => d.code === shipAddress.district)?.name || shipAddress.district;
      const wName = wards.find((w) => w.code === shipAddress.ward)?.name || shipAddress.ward;

      if (!pName || !shipAddress.line) {
        setError("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
        setIsPlacingOrder(false);
        return;
      }

      finalPayload = {
        ...basePayload,
        line: shipAddress.line,
        province: String(pName),
        district: String(dName),
        ward: String(wName),
      } as ShipOrderPayload;
    } else {
      if (selectedStoreId === null) {
        setError("Vui lòng chọn cửa hàng để nhận.");
        setIsPlacingOrder(false);
        return;
      }
      finalPayload = { ...basePayload, storeId: selectedStoreId } as PickupOrderPayload;
    }

    try {
      const orderData = await placeOrderApi(finalPayload, isShip);
      if (orderData.paymentInfo) {
        finalizeOrder(orderData.orderId, orderData);
        toggleCheckoutMode(false);
        window.location.href = `/don-hang/thanh-toan/${orderData.orderId}`;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // --- Sub-Components ---

  const ShipAddressDisplay = () => {
    const pName = provinces.find((p) => p.code === shipAddress.province)?.name || shipAddress.province;
    const dName = districts.find((d) => d.code === shipAddress.district)?.name || shipAddress.district;
    const wName = wards.find((w) => w.code === shipAddress.ward)?.name || shipAddress.ward;

    const isValidAddress = !!(shipAddress.province && shipAddress.line);

    return (
      <div
        onClick={() => user?.addresses?.length ? setShowAddressList(true) : setIsAddressPanelOpen(true)}
        className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-4 transition duration-150 hover:border-red-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 overflow-hidden">
            <p className={`text-sm font-semibold ${isValidAddress ? "text-gray-800" : "text-red-500"}`}>
              {isValidAddress ? shipAddress.line : "Địa chỉ chi tiết: Số nhà, Tên đường *"}
            </p>
            <p className={`truncate text-xs ${isValidAddress ? "text-gray-600" : "text-gray-500"}`}>
              {isValidAddress ? `${wName}, ${dName}, ${pName}` : "Chưa chọn khu vực"}
            </p>
          </div>
          <span className="ml-4 flex-shrink-0 text-sm font-medium text-red-600 hover:underline">
            Thay đổi
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Modal danh sách địa chỉ cũ */}
      {showAddressList && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold">Chọn địa chỉ giao hàng</h3>
            <div className="max-h-60 space-y-3 overflow-y-auto pr-2">
              {user?.addresses?.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => handleSelectOldAddress(addr)}
                  className="cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-red-50"
                >
                  <p className="text-sm font-bold">{addr.line}</p>
                  <p className="text-xs text-gray-500">{`${addr.ward}, ${addr.district}, ${addr.province}`}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddNewAddress}
              className="mt-4 w-full rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              + Thêm địa chỉ mới
            </button>
            <button
              onClick={() => setShowAddressList(false)}
              className="mt-2 w-full py-2 text-sm font-medium text-blue-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {isAddressPanelOpen && (
        <AddressFilterPanel
          onClose={() => setIsAddressPanelOpen(false)}
          onSave={handleAddressSave}
          currentAddress={shipAddress as any}
          provinces={provinces} districts={districts} wards={wards}
          setProvinces={setProvinces} setDistricts={setDistricts} setWards={setWards}
          isLoadingAddress={isLoadingAddress} setIsLoadingAddress={setIsLoadingAddress}
        />
      )}

      <div className="">
        <button onClick={handleGoBack} className="mb-4 flex items-center text-sm font-semibold text-blue-600 hover:underline">
          Quay lại giỏ hàng
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-1 space-y-6 md:col-span-2">
            <OrderItemsSummary checkoutItems={checkoutItems} />
            <CustomerInfoForm customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} />

            <div className="space-y-4 rounded-lg bg-white p-4 shadow-md">
              <h3 className="text-lg font-bold text-gray-800">Hình thức nhận hàng</h3>
              <div className="flex gap-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input type="radio" name="delivery" checked={deliveryMethod === "ship"} onChange={() => setDeliveryMethod("ship")} className="mr-2 text-red-600" />
                  Giao hàng tận nơi
                </label>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input type="radio" name="delivery" checked={deliveryMethod === "pickup"} onChange={() => setDeliveryMethod("pickup")} className="mr-2 text-red-600" />
                  Nhận tại cửa hàng
                </label>
              </div>
              {deliveryMethod === "ship" ? <ShipAddressDisplay /> : (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">Chọn cửa hàng nhận:</p>
                  <select
                    className="w-full rounded border border-gray-300 p-3 text-sm"
                    value={selectedStoreId || ""}
                    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                  >
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name} - {s.displayAddress}</option>)}
                  </select>
                </div>
              )}
            </div>

            <PaymentMethodSelection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            {error && <div className="rounded-lg bg-red-100 p-3 text-sm font-medium text-red-700">⚠️ Lỗi: {error}</div>}
          </div>

          <div className="col-span-1 space-y-4">
            <OrderSummaryCard totals={totals} handlePlaceOrder={handlePlaceOrder} isPlacingOrder={isPlacingOrder} />
          </div>
        </div>
      </div>
    </>
  );
};