import express from "express";
import { errorHandler } from "./errors";
import { productsRouter } from "./routes/products";
import { compatibilityRouter } from "./routes/compatibility";
import { ordersRouter } from "./routes/orders";

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/compatibility", compatibilityRouter);
app.use("/api/orders", ordersRouter);

// Anything that didn't match a route above
app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
});

// Must be last so it can catch errors from everything above
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});