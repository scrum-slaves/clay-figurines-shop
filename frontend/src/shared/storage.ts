import { CartState } from "./types";


const STORAGE_KEY = "clay_shop_cart";


export function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { items: [] };
    }

    const parsed = JSON.parse(raw) as Partial<CartState>;
    if (!Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return {
      items: parsed.items
        .map((item) => ({
          productId: Number(item.productId),
          qty: Number(item.qty),
        }))
        .filter((item) => Number.isInteger(item.productId) && item.productId > 0)
        .filter((item) => Number.isInteger(item.qty) && item.qty > 0),
    };
  } catch {
    return { items: [] };
  }
}


export function saveCart(cart: CartState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
