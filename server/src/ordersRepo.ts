import { db } from "./db";
import { ApiError } from "./errors";

export type NewOrder = {
  customerName: string;
  customerEmail: string;
  items: { productId: number; quantity: number }[];
};

export type Order = {
  id: number;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  createdAt: string;
  items: {
    productId: number;
    name: string;
    quantity: number;
    unitPriceCents: number;
  }[];
};

type OrderRow = {
  id: number;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  created_at: string;
};

type OrderItemRow = {
  product_id: number;
  name: string;
  quantity: number;
  unit_price_cents: number;
};

type StockRow = { id: number; name: string; price_cents: number; stock: number };

const findProduct = db.prepare(
  "SELECT id, name, price_cents, stock FROM products WHERE id = ?"
);
const insertOrder = db.prepare(
  "INSERT INTO orders (customer_name, customer_email, total_cents) VALUES (?, ?, ?)"
);
const insertItem = db.prepare(
  "INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (?, ?, ?, ?)"
);
// Subtracts stock only if enough is left. If not, zero rows change.
const decrementStock = db.prepare(
  "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?"
);

// Everything inside this function succeeds together or fails together.
// If anything throws, SQLite rolls back every change made inside it.
const placeOrder = db.transaction((input: NewOrder): number => {
  // 1. Look up the REAL prices. The client's prices are never used.
  const lines = input.items.map((item) => {
    const product = findProduct.get(item.productId) as StockRow | undefined;
    if (!product) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", `No product with id ${item.productId}`);
    }
    return { product, quantity: item.quantity };
  });

  // 2. The server computes the total
  const totalCents = lines.reduce(
    (sum, l) => sum + l.product.price_cents * l.quantity,
    0
  );

  // 3. Create the order
  const orderId = Number(
    insertOrder.run(input.customerName, input.customerEmail, totalCents)
      .lastInsertRowid
  );

  // 4. For each line: take the stock, and record the price paid
  for (const { product, quantity } of lines) {
    const result = decrementStock.run(quantity, product.id, quantity);
    if (result.changes === 0) {
      const current = findProduct.get(product.id) as StockRow;
      throw new ApiError(
        409,
        "INSUFFICIENT_STOCK",
        `Only ${current.stock} ${current.name} in stock`,
        { productId: product.id, requested: quantity, available: current.stock }
      );
    }
    insertItem.run(orderId, product.id, quantity, product.price_cents);
  }

  return orderId;
});

export function createOrder(input: NewOrder): Order {
  const orderId = placeOrder(input);
  return getOrderById(orderId) as Order;
}

export function getOrderById(id: number): Order | undefined {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | OrderRow
    | undefined;
  if (!order) return undefined;

  const items = db
    .prepare(
      `SELECT oi.product_id, p.name, oi.quantity, oi.unit_price_cents
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?
       ORDER BY oi.id`
    )
    .all(id) as OrderItemRow[];

  return {
    id: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    totalCents: order.total_cents,
    createdAt: order.created_at,
    items: items.map((i) => ({
      productId: i.product_id,
      name: i.name,
      quantity: i.quantity,
      unitPriceCents: i.unit_price_cents,
    })),
  };
}