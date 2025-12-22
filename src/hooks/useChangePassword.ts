import { useState } from "react";
import { useAuthStore } from "../stores/authStore1";
import { toast } from "react-toastify";

export const useChangePassword = () => {
    const changePassword = useAuthStore((state) => state.changePassword);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);
        const result = await changePassword(formData);
        setLoading(false);

        if (result.success) {
            toast.success("Đổi mật khẩu thành công!");
            setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            toast.error(result.message || "Đổi mật khẩu thất bại.");
        }
    };

    return { formData, loading, handleChange, handleSubmit };
};