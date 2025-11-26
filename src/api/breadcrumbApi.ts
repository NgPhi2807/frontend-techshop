
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function fetchBreadcrumb(categorySlug: string) {
  const apiUrl = `${BASE_URL}/api/public/category/${categorySlug}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for URL: ${apiUrl}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching breadcrumb:", error);
    return [];
  }
}