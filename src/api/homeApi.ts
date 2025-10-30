const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

interface HomePageData {
  flashsale: any;
  samsung: any;
  xiaomi: any;
  iphone: any;
  laptop: any;
  mobile_brand: any;
  laptop_brand: any;
  laptop_feature: any;
  mobile_feature: any;
  error?: string;
  details?: string;
  mobilefilter: any;
  laptopfilter: any;
  mobilebestseller: any;
  laptopbestseller: any;
}

interface Endpoint {
  key: keyof HomePageData;
  url: string;
}

export async function getHomePageData(): Promise<HomePageData> {
  const endpoints: Endpoint[] = [
    {
      key: "mobilebestseller",
      url: `${BASE_URL}/api/public/product/best_seller/mobile?size=15`,
    },
    {
      key: "laptopbestseller",
      url: `${BASE_URL}/api/public/product/best_seller/laptop?size=15`,
    },
 
    {
      key: "samsung",
      url: `${BASE_URL}/api/public/product/featured/mobile/samsung?size=20`,
    },
    {
      key: "iphone",
      url: `${BASE_URL}/api/public/product/featured/mobile/apple?size=20`,
    },
    {
      key: "laptop",
      url: `${BASE_URL}/api/public/product/featured/laptop?size=20`,
    },
    {
      key: "mobile_brand",
      url: `${BASE_URL}/api/public/category/mobile?type=brand`,
    },
    {
      key: "laptop_brand",
      url: `${BASE_URL}/api/public/category/laptop?type=brand`,
    },
    {
      key: "laptop_feature",
      url: `${BASE_URL}/api/public/category/laptop?type=feature`,
    },
    {
      key: "mobile_feature",
      url: `${BASE_URL}/api/public/category/mobile?type=feature`,
    },
  ];

  const results = await Promise.all(
    endpoints.map(async ({ key, url }) => {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return [key, data];
      } catch (err) {
        console.error(`❌ Error fetching "${key}":`, err);
        return [key, { error: (err as Error).message }];
      }
    }),
  );

  return Object.fromEntries(results) as HomePageData;
}
