
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateAddressApi, type AddressPayload } from '../../api/addressApi';
import { fetchProvincesApi, fetchDistrictsApi, fetchWardsApi, type Division } from '../../api/geographyApi';
import { Loader2 } from 'lucide-react';

interface Address extends AddressPayload {
    id: number;
}
interface UpdateFormProps {
    initialData: Address;
    onSubmissionSuccess: () => void;
    onClose: () => void;
    accessToken: string | null;
}

const InputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 shadow-sm";
const SelectClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white shadow-sm";

const UpdateAddressForm: React.FC<UpdateFormProps> = ({
    initialData,
    onSubmissionSuccess,
    onClose,
    accessToken
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<AddressPayload>({
        id: initialData.id,
        line: initialData.line,
        ward: initialData.ward,
        district: initialData.district,
        province: initialData.province,
        isDefault: initialData.isDefault,
        name: initialData.name,
        phone: initialData.phone,
    });

    const [provinces, setProvinces] = useState<Division[]>([]);
    const [districts, setDistricts] = useState<Division[]>([]);
    const [wards, setWards] = useState<Division[]>([]);

    const [selectedCodes, setSelectedCodes] = useState({
        provinceCode: 0,
        districtCode: 0,
        wardCode: 0,
    });
    const [loadingGeography, setLoadingGeography] = useState(true);

    const [isInitialLoadingDone, setIsInitialLoadingDone] = useState(false);


    useEffect(() => {
        const loadProvinces = async () => {
            const data = await fetchProvincesApi();
            setProvinces(data);

            const initialProvince = data.find(p => p.name === initialData.province);
            if (initialProvince) {
                setSelectedCodes(prev => ({ ...prev, provinceCode: initialProvince.code }));
            } else {
                setLoadingGeography(false);
            }
        };
        loadProvinces();
    }, []);


    useEffect(() => {
        if (selectedCodes.provinceCode) {
            const loadDistricts = async () => {
                const data = await fetchDistrictsApi(selectedCodes.provinceCode);
                setDistricts(data);

                if (loadingGeography) {
                    const initialDistrict = data.find(d => d.name === initialData.district);
                    if (initialDistrict) {
                        setSelectedCodes(prev => ({ ...prev, districtCode: initialDistrict.code }));
                    } else {
                        setLoadingGeography(false);
                    }
                }
            };
            loadDistricts();
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedCodes.provinceCode, initialData.district, loadingGeography]);

    useEffect(() => {
        if (selectedCodes.districtCode) {
            const loadWards = async () => {
                const data = await fetchWardsApi(selectedCodes.districtCode);
                setWards(data);

                if (loadingGeography) {
                    const initialWard = data.find(w => w.name === initialData.ward);
                    if (initialWard) {
                        setSelectedCodes(prev => ({ ...prev, wardCode: initialWard.code }));
                        setLoadingGeography(false);
                    } else {
                        setLoadingGeography(false);
                    }
                }
                if (!isInitialLoadingDone) setIsInitialLoadingDone(true);
            };
            loadWards();
        } else {
            setWards([]);
            if (!isInitialLoadingDone) setIsInitialLoadingDone(true);
        }
    }, [selectedCodes.districtCode, initialData.ward, loadingGeography]);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'province' || name === 'district' || name === 'ward') {
            const code = Number(value);

            const selectElement = e.target as HTMLSelectElement;
            const divisionName = code !== 0 ? selectElement.options[selectElement.selectedIndex].text : '';

            if (name === 'province') {
                setSelectedCodes({ provinceCode: code, districtCode: 0, wardCode: 0 });
                setFormData(prev => ({ ...prev, province: divisionName, district: '', ward: '' }));
            } else if (name === 'district') {
                setSelectedCodes(prev => ({ ...prev, districtCode: code, wardCode: 0 }));
                setFormData(prev => ({ ...prev, district: divisionName, ward: '' }));
            } else if (name === 'ward') {
                setSelectedCodes(prev => ({ ...prev, wardCode: code }));
                setFormData(prev => ({ ...prev, ward: divisionName }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!accessToken || !formData.id) {
            toast.error("Lỗi xác thực hoặc thiếu ID địa chỉ.");
            setIsSubmitting(false);
            return;
        }
        if (!formData.province || !formData.district || !formData.ward) {
            toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã.");
            setIsSubmitting(false);
            return;
        }

        try {
            toast.info(`Đang cập nhật địa chỉ ID ${formData.id}...`);
            await updateAddressApi(formData, accessToken);
            toast.success("✅ Địa chỉ đã được cập nhật thành công!");
            onSubmissionSuccess();
        } catch (error: any) {
            console.error("Lỗi cập nhật địa chỉ:", error);
            toast.error(`❌ ${error?.message || "Lỗi cập nhật không xác định."}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingGeography && !isInitialLoadingDone) {
        return (
            <div className="flex h-64 items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                <p className="ml-3 text-gray-600">Đang tải dữ liệu địa lý...</p>
            </div>
        );
    }


    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <h4 className="font-bold text-lg text-gray-800 border-b pb-3 mb-1">Thông tin cập nhật</h4>

            <div className="space-y-3 pt-2">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
                    <input
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className={InputClass}
                        placeholder="Nguyễn Văn A"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className={InputClass}
                        placeholder="09xx xxx xxx"
                    />
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-gray-700">Địa chỉ (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã)</label>

                <div>
                    <label htmlFor="province" className="sr-only">Tỉnh/Thành phố</label>
                    <select
                        id="province"
                        name="province"
                        value={selectedCodes.provinceCode}
                        onChange={handleChange}
                        className={SelectClass}
                        disabled={provinces.length === 0 || loadingGeography}
                        required
                    >
                        <option value={0} disabled>-- Tỉnh/Thành phố --</option>
                        {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="district" className="sr-only">Quận/Huyện</label>
                    <select
                        id="district"
                        name="district"
                        value={selectedCodes.districtCode}
                        onChange={handleChange}
                        className={SelectClass}
                        disabled={!selectedCodes.provinceCode || districts.length === 0 || loadingGeography}
                        required
                    >
                        <option value={0} disabled>-- Quận/Huyện --</option>
                        {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="ward" className="sr-only">Phường/Xã</label>
                    <select
                        id="ward"
                        name="ward"
                        value={selectedCodes.wardCode}
                        onChange={handleChange}
                        className={SelectClass}
                        disabled={!selectedCodes.districtCode || wards.length === 0 || loadingGeography}
                        required
                    >
                        <option value={0} disabled>-- Phường/Xã --</option>
                        {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="line" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể (Số nhà, đường...)</label>
                <input
                    id="line"
                    name="line"
                    value={formData.line}
                    onChange={handleChange}
                    className={InputClass}
                    placeholder="Nhập địa chỉ chi tiết"
                    required
                />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
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
                            className={`block h-6 w-12 rounded-full transition-all duration-300 ${formData.isDefault ? "bg-red-500" : "bg-gray-300"
                                }`}
                        ></div>
                        <div
                            className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${formData.isDefault
                                ? "translate-x-6 transform"
                                : "translate-x-0 transform"
                                }`}
                        ></div>
                    </div>
                </label>
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || loadingGeography}
                    className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-bold text-white shadow-sm transition ${isSubmitting || loadingGeography ? "cursor-wait bg-red-400" : "bg-red-600 hover:bg-red-700"
                        }`}
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
};

export default UpdateAddressForm;