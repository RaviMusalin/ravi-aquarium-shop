import { db } from "./db";

// The shape the API returns (camelCase)
export type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  waterType: string;
  priceCents: number;
  stock: number;
  minTankGallons: number | null;
  tankGallons: number | null;
  temperament: string | null;
};

// The shape the database returns (snake_case)
type ProductRow = {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  category: string;
  water_type: string;
  price_cents: number;
  stock: number;
  min_tank_gallons: number | null;
  tank_gallons: number | null;
  temperament: string | null;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    category: row.category,
    waterType: row.water_type,
    priceCents: row.price_cents,
    stock: row.stock,
    minTankGallons: row.min_tank_gallons,
    tankGallons: row.tank_gallons,
    temperament: row.temperament,
  };
}

export type ProductFilters = {
  category?: string;
  waterType?: string;
  q?: string;
  maxPriceCents?: number;
  inStock?: boolean;
};

export function listProducts(filters: ProductFilters): Product[] {
  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (filters.category) {
    conditions.push("category = @category");
    params.category = filters.category;
  }
  if (filters.waterType) {
    // Items marked 'both' (tanks, filters, conditioner) work in either kind of tank
    conditions.push("(water_type = @waterType OR water_type = 'both')");
    params.waterType = filters.waterType;
  }
  if (filters.q) {
    conditions.push("name LIKE @q");
    params.q = `%${filters.q}%`;
  }
  if (filters.maxPriceCents !== undefined) {
    conditions.push("price_cents <= @maxPriceCents");
    params.maxPriceCents = filters.maxPriceCents;
  }
  if (filters.inStock) {
    conditions.push("stock > 0");
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM products ${where} ORDER BY category, name`;

  const rows = db.prepare(sql).all(params) as ProductRow[];
  return rows.map(toProduct);
}

export function getProductById(id: number): Product | undefined {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as
    | ProductRow
    | undefined;
  return row ? toProduct(row) : undefined;
}


export function getProductsByIds(ids: number[]): Product[] {
  if (ids.length === 0) return [];
  // One "?" per id; the values themselves still go in as parameters
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(...ids) as ProductRow[];
  return rows.map(toProduct);
}