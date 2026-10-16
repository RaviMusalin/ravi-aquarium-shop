import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../api";
import { formatPrice } from "../format";
import type { Order } from "../types";

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getOrder(Number(id))
      .then((o) => {
        if (!ignore) setOrder(o);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  if (error) {
    return (
      <>
        <p className="error">{error}</p>
        <Link to="/">Back to the shop</Link>
      </>
    );
  }
  if (!order) return <p>Loading…</p>;

  return (
    <>
      <h2>Thank you, {order.customerName}!</h2>
      <p>
        Order #{order.id} is confirmed. A receipt would go to {order.customerEmail}.
      </p>
      <ul className="cart-list">
        {order.items.map((item) => (
          <li key={item.productId} className="order-row">
            <span>{item.name}</span>
            <span>
              {item.quantity} × {formatPrice(item.unitPriceCents)}
            </span>
            <span>{formatPrice(item.quantity * item.unitPriceCents)}</span>
          </li>
        ))}
      </ul>
      <p className="cart-total">
        <strong>Total: {formatPrice(order.totalCents)}</strong>
      </p>
      <Link to="/">Keep shopping</Link>
    </>
  );
}