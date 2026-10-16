import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCompatibility } from "./compatibility";
import type { Product } from "./productsRepo";

// A helper that builds a product, so each test only states what matters
function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 1,
    name: "Test",
    description: "",
    imageUrl: null,
    category: "fish",
    waterType: "freshwater",
    priceCents: 100,
    stock: 10,
    minTankGallons: null,
    tankGallons: null,
    temperament: null,
    ...overrides,
  };
}

const neon = makeProduct({ id: 1, name: "Neon Tetra", minTankGallons: 10, temperament: "peaceful" });
const oscar = makeProduct({ id: 2, name: "Oscar", minTankGallons: 75, temperament: "aggressive" });
const clownfish = makeProduct({ id: 3, name: "Clownfish", waterType: "saltwater", minTankGallons: 20, temperament: "semi-aggressive" });
const smallTank = makeProduct({ id: 4, name: "20-Gallon Tank", category: "tank", waterType: "both", tankGallons: 20 });

test("no warnings for compatible items", () => {
  assert.deepEqual(checkCompatibility([neon, smallTank]), []);
});

test("warns when freshwater and saltwater are mixed", () => {
  const warnings = checkCompatibility([neon, clownfish]);
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].type, "water_type");
});

test("warns when a fish needs a bigger tank than the one in the cart", () => {
  const warnings = checkCompatibility([oscar, smallTank]);
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].type, "tank_size");
});

test("skips the tank size rule when there is no tank", () => {
  assert.deepEqual(checkCompatibility([oscar]), []);
});

test("warns when an aggressive fish is with other fish", () => {
  const warnings = checkCompatibility([oscar, neon]);
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].type, "temperament");
});