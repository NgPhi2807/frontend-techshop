const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function fetchFilter(category: string) {
  const apiUrl = `${BASE_URL}/api/public/attribute/filter/${category}`;
  try {
    const response = await fetch(apiUrl);

    if (response.status === 404) return null; // ⬅️ Nếu API trả 404
    const json = await response.json();
    return json?.data ?? [];
  } catch (err) {
    console.error("Lỗi khi fetch filter:", err);
    return null;
  }
}
