import type { Product } from "../types";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <h3>{product.name}</h3>
      <p className="meta">
        {product.category} · {product.waterType}
      </p>
      <p>{product.description}</p>
      <p className="price">{formatPrice(product.priceCents)}</p>
      <p>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
    </article>
  );
}