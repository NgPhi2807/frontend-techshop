
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useCustomerProfileStore } from "../../stores/useCustomerProfileStore";
import AddressForm from "./AddressFilterPanel";
import UpdateAddressForm from "./UpdateAddressForm";
import { Trash2, Edit, Home } from "lucide-react";
import { toast } from "react-toastify";
import { deleteAddressApi, type AddressPayload } from "../../api/addressApi";



interface Address extends AddressPayload {
    id: number;
}

interface AddressItemProps extends Address {
    onDelete: (addressId: number) => Promise<void>;
    onEdit: (address: Address) => void;
    userName: string;
    userPhone: string;
}

interface CommonFormProps {
    onSubmissionSuccess: () => void;
}


const AddressItem: React.FC<AddressItemProps> = ({
    id, name, phone, line, ward, district, province, isDefault, onDelete, onEdit, userName, userPhone,
}) => {
    const contactName = name || userName || "Người dùng";
    const contactPhone = phone || userPhone || "Chưa có SĐT";
    const fullAddress = `Địa chỉ cụ thể: ${line}, ${ward}, ${district}, ${province}`;

    const handleDeleteClick = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
            onDelete(id);
        }
    };

    const handleEditClick = () => {
        onEdit({ id, name, phone, line, ward, district, province, isDefault });
    };

    return (
        <div className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <Home className="h-4 w-4" />
                    </div>

                    <p className="font-semibold text-gray-800 break-all">
                        {contactName} |
                    </p>

                    <p className="font-semibold text-gray-800 break-all">
                        {contactPhone}
                    </p>

                    {isDefault && (
                        <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Mặc định
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-3 sm:justify-end w-full sm:w-auto">
                    <button
                        onClick={handleEditClick}
                        className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                        <Edit className="h-4 w-4" /> Sửa
                    </button>

                    <button
                        onClick={handleDeleteClick}
                        disabled={isDefault}
                        className={`flex items-center gap-1 text-sm font-medium transition-colors ${isDefault
                            ? "cursor-not-allowed text-gray-400"
                            : "text-gray-600 hover:text-red-600"
                            }`}
                    >
                        <Trash2 className="h-4 w-4" /> Xóa
                    </button>
                </div>
            </div>

            <p className="pt-4 text-gray-600 break-words">{fullAddress}</p>
        </div>
    );

};


const LoadingState: React.FC = () => (
    <div className="rounded-lg border border-gray-200 p-8 text-center text-red-600 bg-white shadow-sm">
        <p className="font-semibold text-lg animate-pulse">Đang tải sổ địa chỉ...</p>
        <p className="text-sm text-gray-500 mt-1">Vui lòng chờ giây lát.</p>
    </div>
);

const EmptyState: React.FC<{ onAddNew: () => void }> = ({ onAddNew }) => (
    <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-500 bg-white shadow-sm">
        <p className="mb-4 text-lg font-semibold">Bạn chưa có địa chỉ nhận hàng nào.</p>

    </div>
);

const AddressManagementLayout: React.FC = () => {
    const { user, fetchProfile } = useCustomerProfileStore();
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        let token = null;
        if (typeof window !== "undefined") {
            token = localStorage.getItem("accessToken");
            setAccessToken(token);
        }

        if (!user || initialLoad) {
            fetchProfile(true).finally(() => {
                setInitialLoad(false);
            });
        }
    }, [fetchProfile]);

    const handleOpenForm = (address: Address | null = null) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAddress(null);
    };

    const handleEditAddress = useCallback((address: Address) => {
        handleOpenForm(address);
    }, []);

    const handleDeleteAddress = useCallback(
        async (addressId: number) => {
            if (!accessToken) {
                toast.error("Vui lòng đăng nhập để thực hiện thao tác.");
                return;
            }

            try {
                await deleteAddressApi(addressId, accessToken);
                toast.success("✅ Địa chỉ đã được xóa thành công! Đang cập nhật danh sách...");
                await fetchProfile(true);
            } catch (error: any) {
                console.error("Lỗi xóa địa chỉ:", error);
                toast.error(`❌ ${error?.message || "Đã xảy ra lỗi không mong muốn."}`);
            }
        },
        [accessToken, fetchProfile],
    );

    const sortedAddresses = useMemo(() => {
        return (
            user?.addresses?.slice().sort((a, b) => {
                if (a.isDefault && !b.isDefault) return -1;
                if (!a.isDefault && b.isDefault) return 1;
                return 0;
            }) || []
        );
    }, [user?.addresses]);

    const userName = useMemo(() => user?.name || "Người dùng", [user?.name]);
    const userPhone = useMemo(() => user?.phone || "Chưa có SĐT", [user?.phone]);

    const formTitle = editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới";

    const FormToRender = useMemo(() => {
        const submissionHandler = () => {
            handleCloseForm();
            fetchProfile(true);
        };

        if (editingAddress) {
            return (
                <UpdateAddressForm
                    initialData={editingAddress}
                    onSubmissionSuccess={submissionHandler}
                    onClose={handleCloseForm}
                    accessToken={accessToken}
                />
            );
        }

        return (
            <AddressForm
                onSubmissionSuccess={submissionHandler}
            />
        );
    }, [editingAddress, fetchProfile, accessToken]);


    const AddressContent = useMemo(() => {
        // Chỉ cần kiểm tra initialLoad. Nếu initialLoad = false, tức là đã tải xong.
        if (initialLoad) {
            return <LoadingState />;
        }

        if (sortedAddresses.length === 0) {
            return <EmptyState onAddNew={() => handleOpenForm(null)} />;
        }

        return (
            <div className="space-y-4">
                {sortedAddresses.map((address) => (
                    <AddressItem
                        key={address.id}
                        {...address}
                        onDelete={handleDeleteAddress}
                        onEdit={handleEditAddress}
                        userName={userName}
                        userPhone={userPhone}
                    />
                ))}
            </div>
        );
    }, [initialLoad, sortedAddresses, handleDeleteAddress, handleEditAddress, userName, userPhone]);


    const AddressListHeader = (
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base lg:text-2xl font-bold text-gray-900">
                Sổ địa chỉ nhận hàng
            </h2>

            {initialLoad === false && (
                <button
                    onClick={() => handleOpenForm(null)}
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                >
                    Thêm địa chỉ mới
                </button>
            )}
        </div>
    );

    const AddressSidePanel = (
        <div
            className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-white shadow-2xl transition-transform duration-500 md:w-2/5 ${isFormOpen ? "translate-x-0" : "translate-x-full"
                }`}
        >
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h3 className="text-lg font-bold text-gray-800">{formTitle}</h3>
                <button
                    onClick={handleCloseForm}
                    className="text-2xl font-light leading-none text-gray-500 hover:text-gray-700"
                    aria-label="Đóng form"
                >
                    &times;
                </button>
            </div>

            {isFormOpen && (
                <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
                    {FormToRender}
                </div>
            )}
        </div>
    );

    return (
        <div className="relative min-h-screen w-full">
            {isFormOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black opacity-30"
                    onClick={handleCloseForm}
                />
            )}

            <div className="">
                {AddressListHeader}
                {AddressContent}
            </div>

            {AddressSidePanel}
        </div>
    );
};

export default AddressManagementLayout;