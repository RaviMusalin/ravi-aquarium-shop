import { useCart } from "../context/CartContext";
import { formatPrice } from "../format";
import type { Product } from "../types";

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem } = useCart();

  const inCart =
    items.find((i) => i.product.id === product.id)?.quantity ?? 0;
  const soldOut = product.stock === 0;
  const atLimit = inCart >= product.stock;

  return (
    <article className="product-card">
      <h3>{product.name}</h3>
      <p className="meta">
        {product.category} · {product.waterType}
      </p>
      <p>{product.description}</p>
      <p className="price">{formatPrice(product.priceCents)}</p>
      <p>
        {soldOut ? "Out of stock" : `${product.stock} in stock`}{" "}
        {product.stock > 0 && product.stock < 5 && (
          <span className="low-stock">Low stock</span>
        )}
      </p>
      <button onClick={() => addItem(product)} disabled={soldOut || atLimit}>
        {soldOut ? "Sold out" : atLimit ? "Max in cart" : "Add to cart"}
      </button>
      {inCart > 0 && <p className="meta">{inCart} in your cart</p>}
    </article>
  );
}