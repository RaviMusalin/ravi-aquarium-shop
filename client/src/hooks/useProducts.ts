import { useEffect, useState } from "react";
import { getProducts } from "../api";
import type { Product, ProductFilters } from "../types";

export function useProducts(filters: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If the filters change before this request finishes, we ignore its result
    let ignore = false;

    getProducts(filters)
      .then((data) => {
        if (ignore) return;
        setProducts(data);
        setError(null);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filters]);

  return { products, loading, error };
}