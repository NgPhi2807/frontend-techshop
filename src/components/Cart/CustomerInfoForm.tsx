import React from "react";
interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo>>;
}
const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  setCustomerInfo,
}) => {
  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-lg font-bold text-gray-800">Người đặt hàng</h3>
      <input
        type="text"
        placeholder="Họ và tên *"
        className="w-full rounded border border-gray-300 p-3 text-sm"
        value={customerInfo.fullName}
        onChange={(e) =>
          setCustomerInfo({ ...customerInfo, fullName: e.target.value })
        }
      />

      <input
        type="tel"
        placeholder="Số điện thoại *"
        className="w-full rounded border border-gray-300 p-3 text-sm"
        value={customerInfo.phone}
        onChange={(e) =>
          setCustomerInfo({ ...customerInfo, phone: e.target.value })
        }
      />

      <input
        type="email"
        placeholder="Email (Không bắt buộc)"
        className="w-full rounded border border-gray-300 p-3 text-sm"
        value={customerInfo.email}
        onChange={(e) =>
          setCustomerInfo({ ...customerInfo, email: e.target.value })
        }
      />
    </div>
  );
};
export default CustomerInfoForm;
