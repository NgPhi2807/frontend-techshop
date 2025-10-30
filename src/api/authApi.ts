// auth-api.ts

const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;
const API_LOGIN_URL = `${BASE_URL}/api/public/auth/login`;
const API_REGISTER_URL = `${BASE_URL}/api/public/auth/register`;
export const API_REFRESH_TOKEN_URL = `${BASE_URL}/api/public/auth/refresh_token`;
const API_RESET_PASSWORD_URL = `${BASE_URL}/api/public/auth/reset-password`;
interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface LoginResponse {
    code: number;
    message: string;
    data?: {
        accessToken: string;
        refreshToken: string;
    };
}

interface RegisterResponse {
    code: number;
    message: string;
}
interface StandardResponse {
    code: number;
    message: string;
    errorCode?: number;
    timestamp?: string;
    path?: string;
}
export async function loginApi(phone: string, password: string): Promise<LoginResponse> {
    const response = await fetch(API_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ phone, password }),
    });

    const result: LoginResponse = await response.json();
    result.code = response.ok ? result.code : response.status; // Ghi đè code bằng status nếu lỗi HTTP

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            result.message = "Số điện thoại hoặc mật khẩu không chính xác.";
        } else if (!result.message) {
            result.message = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
        }
    }
    return result;
}


export async function registerApi(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await fetch(API_REGISTER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
        },
        body: JSON.stringify(payload),
    });
    
    const result: RegisterResponse = await response.json();

    if (!response.ok || result.code !== 1000) {
        // Ánh xạ lỗi cụ thể từ API
        const apiMessage = result.message?.toLowerCase() || "";
        let errorMessage = result.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";

        const errorMap: { [key: string]: string } = {
            INVALID_PASSWORD_FORMAT:
                "Mật khẩu không hợp lệ. Cần tối thiểu 6 ký tự và chứa ký tự đặc biệt.",
            INVALID_EMAIL_FORMAT: "Địa chỉ email không đúng định dạng.",
        };

        if (result.message && errorMap[result.message]) {
            errorMessage = errorMap[result.message];
        } else if (
            apiMessage.includes("email") &&
            (apiMessage.includes("exist") || apiMessage.includes("duplicate"))
        ) {
            errorMessage = "Email đã tồn tại. Vui lòng sử dụng email khác.";
        } else if (
            apiMessage.includes("phone") &&
            (apiMessage.includes("exist") || apiMessage.includes("duplicate"))
        ) {
            errorMessage =
                "Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.";
        }
        
        return { code: result.code || response.status, message: errorMessage };
    }
    return result;
}


export async function refreshTokenApi(refreshToken: string): Promise<LoginResponse> {
    const response = await fetch(API_REFRESH_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
        },
        body: JSON.stringify({ refreshToken }),
    });

    const result: LoginResponse = await response.json();
    return result;
}
export async function resetPasswordApi(email: string): Promise<StandardResponse> {
    const response = await fetch(API_RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
        },
        body: JSON.stringify({ email }),
    });

    const result: StandardResponse = await response.json();
    if (!response.ok) {
        if (!result.message) {
             result.message = "Đã xảy ra lỗi hệ thống khi gửi yêu cầu.";
        }
        result.code = response.status;
    }
    
    if (result.code !== 1000) {
        if (result.errorCode === 1001) {
            result.message = "Email này chưa được đăng ký trong hệ thống.";
        }
    }

    return result;
}