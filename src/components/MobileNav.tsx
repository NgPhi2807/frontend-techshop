import React, { useState, useEffect } from "react";
const MobileNav: React.FC = () => {
 const [isVisible, setIsVisible] = useState(false);
 const [showQR, setShowQR] = useState(false);
 const [showContact, setShowContact] = useState(false);

 useEffect(() => {
  const handleScroll = () => {
   setIsVisible(window.scrollY > 100);
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
 };

 const appButtonClasses = `fixed bottom-32 right-2 lg:right-8 transition-all duration-300 z-[9999] ${
  isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
 }`;

 const navClasses = `fixed bottom-5 right-4 flex flex-col gap-3 transition-all duration-300 z-[9999] ${
  isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
 }`;

 return (
  <>
   {showQR && (
    <>
     <div
      className="fixed inset-0 bg-black/50 z-[9998]"
      onClick={() => setShowQR(false)}
     />

     <div className="fixed bottom-[250px] right-2 bg-white rounded-lg shadow-2xl p-4 text-center z-[9999] w-64">
      <h3 className="font-semibold text-gray-800 mb-1">
       Mua sắm dễ dàng
      </h3>
      <p className="text-xs text-gray-500 mb-3">
       Ưu đãi ngập tràn cùng app dienthoaihay
      </p>

      <img
       src="/src/assets/QR_appGeneral.webp"
       alt="QR"
       className="w-50 mx-auto rounded-md"
      />

      <button
       onClick={() => setShowQR(false)}
       className="absolute top-2 right-2 bg-gray-200 rounded-full w-6 h-6 text-xs hover:bg-gray-300"
      >
       ✕
      </button>

      <svg
       width="62"
       height="48"
       viewBox="0 0 62 48"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       className="absolute bottom-[-36px] left-1/2 -translate-x-1/2 text-white drop-shadow-md"
      >
       <path
        d="M0 0C6.17869 10.6 27.2289 35.04 62 48C52.6254 39.4 36.6887 17.76 47.9381 0H0Z"
        fill="currentColor"
       ></path>
      </svg>
     </div>
    </>
   )}

   {showContact && (
    <div 
     className={`
      fixed bottom-[130px] right-4 z-[10000] px-6 py-3 pt-0 rounded-lg shadow-2xl bg-white
      flex flex-col gap-2 w-fit text-sm transition-all duration-300
      ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
     `}
    >      

      <button
       onClick={() => setShowContact(false)}
       className="absolute -top-2 -right-2 bg-gray-200 rounded-full w-6 h-6 text-xs hover:bg-gray-300"
      >
       ✕
      </button>

     
     <a 
      href="https://zalo.me/sdt-hoac-id-zalo" 
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-md hover:bg-gray-100 font-semibold text-blue-600 mt-4" // Thêm margin-top để tránh nút đóng
      onClick={() => setShowContact(false)}
     >
      
    <div className="flex justify-center items-center gap-2">
       <img
      src="/src/assets/icon-zalo-2025.webp"
      alt="Tải App Ngay"
      className="w-6 h-6 object-cover rounded-full"
     />
     <span>Liên hệ zalo</span>
    </div>
     </a>
    </div>
   )}

   <div id="app-download-nav" className={appButtonClasses}>
    <button
     onClick={() => { setShowQR(true); setShowContact(false); }} 
     className={`w-20 h-20 rounded-full shadow-lg transition-transform hover:scale-105 shake-bell ${
      showQR ? "z-[9998]" : "z-[9999]"
     }`}
    >
     <img
      src="/src/assets/icon_downloadapp.webp"
      alt="Tải App Ngay"
      className="w-full h-full object-cover rounded-full"
     />
    </button>
   </div>

   <div id="mobile-nav" className={navClasses}>
    <button
     onClick={() => { setShowContact(!showContact); setShowQR(false); }} 
     className="
      flex items-center justify-center gap-1 shadow-md text-white font-semibold
      w-12 h-12 flex-col bg-red-600 text-[10px] rounded-lg
      lg:w-28 lg:h-11 lg:flex-row lg:text-sm
     "
    >
     <span className="order-2 lg:order-1">Liên hệ</span>
     <svg
      stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-5 h-5 lg:order-2"
     >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path
       d="M19 14v4h-2v-4h2M7 14v4H6c-.55 0-1-.45-1-1v-3h2m5-13a9 9 0 0 0-9 
      9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 
      7-7s7 3.13 7 7v2h-4v8h4v1h-7v2h6c1.66 0 3-1.34 
      3-3V10a9 9 0 0 0-9-9z"
      ></path>
     </svg>
    </button>

    <button
     onClick={scrollToTop}
     className="
      flex items-center justify-center gap-1 shadow-md text-white font-semibold
      w-12 h-12 flex-col bg-black text-[10px] rounded-lg
      lg:w-28 lg:h-11 lg:flex-row lg:text-sm
     "
    >
     <span className="order-2 lg:order-1">Lên đầu</span>
     <svg
      stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 lg:order-2"
     >
      <polyline points="17 11 12 6 7 11"></polyline>
      <polyline points="17 18 12 13 7 18"></polyline>
     </svg>
    </button>
   </div>
  </>
 );
};

export default MobileNav;