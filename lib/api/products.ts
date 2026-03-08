export const productsQueryKey = ["products"] as const;

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  keySellingPoints: string[];
  certifications: string[];
  velocityData: string | null;
  packagingSustainability: string | null;
  pricePositioning: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export type CreateProductInput = {
  name: string;
  category: string;
  description?: string;
  keySellingPoints?: string[];
  certifications?: string[];
  velocityData?: string | null;
  packagingSustainability?: string | null;
  pricePositioning?: string | null;
};

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to add product");
  return data;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to update product");
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to delete product");
  }
}
