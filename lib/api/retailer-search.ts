export type StoreResult = {
  fsq_id: string;
  name: string;
  location: {
    address?: string;
    locality?: string;
    region?: string;
    postcode?: string;
    formatted_address?: string;
    country?: string;
  };
};

export type SelectedStore = {
  retailerBrand: string;
  storeName: string;
  address: string;
  city: string;
  state: string;
};

export function retailerSearchQueryKey(brand: string, near: string) {
  return ["retailer-search", brand, near] as const;
}

export async function searchRetailerStores(
  brand: string,
  near: string
): Promise<StoreResult[]> {
  const params = new URLSearchParams({ query: brand, near });
  const res = await fetch(`/api/retailer-search?${params}`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to search for stores");
  return data.results ?? [];
}
