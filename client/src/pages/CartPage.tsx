import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../format";

export default function CartPage() {
  const { items, totalCents, setQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <>
        <h2>Your cart</h2>
        <p>Your cart is empty.</p>
        <Link to="/">Browse products</Link>
      </>
    );
  }

  return (
    <>
      <h2>Your cart</h2>
      <ul className="cart-list">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="cart-row">
            <span className="cart-name">{product.name}</span>
            <span>{formatPrice(product.priceCents)}</span>
            <span className="qty">
              <button
                onClick={() => setQuantity(product.id, quantity - 1)}
                disabled={quantity <= 1}
              >
                −
              </button>
              {quantity}
              <button
                onClick={() => setQuantity(product.id, quantity + 1)}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </span>
            <span>{formatPrice(product.priceCents * quantity)}</span>
            <button onClick={() => removeItem(product.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <p className="cart-total">
        <strong>Total: {formatPrice(totalCents)}</strong>
      </p>
      <button onClick={clearCart}>Empty cart</button>
    </>
  );
}