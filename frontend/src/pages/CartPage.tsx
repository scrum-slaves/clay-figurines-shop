import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getProduct } from "../shared/api";
import { loadCart, saveCart } from "../shared/storage";
import { CartState, ProductDetailDto } from "../shared/types";
import { PageContainer } from "../shared/ui/PageContainer";


function formatPrice(value: number): string {
  return `${value.toFixed(2)} ₽`;
}


function parsePrice(price: string): number {
  const value = Number.parseFloat(price);
  return Number.isNaN(value) ? 0 : value;
}


export function CartPage() {
  const [cart, setCart] = useState<CartState>(() => loadCart());
  const [productsById, setProductsById] = useState<Record<number, ProductDetailDto | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      const map: Record<number, ProductDetailDto | null> = {};
      for (const item of cart.items) {
        try {
          map[item.productId] = await getProduct(item.productId);
        } catch {
          map[item.productId] = null;
        }
      }

      if (active) {
        setProductsById(map);
        setLoading(false);
      }
    }

    if (cart.items.length === 0) {
      setProductsById({});
      return;
    }

    loadDetails();
    return () => {
      active = false;
    };
  }, [cart]);

  const total = useMemo(() => {
    return cart.items.reduce((sum, item) => {
      const product = productsById[item.productId];
      if (!product) {
        return sum;
      }
      return sum + parsePrice(product.price) * item.qty;
    }, 0);
  }, [cart.items, productsById]);

  function syncCart(nextCart: CartState): void {
    setCart(nextCart);
    saveCart(nextCart);
  }

  function updateQty(productId: number, qty: number): void {
    if (qty < 1) {
      return;
    }

    const nextCart: CartState = {
      items: cart.items.map((item) =>
        item.productId === productId ? { ...item, qty } : item
      ),
    };
    syncCart(nextCart);
  }

  function removeItem(productId: number): void {
    const nextCart: CartState = {
      items: cart.items.filter((item) => item.productId !== productId),
    };
    syncCart(nextCart);
  }

  return (
    <PageContainer title="Корзина" subtitle="Измените количество или удалите позиции">
      {cart.items.length === 0 ? (
        <div className="rounded border border-stone-300 bg-white p-4">
          <p className="mb-3 text-sm text-stone-600">Корзина пуста.</p>
          <Link className="rounded border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100" to="/">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? <p className="text-sm text-stone-600">Загрузка товаров...</p> : null}

          {cart.items.map((item) => {
            const product = productsById[item.productId];
            const lineTotal = product ? parsePrice(product.price) * item.qty : 0;
            return (
              <article className="rounded border border-stone-300 bg-white p-4" key={item.productId}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {product?.name ?? `Товар #${item.productId} (не найден)`}
                    </p>
                    <p className="text-sm text-stone-600">Сумма: {formatPrice(lineTotal)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="rounded border border-stone-300 px-2 py-1"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      type="button"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.qty}</span>
                    <button
                      className="rounded border border-stone-300 px-2 py-1"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      type="button"
                    >
                      +
                    </button>
                    <button
                      className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                      onClick={() => removeItem(item.productId)}
                      type="button"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="flex flex-wrap items-center justify-between rounded border border-stone-300 bg-white p-4">
            <p className="text-lg font-semibold">Итого: {formatPrice(total)}</p>
            <Link className="rounded bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700" to="/checkout">
              Перейти к оформлению
            </Link>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
