import React, { useEffect } from "react";
import { useCustomerProfileStore } from "../../stores/useCustomerProfileStore";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";

const ProfileItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
    <span className="font-medium text-gray-500">{label}:</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

const CustomerProfile: React.FC = () => {
  const { user, fetchProfile } = useCustomerProfileStore();
  const { isEditing, setIsEditing, formData, loading, handleChange, handleSubmit } = useUpdateProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-indigo-100 pb-2">
        <h1 className="text-xl font-extrabold text-gray-800 lg:text-2xl">Thông tin khách hàng</h1>
        <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-bold text-red-600 underline">
          {isEditing ? "Hủy" : "Thay đổi"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400">Họ và tên</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded focus:ring-1  outline-none" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full mt-1 p-2 border rounded outline-none">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Ngày sinh</label>
                <input type="date" name="birth" value={formData.birth} onChange={handleChange} className="w-full mt-1 p-2 border rounded outline-none" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-fit px-4 bg-red-600 py-2.5 text-white font-bold rounded hover:bg-red-700 disabled:bg-gray-300">
              {loading ? "Đang xử lý..." : "Cập nhật hồ sơ"}
            </button>
          </form>
        ) : (
          <div>
            <ProfileItem label="Tên khách hàng" value={user.name || "N/A"} />
            <ProfileItem label="Email" value={user.email} />
            <ProfileItem label="Số điện thoại" value={user.phone || "N/A"} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;