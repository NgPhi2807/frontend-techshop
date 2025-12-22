import { useState, useEffect } from "react";
import { useCustomerProfileStore } from "../stores/useCustomerProfileStore";

export const useUpdateProfile = () => {
    const { user, updateProfile, loading } = useCustomerProfileStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", gender: "Nam", birth: "" });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                gender: "Nam",
                birth: "2000-01-01",
            });
        }
    }, [user, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await updateProfile(formData);
        if (result.success) setIsEditing(false);
    };

    return { isEditing, setIsEditing, formData, loading, handleChange, handleSubmit };
};