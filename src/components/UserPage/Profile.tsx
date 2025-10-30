import React, { useEffect } from "react";
import { useCustomerProfileStore } from "../../stores/useCustomerProfileStore";

const ProfileItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0">
    <span className="font-medium text-gray-500">{label}:</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

const CustomerProfile: React.FC = () => {
  const { user, fetchProfile } = useCustomerProfileStore();
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div>
      <h1 className="mb-6 border-b border-indigo-100 pb-2 text-base font-extrabold text-gray-800 lg:text-2xl">
        Thông tin khách hàng
      </h1>

      {user && (
        <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition duration-300">
          <ProfileItem
            label="Tên khách hàng"
            value={user.name || "Chưa cập nhật"}
          />
          <ProfileItem label="Email" value={user.email || "Chưa cập nhật"} />
          <ProfileItem
            label="Số điện thoại"
            value={user.phone || "Chưa cập nhật"}
          />
          <ProfileItem label="Role" value={user.roles || "Chưa cập nhật"} />
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
