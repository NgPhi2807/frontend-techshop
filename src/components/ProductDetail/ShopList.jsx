import React from "react";

// Dữ liệu JSON đã được bổ sung thêm trường phone (số điện thoại)
const shopData = {
  code: 1000,
  timestamp: "2025-10-17T15:03:08.641+07:00",
  data: [
    {
      id: 1,
      name: "SHOP1",
      displayAddress: "Liên Chiểu, Hoà Khánh Bắc, Đà Nẵng",
      location: {
        latitude: 16.073877,
        longitude: 108.149826,
      },
      phone: "02361234567", // Giả định số điện thoại
      timeOpen: "08:00:00",
      timeClose: "22:00:00",
    },
    {
      id: 2,
      name: "SHOP2",
      displayAddress:
        "54 Nguyễn Lương Bằng, Liên Chiểu, Hoà Khánh Bắc, Đà Nẵng",
      location: {
        latitude: 16.074797,
        longitude: 108.14518,
      },
      phone: "02367654321", // Giả định số điện thoại
      timeOpen: "08:00:00",
      timeClose: "22:00:00",
    },
  ],
};

/**
 * Hàm tạo URL Google Maps chuẩn (sử dụng API Search)
 *
 * @param {number} lat - Vĩ độ (Latitude)
 * @param {number} lng - Kinh độ (Longitude)
 * @param {string} address - Tên hoặc địa chỉ để hiển thị làm nhãn trên bản đồ
 * @returns {string} URL Google Maps
 */
const createMapUrl = (lat, lng, address) => {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}&query_place_id=&center=${lat},${lng}`;
};

const ShopList = () => {
  const shops = shopData.data;

  return (
    <div className="">
      <h1 className="mb-2 border-b pb-3 text-base font-semibold text-gray-800 lg:text-xl">
        Danh Sách Cửa Hàng
      </h1>

      {shops && shops.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
            >
              <div className="mb-4">
                <p className="text-sm font-semibold leading-relaxed text-gray-800">
                  {shop.displayAddress}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">{shop.name}</span> | Mở cửa:{" "}
                  {shop.timeOpen} - {shop.timeClose}
                </p>
              </div>

              <div className="flex space-x-3">
                <a
                  href={`tel:${shop.phone}`}
                  className="flex-1 whitespace-nowrap rounded-full border border-red-100 bg-red-50 px-2 py-1 text-center text-xs font-bold text-red-600 transition duration-150 hover:bg-red-100"
                >
                  <span role="img" aria-label="phone">
                    📞
                  </span>{" "}
                  {shop.phone}
                </a>

                {/* Nút Bản đồ (Nền trắng, viền xám) */}
                <a
                  href={createMapUrl(
                    shop.location.latitude,
                    shop.location.longitude,
                    shop.displayAddress,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 whitespace-nowrap rounded-full border border-gray-300 bg-white py-1 text-center text-xs font-medium text-gray-700 transition duration-150 hover:bg-gray-50"
                >
                  <span role="img" aria-label="map" className="mr-1">
                    📍
                  </span>{" "}
                  Bản đồ
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-2 text-gray-600">
          Không có dữ liệu cửa hàng để hiển thị.
        </p>
      )}
    </div>
  );
};

export default ShopList;
