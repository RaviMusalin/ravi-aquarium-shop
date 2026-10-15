import type { Product, ProductFilters } from "./types";

// Mirrors the error shape our server sends back
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// One helper that every API call goes through
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body?.error;
    throw new ApiError(
      res.status,
      err?.code ?? "UNKNOWN",
      err?.message ?? "Request failed"
    );
  }
  return body as T;
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<Product[]> {
  // Only include a parameter if the user actually set it
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.waterType) params.set("waterType", filters.waterType);
  if (filters.q) params.set("q", filters.q);
  if (filters.inStock) params.set("inStock", "true");

  const query = params.toString();
  const data = await request<{ products: Product[] }>(
    `/api/products${query ? `?${query}` : ""}`
  );
  return data.products;
}