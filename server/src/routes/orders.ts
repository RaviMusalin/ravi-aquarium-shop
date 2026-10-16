import { Router } from "express";
import { z } from "zod";
import { ApiError } from "../errors";
import { createOrder, getOrderById } from "../ordersRepo";

const orderSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(100),
  customerEmail: z.string().trim().pipe(z.email("Invalid email address")),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Cart is empty")
    .max(50),
});

export const ordersRouter = Router();

ordersRouter.post("/", (req, res) => {
  const input = orderSchema.parse(req.body);

  // If the same product appears twice, add the quantities together,
  // so the stock check sees the true total
  const quantities = new Map<number, number>();
  for (const item of input.items) {
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity
    );
  }
  const items = [...quantities].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  const order = createOrder({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    items,
  });
  res.status(201).json({ order });
});

ordersRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "INVALID_ID", "Order id must be a positive integer");
  }
  const order = getOrderById(id);
  if (!order) {
    throw new ApiError(404, "ORDER_NOT_FOUND", `No order with id ${id}`);
  }
  res.json({ order });
});