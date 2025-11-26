
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function fetchRelatedProducts(lastSlug: string): Promise<any[] | null> {
  const baseUrl = `${BASE_URL}/api/public/product/filter`;
  const apiUrl = `${baseUrl}/${lastSlug}`;

  try {
    const filterResponse = await fetch(apiUrl, {
      method: "GET",
    });

    if (filterResponse.ok) {
      const filterData = await filterResponse.json();
      if (filterData?.data) {
        return filterData.data;
      }
      return null;
    } else {
      console.error(
        `Lỗi khi gọi API ${apiUrl}:`,
        filterResponse.status,
        filterResponse.statusText
      );
      return null;
    }
  } catch (e) {
    console.error("Lỗi khi fetch sản phẩm liên quan:", e);
    return null;
  }
}