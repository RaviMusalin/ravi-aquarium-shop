import { useState } from "react";
import FilterBar from "../components/FilterBar";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import type { ProductFilters } from "../types";

export default function CatalogPage() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { products, loading, error } = useProducts(filters);

  return (
    <>
      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <p>Loading…</p>}
      {error && <p className="error">Something went wrong: {error}</p>}
      {!loading && !error && products.length === 0 && (
        <p>No products match your filters.</p>
      )}

      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}