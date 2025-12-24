import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-10 leading-relaxed text-neutral-800 border-t border-neutral-200">
            {/* Main Footer */}
            <div className="bg-white">
                <div className="mx-auto grid max-w-screen-xl grid-cols-2 gap-8 p-6 md:grid-cols-4">

                    {/* Cột 1: Hỗ trợ */}
                    <div className="flex flex-col gap-5">
                        <section>
                            <p className="text-md mb-3 font-bold uppercase tracking-tight text-red-600">Tổng đài hỗ trợ</p>
                            <ul className="flex flex-col gap-2 text-sm">
                                <li>Gọi mua hàng: <a href="tel:19001234" className="font-bold hover:text-red-600">1900.1234</a></li>
                                <li>Bảo hành: <a href="tel:19005678" className="font-bold hover:text-red-600">1900.5678</a></li>
                                <li>Khiếu nại: <a href="tel:18009000" className="font-bold hover:text-red-600">1800.9000</a></li>
                            </ul>
                        </section>

                        <section>
                            <p className="text-sm font-semibold mb-2">Phương thức thanh toán</p>
                            <div className="flex flex-wrap gap-2">
                                {['visa', 'mastercard', 'momo', 'vnpay'].map((pay) => (
                                    <div key={pay} className="h-8 w-12 rounded border border-neutral-100 bg-neutral-50 flex items-center justify-center p-1">
                                        <span className="text-[8px] font-bold uppercase text-neutral-400">{pay}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Cột 2: Chính sách */}
                    <div>
                        <p className="text-md mb-3 font-bold uppercase tracking-tight">Chính sách mua hàng</p>
                        <ul className="flex flex-col gap-2 text-sm text-neutral-600">
                            <li><a href="#" className="hover:text-red-600">Chính sách giao hàng</a></li>
                            <li><a href="#" className="hover:text-red-600">Chính sách đổi trả</a></li>
                            <li><a href="#" className="hover:text-red-600">Chính sách bảo hành</a></li>
                            <li><a href="#" className="hover:text-red-600">Chính sách bảo mật</a></li>
                            <li><a href="#" className="hover:text-red-600">Hướng dẫn thanh toán</a></li>
                        </ul>
                    </div>

                    {/* Cột 3: Thông tin */}
                    <div>
                        <p className="text-md mb-3 font-bold uppercase tracking-tight">Về MT Smart</p>
                        <ul className="flex flex-col gap-2 text-sm text-neutral-600">
                            <li><a href="#" className="hover:text-red-600">Giới thiệu MT Smart</a></li>
                            <li><a href="#" className="hover:text-red-600">Hệ thống cửa hàng</a></li>
                            <li><a href="#" className="hover:text-red-600">Tuyển dụng mới nhất</a></li>
                            <li><a href="#" className="hover:text-red-600">Liên hệ hợp tác</a></li>
                            <li><a href="#" className="hover:text-red-600">Tin công nghệ</a></li>
                        </ul>
                    </div>

                    {/* Cột 4: Kết nối & App */}
                    <div className="flex flex-col gap-5">
                        <section>
                            <p className="text-md mb-3 font-bold uppercase tracking-tight">Kết nối với chúng tôi</p>
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold cursor-pointer">f</div>
                                <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold cursor-pointer">y</div>
                                <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-bold cursor-pointer">t</div>
                            </div>
                        </section>

                        <section className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                            <p className="text-xs font-bold mb-2">Tải ứng dụng MT Smart</p>
                            <div className="flex gap-2">
                                <div className="w-12 h-12 bg-white border p-1">
                                    <div className="w-full h-full bg-neutral-200" /> {/* QR Placeholder */}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="h-5 w-16 bg-neutral-800 rounded text-[8px] text-white flex items-center justify-center">App Store</div>
                                    <div className="h-5 w-16 bg-neutral-800 rounded text-[8px] text-white flex items-center justify-center">Google Play</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;