import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { CartItem, Product } from "../types";

type CartState = { items: CartItem[] };

// Every way the cart can change is one of these "actions"
type CartAction =
  | { type: "add"; product: Product }
  | { type: "remove"; productId: number }
  | { type: "setQuantity"; productId: number; quantity: number }
  | { type: "clear" };

// The reducer: takes the current state and an action, returns the NEW state
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: Math.min(i.quantity + 1, i.product.stock) }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case "remove":
      return {
        items: state.items.filter((i) => i.product.id !== action.productId),
      };
    case "setQuantity":
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? {
                ...i,
                quantity: Math.max(1, Math.min(action.quantity, i.product.stock)),
              }
            : i
        ),
      };
    case "clear":
      return { items: [] };
  }
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const value: CartContextValue = {
    items: state.items,
    itemCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalCents: state.items.reduce(
      (sum, i) => sum + i.quantity * i.product.priceCents,
      0
    ),
    addItem: (product) => dispatch({ type: "add", product }),
    removeItem: (productId) => dispatch({ type: "remove", productId }),
    setQuantity: (productId, quantity) =>
      dispatch({ type: "setQuantity", productId, quantity }),
    clearCart: () => dispatch({ type: "clear" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}