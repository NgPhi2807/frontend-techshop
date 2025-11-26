
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function fetchBrandCategory(categorySlug: string) {
  const apiUrl = `${BASE_URL}/api/public/category/${categorySlug}?type=brand`;

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

export async function fetchFeatureCategory(categorySlug: string) {
  const apiUrl = `${BASE_URL}/api/public/category/${categorySlug}?type=feature`;

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

export async function fetchSeriesCategory(categorySlug: string) {
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