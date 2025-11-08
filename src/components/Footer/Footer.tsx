import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-5 leading-[1.5]">
            <div className="bg-neutral-50">
                <div className="mx-auto grid max-w-screen-xl grid-cols-2 rounded-lg gap-6 p-4 md:grid-cols-4 xl:px-2">
                    <div className="footer-col-1 flex flex-col gap-6">
                        <section className="text-neutral-800">
                            <p className="text-md mb-3 font-semibold">Tổng đài hỗ trợ miễn phí</p>
                            <ul className="disable-phone-link flex flex-col gap-1.25 text-base">
                                <li>
                                    <div className="">Mua hàng - bảo hành <a href="tel:18002097"><strong>1800.2097</strong></a> (7h30 - 22h00)</div>
                                </li>
                                <li>
                                    <div className="">Khiếu nại <a href="tel:18002063"><strong>1800.2063</strong></a> (8h00 - 21h30)</div>
                                </li>
                            </ul>
                        </section>
                        <section className="text-neutral-800">
                            <p className="text-md mb-3 font-semibold">Phương thức thanh toán</p>
                            <ul className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/sforum/apple-pay-viet-nam" title="Apple Pay" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="Apple Pay" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/wysiwyg/apple-pay-og.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/sforum/vnpay-la-gi-cach-dang-ky-vnpay-thanh-toan-vnpay-chi-tiet" title="Vnpay" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="Vnpay" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/payment/vnpay-logo.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/huong-dan-thanh-toan-qua-vi-momo-cellphones" title="MoMo" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="MoMo" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/wysiwyg/momo_1.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/huong-dan-mua-hang-va-thanh-toan-qua-cong-onepay" title="Onepay" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="Onepay" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/payment/onepay-logo.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/huong-dan-mua-hang-online" title="Mpos" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="Mpos" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/payment/mpos-logo.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/uu-dai-doi-tac/kredivo" title="Kredivo" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="Kredivo" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/payment/kredivo-logo.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/sforum/huong-dan-toan-bang-zalopay-khi-mua-hang-tren-website-cellphones" title="Zalopay" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="Zalopay" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/payment/zalopay-logo.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/huong-dan-mua-hang-online" title="Alepay" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="Alepay" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/payment/alepay-logo.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-10 md:h-8">
                                    <a href="https://cellphones.com.vn/huong-dan-thanh-toan-qua-cong-fundiin-tren-website-cellphones" title="Fundiin" target="_blank" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12">
                                            <img alt="Fundiin" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-10 w-15 rounded-sm border border-neutral-100 object-contain md:h-8 md:w-12" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/wysiwyg/fundiin.png" />
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </section>
                       
                    </div>
                    <div className="footer-col-2 text-neutral-800">
                        <p className="text-md mb-3 font-semibold">Thông tin về chính sách</p>
                        <ul className="flex flex-col gap-2.5 text-base">
                            <li><a target="_blank" rel="noopener" title="Mua hàng và thanh toán Online" className="hover:underline" href="/chinh-sach-giao-hang">Mua hàng và thanh toán Online</a></li>
                            <li><a target="_blank" rel="noopener" title="Mua hàng trả góp Online" className="hover:underline" href="/tra-gop-online-the-tin-dung">Mua hàng trả góp Online</a></li>
                            <li><a target="_blank" rel="noopener" title="Mua hàng trả góp bằng thẻ tín dụng" className="hover:underline" href="/huong-dan-mua-hang-tra-gop-bang-the-tin-dung-tai-cellphones">Mua hàng trả góp bằng thẻ tín dụng</a></li>
                            <li><a target="_blank" rel="noopener" title="Chính sách giao hàng" className="hover:underline" href="/chinh-sach-giao-hang">Chính sách giao hàng</a></li>
                            <li><a target="_blank" rel="noopener" title="Chính sách đổi trả" className="hover:underline" href="/tos?part=refund-policy">Chính sách đổi trả</a></li>
                            <li><a target="_blank" rel="nofollow" title="Tra điểm Smember" className="hover:underline" href="https://smember.com.vn?company_id=cellphones">Tra điểm Smember</a></li>
                            <li><a target="_blank" rel="noopener" title="Xem ưu đãi Smember" className="hover:underline" href="/uu-dai-smember">Xem ưu đãi Smember</a></li>
                            <li><a target="_blank" rel="nofollow" title="Tra thông tin bảo hành" className="hover:underline" href="https://smember.com.vn/warranty?company_id=cellphones">Tra thông tin bảo hành</a></li>
                            <li><a target="_blank" rel="nofollow" title="Tra cứu hoá đơn điện tử" className="hover:underline" href="https://hddt.cellphones.com.vn">Tra cứu hoá đơn điện tử</a></li>
                            <li><a target="_blank" rel="noopener" title="Thông tin hoá đơn mua hàng" className="hover:underline" href="/quy-dinh-ve-hoa-don-khi-mua-hang-cellphones">Thông tin hoá đơn mua hàng</a></li>
                            <li><a target="_blank" rel="noopener" title="Trung tâm bảo hành chính hãng" className="hover:underline" href="/bao-hanh/apple">Trung tâm bảo hành chính hãng</a></li>
                            <li><a target="_blank" rel="noopener" title="Quy định về việc sao lưu dữ liệu" className="hover:underline" href="/quy-dinh-ve-viec-sao-luu-du-lieu">Quy định về việc sao lưu dữ liệu</a></li>
                            <li><a target="_blank" rel="noopener" title="Chính sách khui hộp sản phẩm Apple" className="hover:underline" href="/chinh-sach-khui-hop-apple">Chính sách khui hộp sản phẩm Apple</a></li>
                            <li><a target="_blank" rel="noopener" title="VAT Refund" className="hover:underline" href="/vat-refund">VAT Refund</a></li>
                        </ul>
                    </div>
                    <div className="footer-col-3 text-neutral-800">
                        <p className="text-md mb-3 font-semibold">Dịch vụ và thông tin khác</p>
                        <ul className="flex flex-col gap-2.5 text-base">
                            <li><a target="_blank" rel="noopener" title="Khách hàng doanh nghiệp (B2B)" className="hover:underline" href="/dich-vu-khach-hang-doanh-nghiep">Khách hàng doanh nghiệp (B2B)</a></li>
                            <li><a target="_blank" rel="noopener" title="Ưu đãi thanh toán" className="hover:underline" href="/danh-sach-khuyen-mai">Ưu đãi thanh toán</a></li>
                            <li><a target="_blank" rel="noopener" title="Quy chế hoạt động" className="hover:underline" href="/tos">Quy chế hoạt động</a></li>
                            <li><a target="_blank" rel="noopener" title="Chính sách bảo mật thông tin cá nhân" className="hover:underline" href="/tos?part=privacy-policy">Chính sách bảo mật thông tin cá nhân</a></li>
                            <li><a target="_blank" rel="noopener" title="Chính sách Bảo hành" className="hover:underline" href="/chinh-sach-bao-hanh">Chính sách Bảo hành</a></li>
                            <li><a target="_blank" rel="noopener" title="Liên hệ hợp tác kinh doanh" className="hover:underline" href="/lien-he-hop-tac">Liên hệ hợp tác kinh doanh</a></li>
                            <li><a target="_blank" rel="nofollow noopener" title="Tuyển dụng" className="hover:underline" href="https://tuyendung.cellphones.com.vn">Tuyển dụng</a></li>
                            <li><a target="_blank" rel="noopener" title="Dịch vụ bảo hành mở rộng" className="hover:underline" href="/bieu-phi-bao-hanh-mo-rong">Dịch vụ bảo hành mở rộng</a></li>
                        </ul>
                        <div className="mt-2.5">
                            <div className="flex items-center gap-1">
                                <span className="text-md font-bold text-neutral-800">Mua sắm dễ dàng – Ưu đãi ngập tràn cùng app CellphoneS</span>
                            </div>
                            <div className="mt-2.5 flex gap-2">
                                <div className="flex-1">
                                    <span className="cps-image-cdn relative inline-block">
                                        <img alt="QR tải app CellphoneS" loading="lazy" width={200} height={200} decoding="async" data-nimg="1" className="transition-opacity duration-500 opacity-100 object-contain" style={{ color: 'transparent' }} src="https://cdn2.cellphones.com.vn/200x,webp/media/wysiwyg/QR_appGeneral.jpg" />
                                    </span>
                                </div>
                                <div className="flex w-4/7 flex-col gap-2 md:gap-0">
                                    <a target="_blank" title="Tải app từ Google Play" href="https://play.google.com/store/apps/details?id=vn.com.cellphones.android.smember" rel="nofollow">
                                        <span className="cps-image-cdn relative inline-block">
                                            <img alt="Tải app từ Google Play" loading="lazy" width={200} height={67} decoding="async" data-nimg="1" className="transition-opacity duration-500 opacity-100 object-contain" style={{ color: 'transparent' }} src="https://cdn2.cellphones.com.vn/200x,webp/media/wysiwyg/downloadANDROID.png" />
                                        </span>
                                    </a>
                                    <a target="_blank" title="Tải app từ App Store" href="https://apps.apple.com/vn/app/smember/id6502395577?l=vi" rel="nofollow">
                                        <span className="cps-image-cdn relative inline-block">
                                            <img alt="Tải app từ App Store" loading="lazy" width={200} height={59} decoding="async" data-nimg="1" className="transition-opacity duration-500 opacity-100 object-contain" style={{ color: 'transparent' }} src="https://cdn2.cellphones.com.vn/200x,webp/media/wysiwyg/downloadiOS.png" />
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-col-4 flex flex-col gap-6 text-neutral-800">
                        <section className="text-neutral-800">
                            <p className="text-md mt-3 mb-1 font-semibold md:mt-0 md:mb-3">Kết nối với CellphoneS</p>
                            <ul className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <li className="h-7">
                                    <a href="https://www.youtube.com/@CellphoneSOfficial" title="CellphoneS Youtube Chanel" target="_blank" rel="nofollow" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-8 w-12 rounded-sm object-contain md:h-7 md:w-10">
                                            <img alt="CellphoneS Youtube Chanel" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-8 w-12 rounded-sm object-contain md:h-7 md:w-10" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/social/cellphones-youtube.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-7">
                                    <a href="https://www.facebook.com/CellphoneSVietnam" title="CellphoneS Fanpage" target="_blank" rel="nofollow" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-8 w-12 rounded-sm object-contain md:h-7 md:w-10">
                                            <img alt="CellphoneS Fanpage" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-8 w-12 rounded-sm object-contain md:h-7 md:w-10" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/social/cellphones-facebook.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-7">
                                    <a href="https://www.instagram.com/cellphonesvn" title="CellphoneS Instagram" target="_blank" rel="nofollow" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-8 w-12 rounded-sm object-contain md:h-7 md:w-10">
                                            <img alt="CellphoneS Instagram" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-8 w-12 rounded-sm object-contain md:h-7 md:w-10" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/social/cellphones-instagram.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-7">
                                    <a href="https://www.tiktok.com/@cellphones.official" title="CellphoneS Tiktok" target="_blank" rel="nofollow" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-8 w-12 rounded-sm object-contain md:h-7 md:w-10">
                                            <img alt="CellphoneS Tiktok" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-8 w-12 rounded-sm object-contain md:h-7 md:w-10" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/social/cellphones-tiktok.png" />
                                        </span>
                                    </a>
                                </li>
                                <li className="h-7">
                                    <a href="https://oa.zalo.me/3894196696036261863" title="CellphoneS Zalo" target="_blank" rel="nofollow" className="inline-block">
                                        <span className="cps-image-cdn relative inline-block h-8 w-12 rounded-sm object-contain md:h-7 md:w-10">
                                            <img alt="CellphoneS Zalo" loading="lazy" decoding="async" data-nimg="fill" className="transition-opacity duration-500 opacity-100 object-contain h-8 w-12 rounded-sm object-contain md:h-7 md:w-10" style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }} src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/logo/social/cellphones-zalo.png" />
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </section>
                        <section className="text-neutral-800">
                            <p className="text-md mb-3 font-semibold">Website thành viên</p>
                            <ul className="flex flex-col gap-1 md:gap-3">
                                <li className="text-md md:text-base">
                                    <p>Hệ thống bảo hành và chăm sóc Điện thoại - Máy tính</p>
                                    <a href="https://dienthoaivui.com.vn" rel="nofollow" title="Hệ thống bảo hành và chăm sóc Điện thoại - Máy tính" target="_blank" className="mt-2 inline-block h-7.5 w-full">
                                        <img height={30} src="https://cdn2.cellphones.com.vn/x30,webp/media/logo/corp-members/dienthoaivui.png" alt="Hệ thống bảo hành và chăm sóc Điện thoại - Máy tính" className="object-contain" loading="lazy" />
                                    </a>
                                </li>
                                <li className="text-md md:text-base">
                                    <p>Trung tâm bảo hành uỷ quyền Apple</p>
                                    <a href="https://cares.vn/" rel="nofollow" title="Trung tâm bảo hành uỷ quyền Apple" target="_blank" className="mt-2 inline-block h-7.5 w-full">
                                        <img height={30} src="https://cdn2.cellphones.com.vn/x/media/wysiwyg/Logo_CareS_1.png" alt="Trung tâm bảo hành uỷ quyền Apple" className="object-contain" loading="lazy" />
                                    </a>
                                </li>
                                <li className="text-md md:text-base">
                                    <p>Kênh thông tin giải trí công nghệ cho giới trẻ</p>
                                    <a href="https://schannel.vn/" rel="nofollow" title="Kênh thông tin giải trí công nghệ cho giới trẻ" target="_blank" className="mt-2 inline-block h-7.5 w-full">
                                        <img height={30} src="https://cdn2.cellphones.com.vn/x30,webp/media/logo/corp-members/schanel.png" alt="Kênh thông tin giải trí công nghệ cho giới trẻ" className="object-contain" loading="lazy" />
                                    </a>
                                </li>
                                <li className="text-md md:text-base">
                                    <p>Trang thông tin công nghệ mới nhất</p>
                                    <a href="https://cellphones.com.vn/sforum" rel="noopener" title="Trang thông tin công nghệ mới nhất" target="_blank" className="mt-2 inline-block h-7.5 w-full">
                                        <img height={30} src="https://cdn2.cellphones.com.vn/x30,webp/media/logo/corp-members/sforum.png" alt="Trang thông tin công nghệ mới nhất" className="object-contain" loading="lazy" />
                                    </a>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
            <div className="bg-neutral-100 py-4 px-2">
                <div className="mx-auto max-w-screen-xl">
                    <section className="grid grid-cols-2 gap-6 text-xs md:grid-cols-4">
                        <div className="flex flex-col">
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="iPhone Air" href="/mobile/apple/iphone-air.html">iPhone Air</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="iPhone 17" href="/mobile/apple/iphone-17.html">iPhone 17</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="iPhone 17 Pro" href="/iphone-17-pro.html">iPhone 17 Pro</a></p>
                            </div>
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Giá iPhone 17 Pro Max" href="/iphone-17-pro-max.html">Giá iPhone 17 Pro Max</a></p>
                            </div>
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="iPhone 16" href="/mobile/apple/iphone-16.html">iPhone 16</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="iPhone 16 Pro Max" href="/iphone-16-pro-max.html">iPhone 16 Pro Max</a></p>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Điện thoại" href="/mobile.html">Điện thoại</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Điện thoại iPhone" href="/mobile/apple.html">Điện thoại iPhone</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Xiaomi" href="/mobile/xiaomi.html">Xiaomi</a></p>
                            </div>
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Điện thoại Samsung Galaxy" href="/mobile/samsung.html">Điện thoại Samsung Galaxy</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Điện thoại OPPO" href="/mobile/oppo.html">Điện thoại OPPO</a></p>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Laptop" href="/laptop.html">Laptop</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Laptop Acer" href="/laptop/acer.html">Laptop Acer</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Laptop Dell" href="/laptop/dell.html">Laptop Dell</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Laptop HP" href="/laptop/hp.html">Laptop HP</a></p>
                            </div>
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Tivi" href="/tivi.html">Tivi</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Tivi Samsung" href="/tivi/samsung.html">Tivi Samsung</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Tivi Sony" href="/tivi/sony.html">Tivi Sony</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Tivi LG" href="/tivi/lg.html">Tivi LG</a></p>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Đồ gia dụng" href="/do-gia-dung.html">Đồ gia dụng</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Máy hút bụi gia đình" href="/nha-thong-minh/may-hut-bui.html">Máy hút bụi gia đình</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Build PC" href="/may-tinh-de-ban/build-pc.html">Build PC</a></p>
                            </div>
                            <div className="flex flex-wrap">
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Camera" href="/phu-kien/camera.html">Camera</a><span className="mx-1.5">|</span></p>
                                <p><a className="leading-[2] text-neutral-800 hover:underline" title="Back to school là gì" href="/chao-nam-hoc-moi">Back to school là gì</a></p>
                            </div>
                        </div>
                    </section>
                    <section className="mx-auto mt-4 max-w-screen-lg text-center text-xs leading-[2] text-neutral-500">
                        <p>Công ty TNHH Thương Mại và Dịch Vụ Kỹ Thuật DIỆU PHÚC - GPĐKKD: 0316172372 cấp tại Sở KH &amp; ĐT TP. HCM. Địa chỉ văn phòng: 350-352 Võ Văn Kiệt, Phường Cầu Ông Lãnh, Thành phố Hồ Chí Minh, Việt Nam. Điện thoại: 028.7108.9666.</p>
                        <div className="mt-2 flex items-center justify-center gap-1">
                            <a href="http://online.gov.vn/Home/WebDetails/75641" target="_blank" rel="nofollow noopener">
                                <span className="cps-image-cdn relative inline-block h-7.5 w-20 object-contain">
                                    <img alt="Đã thông báo bộ công thương" loading="lazy" width={80} height={30} decoding="async" data-nimg="1" className="transition-opacity duration-500 opacity-100 object-contain h-7.5 w-20 object-contain" style={{ color: 'transparent' }} src="https://cdn2.cellphones.com.vn/80x,webp/media/logo/logoSaleNoti.png" />
                                </span>
                            </a>
                            <a href="https://www.dmca.com/Protection/Status.aspx?ID=158f5667-cce3-4a18-b2d1-826225e6b022" target="_blank" rel="nofollow noopener">
                                <span className="cps-image-cdn relative inline-block h-7.5 w-28 object-contain">
                                    <img alt="DMCA.com Protection Status" loading="lazy" width={149} height={31} decoding="async" data-nimg="1" className="transition-opacity duration-500 opacity-100 object-contain h-7.5 w-28 object-contain" style={{ color: 'transparent' }} src="https://images.dmca.com/Badges/dmca_copyright_protected150c.png?ID=158f5667-cce3-4a18-b2d1-826225e6b022" />
                                </span>
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </footer>
    );
};

export default Footer;