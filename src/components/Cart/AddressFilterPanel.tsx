// src/components/Cart/AddressFilterPanel.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const ADDRESS_API_ROOT = import.meta.env.PUBLIC_API_ADDRESS;

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
interface AddressFilterPanelProps {
  onClose: () => void;
  onSave: (address: {
    province: number;
    district: number;
    ward: number;
    line: string;
  }) => void;
  currentAddress: {
    province: number | string;
    district: number | string;
    ward: number | string;
    line: string;
  };
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  setProvinces: React.Dispatch<React.SetStateAction<Province[]>>;
  setDistricts: React.Dispatch<React.SetStateAction<District[]>>;
  setWards: React.Dispatch<React.SetStateAction<Ward[]>>;
  isLoadingAddress: boolean;
  setIsLoadingAddress: React.Dispatch<React.SetStateAction<boolean>>;
}

type Step = "province" | "district" | "ward" | "line";

const AddressFilterPanel: React.FC<AddressFilterPanelProps> = ({
  onClose,
  onSave,
  currentAddress,
  provinces,
  districts,
  wards,
  setProvinces,
  setDistricts,
  setWards,
  isLoadingAddress,
  setIsLoadingAddress,
}) => {
  const initialStep: Step =
    currentAddress.province && currentAddress.district && currentAddress.ward
      ? "line"
      : "province";
  const [step, setStep] = useState<Step>(initialStep);

  const [tempAddress, setTempAddress] = useState({
    province: currentAddress.province as number | "",
    district: currentAddress.district as number | "",
    ward: currentAddress.ward as number | "",
    line: currentAddress.line,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const getAddressName = useCallback(
    (code: number | string, unitList: AddressUnit[]) => {
      return unitList.find((unit) => unit.code === code)?.name || "";
    },
    [],
  );

  const getAddressList = useMemo(() => {
    if (step === "province") return provinces;
    if (step === "district") return districts;
    if (step === "ward") return wards as AddressUnit[];
    return [];
  }, [step, provinces, districts, wards]);

  const headerTitle = useMemo(() => {
    if (step === "province") return "Chọn tỉnh/thành phố";
    if (step === "district")
      return (
        getAddressName(tempAddress.province, provinces) || "Chọn quận/huyện"
      );
    if (step === "ward")
      return (
        getAddressName(tempAddress.district, districts) || "Chọn phường/xã"
      );
    if (step === "line") return "Địa chỉ chi tiết";
    return "Thêm địa chỉ nhận hàng";
  }, [
    step,
    tempAddress.province,
    tempAddress.district,
    provinces,
    districts,
    getAddressName,
  ]);

  const filteredList = useMemo(() => {
    return getAddressList.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [getAddressList, searchTerm]);

  useEffect(() => {
    if (provinces.length === 0) {
      const fetchProvinces = async () => {
        setIsLoadingAddress(true);
        try {
          const response = await axios.get(`${ADDRESS_API_ROOT}/p/`);
          if (Array.isArray(response.data)) {
            setProvinces(response.data);
          }
        } catch (e) {
          console.error("Lỗi tải Tỉnh/Thành phố:", e);
        } finally {
          setIsLoadingAddress(false);
        }
      };
      fetchProvinces();
    }
  }, [provinces.length, setProvinces, setIsLoadingAddress]);

  useEffect(() => {
    const provinceCode = tempAddress.province;
    if (
      (step === "district" || step === "ward" || step === "line") &&
      provinceCode &&
      districts.length === 0 &&
      typeof provinceCode === "number"
    ) {
      const fetchDistricts = async () => {
        setIsLoadingAddress(true);
        try {
          const response = await axios.get(
            `${ADDRESS_API_ROOT}/p/${provinceCode}`,
            {
              params: { depth: 2 },
            },
          );
          const fetchedDistricts = response.data.districts || [];
          setDistricts(fetchedDistricts);
        } catch (e) {
          console.error("Lỗi tải Quận/Huyện:", e);
        } finally {
          setIsLoadingAddress(false);
        }
      };
      fetchDistricts();
    }
  }, [
    step,
    tempAddress.province,
    districts.length,
    setDistricts,
    setIsLoadingAddress,
  ]);

  useEffect(() => {
    const districtCode = tempAddress.district;
    if (
      (step === "ward" || step === "line") &&
      districtCode &&
      wards.length === 0 &&
      typeof districtCode === "number"
    ) {
      const fetchWards = async () => {
        setIsLoadingAddress(true);
        try {
          const response = await axios.get(
            `${ADDRESS_API_ROOT}/d/${districtCode}`,
            {
              params: { depth: 2 },
            },
          );
          const fetchedWards = response.data.wards || [];
          setWards(fetchedWards);
        } catch (e) {
          console.error("Lỗi tải Phường/Xã:", e);
        } finally {
          setIsLoadingAddress(false);
        }
      };
      fetchWards();
    }
  }, [step, tempAddress.district, wards.length, setWards, setIsLoadingAddress]);

  const handleSelectUnit = (unit: AddressUnit) => {
    if (step === "province") {
      setDistricts([]);
      setWards([]);
      setTempAddress((prev) => ({
        ...prev,
        province: unit.code,
        district: "",
        ward: "",
      }));
      setStep("district");
    } else if (step === "district") {
      setWards([]);
      setTempAddress((prev) => ({ ...prev, district: unit.code, ward: "" }));
      setStep("ward");
    } else if (step === "ward") {
      setTempAddress((prev) => ({ ...prev, ward: unit.code }));
      setStep("line");
    }
    setSearchTerm("");
  };

  const handleBack = () => {
    setSearchTerm("");
    if (step === "line") {
      setStep("ward");
    } else if (step === "ward") {
      setStep("district");
    } else if (step === "district") {
      setStep("province");
    } else {
      onClose();
    }
  };

  const handleSaveAddress = () => {
    if (
      tempAddress.province &&
      tempAddress.district &&
      tempAddress.ward &&
      tempAddress.line.trim()
    ) {
      onSave({
        province: tempAddress.province as number,
        district: tempAddress.district as number,
        ward: tempAddress.ward as number,
        line: tempAddress.line,
      });
    } else {
      alert("Vui lòng chọn đầy đủ Tỉnh, Huyện, Xã/Phường và Địa chỉ chi tiết.");
    }
  };

  const renderSelectStep = () => {
    if (isLoadingAddress) {
      return (
        <div className="p-4 text-center text-gray-500">Đang tải dữ liệu...</div>
      );
    }
    if (filteredList.length === 0 && !isLoadingAddress) {
      return (
        <div className="p-4 text-center text-gray-500">
          Không tìm thấy địa danh nào.
        </div>
      );
    }

    return (
      <div className="space-y-1 p-0">
        {filteredList.map((item) => {
          const isSelected =
            (step === "province" && tempAddress.province === item.code) ||
            (step === "district" && tempAddress.district === item.code) ||
            (step === "ward" && tempAddress.ward === item.code);
          return (
            <button
              key={item.code}
              onClick={() => handleSelectUnit(item)}
              className="flex w-full items-center justify-between border-b border-gray-100 p-4 text-left text-gray-800 transition duration-150 last:border-b-0 hover:bg-gray-50 focus:outline-none"
            >
              <span
                className={`text-base ${isSelected ? "font-bold text-red-600" : ""}`}
              >
                {item.name}
              </span>
              <div
                className={`h-6 w-6 rounded-full border-2 ${
                  isSelected
                    ? "border-red-600 bg-white p-1"
                    : "border-gray-300 bg-white"
                } flex items-center justify-center`}
              >
                {isSelected && (
                  <div className="h-full w-full rounded-full bg-red-600"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const isSearchVisible = step !== "line";

  // Chiều cao cố định của header (140px)
  const headerHeight = 140;
  // Chiều cao cố định của footer (70px)
  const footerHeight = 70;

  let contentHeightStyle = {};
  const isFooterVisible = !!(
    tempAddress.province &&
    tempAddress.district &&
    tempAddress.ward
  );

  const panelBaseHeight = "100vh"; // PC mode
  let panelDynamicHeight = `calc(${panelBaseHeight} - ${headerHeight}px)`;

  if (isFooterVisible) {
    panelDynamicHeight = `calc(${panelBaseHeight} - ${headerHeight}px - ${footerHeight}px)`;
  }

  contentHeightStyle = {
    height: panelDynamicHeight,
    "@media (max-width: 768px)": {
      height: isFooterVisible
        ? `calc(75vh - ${headerHeight}px - ${footerHeight}px)`
        : `calc(75vh - ${headerHeight}px)`,
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      <div
        className={`fixed bottom-0 left-0 h-[75vh] w-full translate-y-0 rounded-t-xl bg-white shadow-2xl transition-transform duration-300 ease-in-out md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-full md:w-[500px] md:rounded-t-none`}
      >
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-red-600 hover:text-red-800"
            >
              {step === "province" ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <span className="text-base font-semibold">Trở về</span>
              )}
            </button>

            <h2 className="text-xl font-bold text-gray-800">{headerTitle}</h2>

            <button
              onClick={() => {
                setTempAddress({
                  province: "",
                  district: "",
                  ward: "",
                  line: "",
                });
                setProvinces([]);
                setDistricts([]);
                setWards([]);
                setStep("province");
                setSearchTerm("");
              }}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Thiết lập lại
            </button>
          </div>

          {isSearchVisible && (
            <div className="relative mt-3">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border-2 border-red-500 p-2 text-sm focus:border-red-600 focus:ring-red-600"
                style={{
                  paddingLeft: "2.5rem",
                  paddingRight: "2.5rem",
                  borderColor: "#ef4444",
                }}
              />
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content (Danh sách/Form nhập Line) */}
        <div className="overflow-y-auto" style={contentHeightStyle}>
          {step !== "line" && renderSelectStep()}

          {step === "line" && (
            <div className="p-4">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Địa chỉ đã chọn:
                </label>
                <div className="space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
                  <p className="text-sm font-semibold text-gray-800">
                    {getAddressName(tempAddress.province, provinces)}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {getAddressName(tempAddress.district, districts)}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {getAddressName(tempAddress.ward, wards as AddressUnit[])}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Địa chỉ cụ thể *
                </label>
                <textarea
                  placeholder="Nhập số nhà, tên đường, khu vực..."
                  value={tempAddress.line}
                  onChange={(e) =>
                    setTempAddress((prev) => ({
                      ...prev,
                      line: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Cố định (Xác nhận) */}
        {isFooterVisible && (
          <div
            className="absolute bottom-0 w-full border-t bg-white p-4 shadow-2xl"
            style={{ height: `${footerHeight}px` }}
          >
            <button
              onClick={handleSaveAddress}
              disabled={!tempAddress.line.trim()}
              className={`w-full rounded-lg py-3 font-bold text-white transition ${
                tempAddress.line.trim()
                  ? "bg-red-600 hover:bg-red-700"
                  : "cursor-not-allowed bg-gray-400"
              }`}
            >
              Xác nhận
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressFilterPanel;
