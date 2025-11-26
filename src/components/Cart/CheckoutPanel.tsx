import React, { useState, useEffect } from "react";
import { useCartStore } from "../../stores/cartStore";
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

interface AddressUnit {
  code: number;
  name: string;
  division_type: string;
  codename: string;
}
interface Province extends AddressUnit {
  phone_code: number;
  districts?: District[];
}
interface District extends AddressUnit {
  province_code: number;
  wards?: Ward[];
}
interface Ward extends AddressUnit {
  district_code: number;
}
interface Totals {
  tongTien: number;
  tongKhuyenMai: number;
  giamGiaSanPham: number;
  voucher: number;
  canThanhToan: number;
}
interface CheckoutPanelProps {
  totals: Totals;
  handleGoBack: () => void;
}
interface CheckoutItem {
  variantId: number;
  sku: string;
  name: string;
  price: number;
  basePrice: number;
  color: string;
  thumbnail: string;
  quantity: number;
}

export const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  totals,
  handleGoBack,
}) => {
  const finalizeOrder = useCartStore((state) => state.finalizeOrder);
  const toggleCheckoutMode = useCartStore((state) => state.toggleCheckoutMode);
  const checkoutItems = useCartStore(
    (state) => state.checkoutItems,
  ) as CheckoutItem[];

  const [deliveryMethod, setDeliveryMethod] = useState<"ship" | "pickup">(
    "ship",
  );
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK">("COD");
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "nhp",
    phone: "0832676515",
    email: "example@gmail.com",
  });
  const [shipAddress, setShipAddress] = useState<{
    line: string;
    ward: number | string;
    district: number | string;
    province: number | string;
  }>({ line: "", ward: "", district: "", province: "" });

  const [isAddressPanelOpen, setIsAddressPanelOpen] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    if (deliveryMethod === "pickup" && stores.length === 0 && !isLoadingStores) {
      const loadStores = async () => {
        setIsLoadingStores(true);
        try {
          const storeList = await fetchStoresApi();
          setStores(storeList);
          if (storeList.length > 0) {
            setSelectedStoreId(storeList[0].id);
          } else {
            setError("Không tìm thấy cửa hàng nào gần bạn.");
          }
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setIsLoadingStores(false);
        }
      };
      loadStores();
    }
  }, [deliveryMethod]); 


  const handleAddressSave = (address: {
    province: number;
    district: number;
    ward: number;
    line: string;
  }) => {
    setShipAddress(address);
    setIsAddressPanelOpen(false);
  };

  const mapCartToOrderItems = (): OrderItemPayload[] => {
    return checkoutItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));
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
      orderItems: mapCartToOrderItems(),
      fullName: customerInfo.fullName,
      phone: customerInfo.phone,
      email: customerInfo.email,
      paymentMethod: paymentMethod,
    };

    let finalPayload: ShipOrderPayload | PickupOrderPayload;
    let isShip = deliveryMethod === "ship";

    if (isShip) {
      const selectedProvince = provinces.find(
        (p) => p.code === shipAddress.province,
      )?.name;
      const selectedDistrict = districts.find(
        (d) => d.code === shipAddress.district,
      )?.name;
      const selectedWard = wards.find((w) => w.code === shipAddress.ward)?.name;

      if (
        !selectedProvince ||
        !selectedDistrict ||
        !selectedWard ||
        !shipAddress.line
      ) {
        setError("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
        setIsPlacingOrder(false);
        return;
      }

      finalPayload = {
        ...basePayload,
        line: shipAddress.line,
        province: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,
      } as ShipOrderPayload;
    } else {
      if (selectedStoreId === null) {
        setError("Vui lòng chọn cửa hàng để nhận.");
        setIsPlacingOrder(false);
        return;
      }
      finalPayload = {
        ...basePayload,
        storeId: selectedStoreId,
      } as PickupOrderPayload;
    }

    try {
      const orderData = await placeOrderApi(finalPayload, isShip);
      if (orderData.paymentInfo) {
        finalizeOrder(orderData.orderId, orderData);
        toggleCheckoutMode(false);
        window.location.href = `/don-hang/thanh-toan/${orderData.orderId}`;
      } else {
        setError("Lỗi phản hồi API: Thiếu thông tin thanh toán.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const ShipAddressDisplay = () => {
    const pName =
      provinces.find((p) => p.code === shipAddress.province)?.name || "";
    const dName =
      districts.find((d) => d.code === shipAddress.district)?.name || "";
    const wName = wards.find((w) => w.code === shipAddress.ward)?.name || "";
    const isValidAddress = !!(
      shipAddress.province &&
      shipAddress.district &&
      shipAddress.ward &&
      shipAddress.line
    );
    return (
      <div
        onClick={() => setIsAddressPanelOpen(true)}
        className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-4 transition duration-150 hover:border-red-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 overflow-hidden">
            <p
              className={`text-sm font-semibold ${isValidAddress ? "text-gray-800" : "text-red-500"}`}
            >
              {isValidAddress
                ? shipAddress.line
                : "Địa chỉ chi tiết: Số nhà, Tên đường *"}
            </p>
            <p
              className={`truncate text-xs ${isValidAddress ? "text-gray-600" : "text-gray-500"}`}
            >
              {isValidAddress
                ? `${wName}, ${dName}, ${pName}`
                : "Chưa chọn khu vực"}
            </p>
          </div>
          <span className="ml-4 flex-shrink-0 text-sm font-medium text-red-600 hover:underline">
            Thay đổi
          </span>
        </div>
      </div>
    );
  };

  const PickupAddressForm = () => {
    const currentStore = stores.find((s) => s.id === selectedStoreId);
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">
          Chọn cửa hàng nhận:
        </p>

        <select
          className="w-full rounded border border-gray-300 p-3 text-sm"
          value={selectedStoreId || ""}
          onChange={(e) => setSelectedStoreId(Number(e.target.value))}
          disabled={isLoadingStores || stores.length === 0}
        >
          {isLoadingStores ? (
            <option value="" disabled>
              Đang tải danh sách cửa hàng...
            </option>
          ) : stores.length === 0 ? (
            <option value="" disabled>
              Không tìm thấy cửa hàng nào
            </option>
          ) : (
            stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} - {store.displayAddress} (Mở cửa:
                {store.timeOpen.substring(0, 5)} -
                {store.timeClose.substring(0, 5)})
              </option>
            ))
          )}
        </select>

        {currentStore && (
          <div className="rounded border border-gray-300 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-800">
              Thông tin cửa hàng đã chọn:
            </p>
            <p className="text-base font-semibold text-red-600">
              {currentStore.name}
            </p>
            <p className="text-xs text-gray-600">
              Địa chỉ: {currentStore.displayAddress}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isAddressPanelOpen && (
        <AddressFilterPanel
          onClose={() => setIsAddressPanelOpen(false)}
          onSave={handleAddressSave}
          currentAddress={
            shipAddress as {
              province: number;
              district: number;
              ward: number;
              line: string;
            }
          }
          provinces={provinces}
          districts={districts}
          wards={wards}
          setProvinces={setProvinces}
          setDistricts={setDistricts}
          setWards={setWards}
          isLoadingAddress={isLoadingAddress}
          setIsLoadingAddress={setIsLoadingAddress}
        />
      )}

      <div className="">
        <button
          onClick={handleGoBack}
          className="mb-4 flex items-center text-sm font-semibold text-blue-600 hover:underline"
        >
          Quay lại giỏ hàng
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-1 space-y-6 md:col-span-2">
            <OrderItemsSummary checkoutItems={checkoutItems} />
            <CustomerInfoForm
              customerInfo={customerInfo}
              setCustomerInfo={setCustomerInfo}
            />
            <div className="space-y-4 rounded-lg bg-white p-4 shadow-md">
              <h3 className="text-lg font-bold text-gray-800">
                Hình thức nhận hàng
              </h3>
              <div className="flex gap-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "ship"}
                    onChange={() => setDeliveryMethod("ship")}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  Giao hàng tận nơi
                </label>

                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  Nhận tại cửa hàng
                </label>
              </div>
              {deliveryMethod === "ship" ? (
                <ShipAddressDisplay />
              ) : (
                <PickupAddressForm />
              )}
            </div>
            <PaymentMethodSelection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
            {error && (
              <div className="rounded-lg bg-red-100 p-3 text-sm font-medium text-red-700 shadow-md">
                ⚠️ Lỗi: {error}
              </div>
            )}
          </div>
          <div className="col-span-1 space-y-4">
            <OrderSummaryCard
              totals={totals}
              handlePlaceOrder={handlePlaceOrder}
              isPlacingOrder={isPlacingOrder}
            />
          </div>
        </div>
      </div>
    </>
  );
};