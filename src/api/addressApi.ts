
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;
export interface AddressPayload {
    id?: number;
    line: string;
    ward: string;
    district: string;
    province: string;
    isDefault: boolean;
    name?: string;
    phone?: string | null;
}

export const postAddressApi = async (
    payload: AddressPayload,
    accessToken: string,
): Promise<void> => {
    if (!accessToken) {
        throw new Error("Lỗi xác thực: Không tìm thấy Access Token.");
    }

    const response = await fetch(`${BASE_URL}/api/customer/my-address`, {
        method: "POST",
        headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        return;
    } else {
        const errorData = await response
            .json()
            .catch(() => ({ message: "Lỗi không xác định khi thêm địa chỉ." }));

        throw new Error(
            errorData.message || `Lỗi ${response.status}: Không thể lưu địa chỉ.`,
        );
    }
};

export const deleteAddressApi = async (
    addressId: number,
    accessToken: string,
): Promise<void> => {
    if (!accessToken) {
        throw new Error("Lỗi xác thực: Không tìm thấy Access Token.");
    }
    const response = await fetch(`${BASE_URL}/api/customer/my-address/${addressId}`, {
        method: "DELETE",
        headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        return;
    } else {
        const errorData = await response
            .json()
            .catch(() => ({ message: "Lỗi không xác định khi xóa." }));

        throw new Error(
            errorData.message || `Lỗi ${response.status}: Không thể xóa địa chỉ.`,
        );
    }
};

export const updateAddressApi = async (
    payload: AddressPayload,
    accessToken: string,
): Promise<void> => {
    if (!accessToken) {
        throw new Error("Lỗi xác thực: Không tìm thấy Access Token.");
    }
    if (!payload.id) {
        throw new Error("Lỗi cập nhật: Cần có ID địa chỉ để cập nhật (PUT).");
    }

    const response = await fetch(`${BASE_URL}/api/customer/my-address`, {
        method: "PUT",
        headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        return;
    } else {
        const errorData = await response
            .json()
            .catch(() => ({ message: "Lỗi không xác định khi cập nhật." }));

        throw new Error(
            errorData.message || `Lỗi ${response.status}: Không thể cập nhật địa chỉ.`,
        );
    }
};