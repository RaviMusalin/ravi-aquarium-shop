import { db } from "./db";

type SeedProduct = {
  name: string;
  description: string;
  category: "fish" | "tank" | "filter" | "plant" | "food" | "treatment";
  waterType: "freshwater" | "saltwater" | "both";
  priceCents: number;
  stock: number;
  minTankGallons?: number;
  tankGallons?: number;
  temperament?: "peaceful" | "semi-aggressive" | "aggressive";
};

const products: SeedProduct[] = [
  // Freshwater fish
  { name: "Neon Tetra", description: "Small, colorful schooling fish.", category: "fish", waterType: "freshwater", priceCents: 399, stock: 50, minTankGallons: 10, temperament: "peaceful" },
  { name: "Guppy", description: "Hardy, easy-care livebearer.", category: "fish", waterType: "freshwater", priceCents: 299, stock: 60, minTankGallons: 5, temperament: "peaceful" },
  { name: "Betta", description: "Showy fish that prefers to live alone.", category: "fish", waterType: "freshwater", priceCents: 1299, stock: 20, minTankGallons: 5, temperament: "semi-aggressive" },
  { name: "Angelfish", description: "Tall, graceful cichlid.", category: "fish", waterType: "freshwater", priceCents: 1599, stock: 15, minTankGallons: 30, temperament: "semi-aggressive" },
  { name: "Oscar", description: "Large, intelligent, and predatory cichlid.", category: "fish", waterType: "freshwater", priceCents: 1999, stock: 8, minTankGallons: 75, temperament: "aggressive" },
  { name: "Cory Catfish", description: "Peaceful bottom dweller.", category: "fish", waterType: "freshwater", priceCents: 599, stock: 25, minTankGallons: 10, temperament: "peaceful" },
  { name: "Discus", description: "Premium centerpiece fish.", category: "fish", waterType: "freshwater", priceCents: 4999, stock: 2, minTankGallons: 50, temperament: "peaceful" },
  // Saltwater fish
  { name: "Clownfish", description: "Classic reef fish.", category: "fish", waterType: "saltwater", priceCents: 3499, stock: 12, minTankGallons: 20, temperament: "semi-aggressive" },
  { name: "Blue Tang", description: "Bright, active reef fish.", category: "fish", waterType: "saltwater", priceCents: 4999, stock: 5, minTankGallons: 75, temperament: "peaceful" },
  { name: "Royal Gramma", description: "Purple and yellow reef fish.", category: "fish", waterType: "saltwater", priceCents: 3999, stock: 6, minTankGallons: 30, temperament: "peaceful" },
  { name: "Lionfish", description: "Striking predator with venomous spines.", category: "fish", waterType: "saltwater", priceCents: 5999, stock: 3, minTankGallons: 75, temperament: "aggressive" },
  // Tanks
  { name: "10-Gallon Starter Tank", description: "Glass tank, great for beginners.", category: "tank", waterType: "both", priceCents: 4999, stock: 10, tankGallons: 10 },
  { name: "20-Gallon Long Tank", description: "Wide footprint for more swimming room.", category: "tank", waterType: "both", priceCents: 7999, stock: 8, tankGallons: 20 },
  { name: "55-Gallon Tank", description: "Popular size for community tanks.", category: "tank", waterType: "both", priceCents: 15999, stock: 4, tankGallons: 55 },
  { name: "75-Gallon Tank", description: "Room for large fish.", category: "tank", waterType: "both", priceCents: 21999, stock: 3, tankGallons: 75 },
  // Filters
  { name: "Sponge Filter", description: "Gentle filtration for small tanks.", category: "filter", waterType: "both", priceCents: 1299, stock: 30 },
  { name: "Hang-on-Back Filter", description: "Easy-to-maintain mid-size filter.", category: "filter", waterType: "both", priceCents: 2999, stock: 15 },
  { name: "Canister Filter", description: "Powerful filtration for large tanks.", category: "filter", waterType: "both", priceCents: 8999, stock: 10 },
  // Plants
  { name: "Anubias", description: "Hardy, low-light plant.", category: "plant", waterType: "freshwater", priceCents: 899, stock: 30 },
  { name: "Java Fern", description: "Easy plant that attaches to rocks.", category: "plant", waterType: "freshwater", priceCents: 799, stock: 30 },
  { name: "Amazon Sword", description: "Large background plant.", category: "plant", waterType: "freshwater", priceCents: 1099, stock: 20 },
  // Food
  { name: "Tropical Flakes", description: "Everyday food for freshwater fish.", category: "food", waterType: "freshwater", priceCents: 799, stock: 40 },
  { name: "Marine Pellets", description: "Nutritious pellets for saltwater fish.", category: "food", waterType: "saltwater", priceCents: 1099, stock: 25 },
  // Treatments
  { name: "Water Conditioner", description: "Makes tap water safe for fish.", category: "treatment", waterType: "both", priceCents: 699, stock: 100 },
  { name: "Marine Salt Mix", description: "Mix with water for saltwater tanks.", category: "treatment", waterType: "saltwater", priceCents: 2499, stock: 15 },
];

const insert = db.prepare(`
  INSERT INTO products
    (name, description, category, water_type, price_cents, stock,
     min_tank_gallons, tank_gallons, temperament)
  VALUES
    (@name, @description, @category, @waterType, @priceCents, @stock,
     @minTankGallons, @tankGallons, @temperament)
`);

// A transaction makes the whole reseed all-or-nothing
const seedAll = db.transaction(() => {
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM products;
    DELETE FROM sqlite_sequence;
  `);
  for (const p of products) {
    insert.run({
      name: p.name,
      description: p.description,
      category: p.category,
      waterType: p.waterType,
      priceCents: p.priceCents,
      stock: p.stock,
      minTankGallons: p.minTankGallons ?? null,
      tankGallons: p.tankGallons ?? null,
      temperament: p.temperament ?? null,
    });
  }
});

seedAll();
console.log(`Seeded ${products.length} products`);