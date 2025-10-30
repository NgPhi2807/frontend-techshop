export interface Division {
  code: number;
  name: string;
}
const GEOGRAPHY_API_BASE_URL = "https://provinces.open-api.vn/api";

export const fetchProvincesApi = async (): Promise<Division[]> => {
  try {
    const response = await fetch(`${GEOGRAPHY_API_BASE_URL}/p/`);
    if (!response.ok) throw new Error(`Lỗi HTTP ${response.status}`);
    return (await response.json()) as Division[];
  } catch (error) {
    console.error("Lỗi khi tải Tỉnh/Thành phố:", error);
    return [];
  }
};

export const fetchDistrictsApi = async (
  provinceCode: number,
): Promise<Division[]> => {
  try {
    const response = await fetch(
      `${GEOGRAPHY_API_BASE_URL}/p/${provinceCode}?depth=2`,
    );
    if (!response.ok) throw new Error(`Lỗi HTTP ${response.status}`);
    const data: { districts: Division[] } = await response.json();
    return data.districts || [];
  } catch (error) {
    console.error("Lỗi khi tải Quận/Huyện:", error);
    return [];
  }
};

export const fetchWardsApi = async (districtCode: number): Promise<Division[]> => {
  try {
    const response = await fetch(
      `${GEOGRAPHY_API_BASE_URL}/d/${districtCode}?depth=2`,
    );
    if (!response.ok) throw new Error(`Lỗi HTTP ${response.status}`);
    const data: { wards: Division[] } = await response.json();
    return data.wards || [];
  } catch (error) {
    console.error("Lỗi khi tải Phường/Xã:", error);
    return [];
  }
};