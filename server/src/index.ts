import express from "express";

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});