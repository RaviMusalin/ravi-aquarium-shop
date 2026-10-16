// Matches the JSON your API returns
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

export type ProductFilters = {
  category?: string;
  waterType?: string;
  q?: string;
  inStock?: boolean;
};


export type CartItem = {
  product: Product;
  quantity: number;
};


export type CompatibilityWarning = {
  type: "water_type" | "tank_size" | "temperament";
  message: string;
  productIds: number[];
};

export type CompatibilityResult = {
  compatible: boolean;
  warnings: CompatibilityWarning[];
};