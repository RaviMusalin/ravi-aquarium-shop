import Database from "better-sqlite3"; // opens the file and creates it if it doesn’t exist.
import path from "node:path";

// The database lives in one file: server/shop.db
const dbPath = path.join(__dirname, "..", "shop.db");

export const db = new Database(dbPath);

// SQLite ignores foreign keys unless you turn this on for every connection
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    category TEXT NOT NULL
      CHECK (category IN ('fish','tank','filter','plant','food','treatment')),
    water_type TEXT NOT NULL
      CHECK (water_type IN ('freshwater','saltwater','both')),
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_tank_gallons INTEGER,
    tank_gallons INTEGER,
    temperament TEXT
      CHECK (temperament IN ('peaceful','semi-aggressive','aggressive')),
    CHECK (tank_gallons IS NULL OR category = 'tank'),
    CHECK ((min_tank_gallons IS NULL AND temperament IS NULL) OR category = 'fish')
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0)
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_products_water_type ON products(water_type);
  CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
`);