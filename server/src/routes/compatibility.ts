import { Router } from "express";
import { z } from "zod";
import { checkCompatibility } from "../compatibility";
import { ApiError } from "../errors";
import { getProductsByIds } from "../productsRepo";

const bodySchema = z.object({
  productIds: z.array(z.number().int().positive()).max(50),
});

export const compatibilityRouter = Router();

// POST because the list goes in the body. It only reads, nothing is changed.
compatibilityRouter.post("/", (req, res) => {
  const { productIds } = bodySchema.parse(req.body);
  const uniqueIds = [...new Set(productIds)];
  const products = getProductsByIds(uniqueIds);

  if (products.length !== uniqueIds.length) {
    const found = new Set(products.map((p) => p.id));
    const missing = uniqueIds.filter((id) => !found.has(id));
    throw new ApiError(
      404,
      "PRODUCT_NOT_FOUND",
      `Unknown product ids: ${missing.join(", ")}`,
      { missing }
    );
  }

  const warnings = checkCompatibility(products);
  res.json({ compatible: warnings.length === 0, warnings });
});