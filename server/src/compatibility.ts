// "import type" means this file never loads the database, which keeps tests simple
import type { Product } from "./productsRepo";

export type CompatibilityWarning = {
  type: "water_type" | "tank_size" | "temperament";
  message: string;
  productIds: number[];
};

function names(products: Product[]): string {
  return products.map((p) => p.name).join(", ");
}

// Pure function: products in, warnings out. No database, no HTTP, no side effects.
export function checkCompatibility(products: Product[]): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  const fish = products.filter((p) => p.category === "fish");

  // Rule 1: freshwater and saltwater items don't mix (items marked "both" are ignored)
  const freshwater = products.filter((p) => p.waterType === "freshwater");
  const saltwater = products.filter((p) => p.waterType === "saltwater");
  if (freshwater.length > 0 && saltwater.length > 0) {
    warnings.push({
      type: "water_type",
      message: `Freshwater items (${names(freshwater)}) don't mix with saltwater items (${names(saltwater)})`,
      productIds: [...freshwater, ...saltwater].map((p) => p.id),
    });
  }

  // Rule 2: a fish needs a big enough tank (skipped if there's no tank in the cart)
  const tanks = products.filter(
    (p) => p.category === "tank" && p.tankGallons !== null
  );
  if (tanks.length > 0) {
    const largestTank = tanks.reduce((best, t) =>
      (t.tankGallons ?? 0) > (best.tankGallons ?? 0) ? t : best
    );
    const capacity = largestTank.tankGallons ?? 0;
    for (const f of fish) {
      if (f.minTankGallons !== null && f.minTankGallons > capacity) {
        warnings.push({
          type: "tank_size",
          message: `${f.name} needs at least ${f.minTankGallons} gallons, but the largest tank in your cart holds ${capacity}`,
          productIds: [f.id, largestTank.id],
        });
      }
    }
  }

  // Rule 3: an aggressive fish warns when any other fish is in the cart
  for (const f of fish) {
    if (f.temperament !== "aggressive") continue;
    const others = fish.filter((o) => o.id !== f.id);
    if (others.length > 0) {
      warnings.push({
        type: "temperament",
        message: `${f.name} is aggressive and may harm ${names(others)}`,
        productIds: [f.id, ...others.map((o) => o.id)],
      });
    }
  }

  return warnings;
}