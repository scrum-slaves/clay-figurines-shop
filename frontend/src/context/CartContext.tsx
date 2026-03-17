import { ReactNode, createContext, useContext, useState } from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { CartItem, CartStorage, ProductDetails, ProductId, ProductListItem } from "../types/models";

const CART_STORAGE_KEY = "clay-shop-cart";

type CartProduct = ProductListItem | ProductDetails;

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: CartProduct, qty?: number) => void;
  removeFromCart: (productId: ProductId) => void;
  updateQty: (productId: ProductId, qty: number) => void;
  clearCart: () => void;
  registerProducts: (products: CartProduct[]) => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeProductId(value: unknown): ProductId | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();
    return normalizedValue ? normalizedValue : null;
  }

  return null;
}

function sanitizeCartStorage(value: unknown): CartStorage {
  if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items)) {
    return { items: [] };
  }

  return {
    items: value.items
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const productId = normalizeProductId(item.productId);
        const qty = Number(item.qty);

        if (productId === null || !Number.isInteger(qty) || qty < 1) {
          return null;
        }

        return {
          productId,
          qty,
        };
      })
      .filter((item): item is CartStorage["items"][number] => item !== null),
  };
}

function productKey(productId: ProductId): string {
  return String(productId);
}

function mergeCartItemsWithProducts(
  cartStorage: CartStorage,
  productsById: Record<string, CartProduct>
): CartItem[] {
  return cartStorage.items.map((item) => ({
    ...item,
    product: productsById[productKey(item.productId)],
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartStorage, setCartStorage] = useLocalStorage<CartStorage>(
    CART_STORAGE_KEY,
    { items: [] },
    sanitizeCartStorage
  );
  const [productsById, setProductsById] = useState<Record<string, CartProduct>>({});

  const items = mergeCartItemsWithProducts(cartStorage, productsById);

  function setItems(nextItems: CartStorage["items"]) {
    setCartStorage({
      items: sanitizeCartStorage({ items: nextItems }).items,
    });
  }

  function registerProducts(products: CartProduct[]) {
    setProductsById((currentProducts) => {
      const nextProducts = { ...currentProducts };

      products.forEach((product) => {
        nextProducts[productKey(product.id)] = product;
      });

      return nextProducts;
    });
  }

  function addToCart(product: CartProduct, qty = 1) {
    if (qty < 1) {
      return;
    }

    registerProducts([product]);

    const nextItems = [...cartStorage.items];
    const existingItem = nextItems.find((item) => productKey(item.productId) === productKey(product.id));

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      nextItems.push({
        productId: product.id,
        qty,
      });
    }

    setItems(nextItems);
  }

  function removeFromCart(productId: ProductId) {
    setItems(cartStorage.items.filter((item) => productKey(item.productId) !== productKey(productId)));
  }

  function updateQty(productId: ProductId, qty: number) {
    const nextQty = Math.max(1, Math.floor(qty));

    setItems(
      cartStorage.items.map((item) =>
        productKey(item.productId) === productKey(productId)
          ? {
              ...item,
              qty: nextQty,
            }
          : item
      )
    );
  }

  function clearCart() {
    setCartStorage({ items: [] });
    setProductsById({});
  }

  function getTotalCount() {
    return cartStorage.items.reduce((total, item) => total + item.qty, 0);
  }

  function getTotalPrice() {
    return items.reduce((total, item) => total + (item.product?.price ?? 0) * item.qty, 0);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        registerProducts,
        getTotalCount,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart должен использоваться внутри CartProvider.");
  }

  return context;
}
