import { Router } from "express";
import { z } from "zod";
import { ApiError } from "../errors";
import { getProductById, listProducts } from "../productsRepo";

// Describes which query parameters are allowed and what values are valid
const listQuerySchema = z.object({
  category: z.enum(["fish", "tank", "filter", "plant", "food", "treatment"]).optional(),
  waterType: z.enum(["freshwater", "saltwater", "both"]).optional(),
  q: z.string().trim().optional(),
  maxPriceCents: z
    .string()
    .regex(/^\d+$/, "must be a whole number")
    .transform(Number)
    .optional(),
  inStock: z.enum(["true", "false"]).optional(),
});

export const productsRouter = Router();

productsRouter.get("/", (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const products = listProducts({
    category: query.category,
    waterType: query.waterType,
    q: query.q,
    maxPriceCents: query.maxPriceCents,
    inStock: query.inStock === "true",
  });
  res.json({ products });
});

productsRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "INVALID_ID", "Product id must be a positive integer");
  }
  const product = getProductById(id);
  if (!product) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", `No product with id ${id}`);
  }
  res.json({ product });
});