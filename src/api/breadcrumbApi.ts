export async function fetchBreadcrumb(categorySlug: string) {
  const apiUrl = `http://localhost:8080/api/public/category/${categorySlug}`;

  try {
    const response = await fetch(apiUrl);

    // ✅ Nếu là 404, trả về null để xử lý trang 404
    if (response.status === 404) {
      console.warn(`Breadcrumb not found for: ${categorySlug}`);
      return null;
    }

    // ❌ Nếu là lỗi khác (500, 403, ...), ném lỗi để catch
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for URL: ${apiUrl}`);
    }

    // ✅ Nếu OK, parse JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching breadcrumb:", error);
    return null; // ✅ Dùng null thay vì []
  }
}
