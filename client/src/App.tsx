import { useEffect, useState } from "react";
import { getProducts } from "./api";
import type { Product } from "./types";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Something went wrong: {error}</p>;

  return (
    <main>
      <h1>Ravi's Aquarium Shop</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong> — {formatPrice(p.priceCents)} ({p.category},{" "}
            {p.waterType}) — {p.stock} in stock
          </li>
        ))}
      </ul>
    </main>
  );
}