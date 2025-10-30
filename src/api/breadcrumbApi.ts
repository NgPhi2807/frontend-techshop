
export async function fetchBreadcrumb(categorySlug: string) {
  const apiUrl = `http://localhost:8080/api/public/category/${categorySlug}`;

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