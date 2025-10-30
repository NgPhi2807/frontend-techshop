
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function fetchFilter(category: string) {
  const apiUrl = `${BASE_URL}/api/public/attribute/filter/${category}`;
  let filter: any[] = [];

  try {
    const response = await fetch(apiUrl);

    if (response.ok) {
      const json = await response.json();
      if (json && json.data && Array.isArray(json.data)) {
        filter = json.data;
      }
    } else {
      console.error(`Lỗi HTTP ${response.status} khi fetch bộ lọc`);
    }
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu bộ lọc:", error);
  }

  return filter;
}
