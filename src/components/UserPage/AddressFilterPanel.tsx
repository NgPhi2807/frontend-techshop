import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "../../stores/authStore1";
import {
  fetchProvincesApi,
  fetchDistrictsApi,
  fetchWardsApi,
} from "../../api/geographyApi";
import type { Division } from "../../api/geographyApi";
import { postAddressApi, type AddressPayload } from "../../api/addressApi";

interface AddressFormProps {
  onSubmissionSuccess: () => void;
}

interface AddressFormState {
  provinceCode: number | null;
  districtCode: number | null;
  wardCode: number | null;
  line: string;
  isDefault: boolean;
}

interface SelectProps {
  label: string;
  name: keyof AddressFormState;
  value: number | null;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Division[];
  placeholder: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative mt-1">
      <select
        id={name as string}
        name={name as string}
        value={value === null ? "" : value}
        onChange={onChange}
        required
        disabled={disabled}
        className={`block w-full appearance-none border px-3 py-2 ${
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "border-gray-300 bg-white"
        } rounded-md shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  </div>
);

const AddressForm: React.FC<AddressFormProps> = ({ onSubmissionSuccess }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [formData, setFormData] = useState<AddressFormState>({
    provinceCode: null,
    districtCode: null,
    wardCode: null,
    line: "",
    isDefault: false,
  });

  const [provinces, setProvinces] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<Division[]>([]);
  const [wards, setWards] = useState<Division[]>([]);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });

  useEffect(() => {
    checkAuthStatus();
    setIsAuthChecked(true);
  }, [checkAuthStatus]);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await fetchProvincesApi();
        setProvinces(data);
      } catch (error) {
        console.error("Lỗi tải Tỉnh/Thành phố:", error);
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    setDistricts([]);
    setWards([]);
    if (formData.provinceCode === null) return;

    const loadDistricts = async () => {
      try {
        const data = await fetchDistrictsApi(formData.provinceCode as number);
        setDistricts(data);
      } catch (error) {
        console.error("Lỗi tải Quận/Huyện:", error);
      }
    };

    loadDistricts();
    setFormData((prev) => ({ ...prev, districtCode: null, wardCode: null }));
  }, [formData.provinceCode]);

  useEffect(() => {
    setWards([]);
    if (formData.districtCode === null) return;

    const loadWards = async () => {
      try {
        const data = await fetchWardsApi(formData.districtCode as number);
        setWards(data);
      } catch (error) {
        console.error("Lỗi tải Phường/Xã:", error);
      }
    };

    loadWards();
    setFormData((prev) => ({ ...prev, wardCode: null }));
  }, [formData.districtCode]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (type === "text") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (e.target.tagName === "SELECT") {
      const numericValue = parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numericValue) ? null : numericValue,
      }));
    }
  };

  const handlePostAddress = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: "", message: "" });

    const requiredFields = [
      { value: formData.provinceCode, name: "Tỉnh/Thành phố" },
      { value: formData.districtCode, name: "Quận/Huyện" },
      { value: formData.wardCode, name: "Phường/Xã" },
      { value: formData.line.trim(), name: "Địa chỉ cụ thể" },
    ];

    const missingField = requiredFields.find((field) => !field.value);

    if (missingField) {
      setLoading(false);
      setStatusMessage({
        type: "error",
        message: `❌ Vui lòng chọn hoặc điền đầy đủ: ${missingField.name}.`,
      });
      return;
    }

    if (!accessToken) {
      setLoading(false);
      setStatusMessage({
        type: "error",
        message:
          "❌ Lỗi xác thực: Người dùng chưa đăng nhập hoặc token không hợp lệ.",
      });
      return;
    }

    const selectedProvince =
      provinces.find((p) => p.code === formData.provinceCode)?.name || "";
    const selectedDistrict =
      districts.find((d) => d.code === formData.districtCode)?.name || "";
    const selectedWard =
      wards.find((w) => w.code === formData.wardCode)?.name || "";

    const payload: AddressPayload = {
      line: formData.line,
      ward: selectedWard,
      district: selectedDistrict,
      province: selectedProvince,
      isDefault: formData.isDefault,
    };

    try {
      await postAddressApi(payload, accessToken);
      setLoading(false);
      setStatusMessage({
        type: "success",
        message: "✅ Địa chỉ đã được lưu thành công!",
      });

      onSubmissionSuccess();
    } catch (error: any) {
      setLoading(false);
      setStatusMessage({
        type: "error",
        message: `❌ ${error.message}`,
      });
      console.error("Lỗi postAddressApi:", error);
    }
  };

  return (
<div className="mx-auto max-w-xl rounded-lg p-3 font-sans max-h-[70vh] overflow-y-auto md:max-h-full">
        <div className="mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Địa chỉ nhận hàng</h1>
      </div>

      {statusMessage.message && (
        <div
          className={`mb-4 flex items-center rounded-lg p-3 text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="mr-2 h-5 w-5" />
          ) : (
            <XCircle className="mr-2 h-5 w-5" />
          )}
          {statusMessage.message}
        </div>
      )}

      <form onSubmit={handlePostAddress} className="space-y-6">
        {/* Tỉnh/Thành phố */}
        <CustomSelect
          label="Tỉnh/Thành phố"
          name="provinceCode"
          value={formData.provinceCode}
          onChange={handleChange as (e: ChangeEvent<HTMLSelectElement>) => void}
          options={provinces}
          placeholder="Chọn Tỉnh/Thành phố"
        />

        {/* Quận/Huyện */}
        <CustomSelect
          label="Quận/Huyện"
          name="districtCode"
          value={formData.districtCode}
          onChange={handleChange as (e: ChangeEvent<HTMLSelectElement>) => void}
          options={districts}
          placeholder="Chọn Quận/Huyện"
          disabled={!formData.provinceCode}
        />

        {/* Phường/Xã */}
        <CustomSelect
          label="Phường/Xã"
          name="wardCode"
          value={formData.wardCode}
          onChange={handleChange as (e: ChangeEvent<HTMLSelectElement>) => void}
          options={wards}
          placeholder="Chọn Phường/Xã"
          disabled={!formData.districtCode}
        />

        <div>
          <label
            htmlFor="line"
            className="block text-sm font-medium text-gray-700"
          >
            Địa chỉ cụ thể
          </label>
          <input
            type="text"
            id="line"
            name="line"
            value={formData.line}
            onChange={handleChange}
            required
            placeholder="Nhập địa chỉ cụ thể (Số nhà, tên đường, khu vực...)"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center justify-between border-t py-2 pt-4">
          <span className="text-sm font-medium text-gray-700">
            Đặt làm địa chỉ mặc định
          </span>
          <label
            htmlFor="isDefault"
            className="flex cursor-pointer items-center"
          >
            <div className="relative">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="sr-only"
              />
              <div
                className={`block h-6 w-12 rounded-full transition-all duration-300 ${
                  formData.isDefault ? "bg-red-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                  formData.isDefault
                    ? "translate-x-6 transform"
                    : "translate-x-0 transform"
                }`}
              ></div>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`flex w-full justify-center rounded-lg border border-transparent px-4 py-3 text-lg font-medium text-white shadow-sm transition-colors duration-200 ${
            loading
              ? "cursor-wait bg-red-400"
              : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          } `}
        >
          {loading ? "Đang xác nhận..." : "Xác nhận"}
        </button>
      </form>
    </div>
  );
};

export default AddressForm;
