import React from "react";
import { useChangePassword } from "../../hooks/useChangePassword";

const ChangePasswordForm: React.FC = () => {
    const { formData, loading, handleChange, handleSubmit } = useChangePassword();

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header đồng bộ với Profile */}
            <div className="flex items-center justify-between mb-6 border-b border-indigo-100 pb-2">
                <h1 className="text-xl font-extrabold text-gray-800 lg:text-2xl">
                    Đổi mật khẩu
                </h1>
                <p className="hidden md:block text-sm text-gray-500 italic">
                    Nên cập nhật mật khẩu định kỳ để bảo mật tài khoản
                </p>
            </div>

            {/* Card Content */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400">
                            Mật khẩu hiện tại
                        </label>
                        <input
                            type="password"
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full mt-1 p-2 border rounded focus:ring-1 focus:ring-indigo-500 outline-none transition"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full mt-1 p-2 border rounded focus:ring-1 focus:ring-indigo-500 outline-none transition"
                                required
                            />
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400">
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full mt-1 p-2 border rounded focus:ring-1 focus:ring-indigo-500 outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Nút bấm đồng bộ màu đỏ (red-600) như bên Profile */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center w-fit px-6 bg-red-600 py-2.5 text-white font-bold rounded hover:bg-red-700 disabled:bg-gray-300 transition duration-200"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="mr-2 h-4 w-4 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận thay đổi"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordForm;