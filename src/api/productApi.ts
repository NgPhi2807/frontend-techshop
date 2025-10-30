const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

interface ProductData {
  id: number;
  name: string;
  slug: string;
  detail: any;
  variants: any[];
  promotion: any;
}

interface HomePageData {
  product_detail: {
    code: number;
    timestamp: string;
    data: ProductData;
    error?: string; 
  };
}

interface Endpoint {
  key: keyof HomePageData;
  url: string;
}

export async function getHomePageData(slug: string): Promise<HomePageData> {
  const endpoints: Endpoint[] = [
    {
      key: "product_detail",
      url: `${BASE_URL}/api/public/product/${slug}/detail`,
    },
  ];

  const results = await Promise.all(
    endpoints.map(async ({ key, url }) => {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok)
          throw new Error(`HTTP ${response.status} - Could not load ${key}`);
        const data = await response.json();
        return [key, data];
      } catch (err) {
        console.error(`❌ Error fetching "${key}":`, err);
        return [key, { error: (err as Error).message, code: 500 }];
      }
    }),
  );

  return Object.fromEntries(results) as HomePageData;
}
