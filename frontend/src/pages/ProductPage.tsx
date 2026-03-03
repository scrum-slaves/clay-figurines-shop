import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProduct } from "../shared/api";
import { loadCart, saveCart } from "../shared/storage";
import { ProductDetailDto } from "../shared/types";
import { PageContainer } from "../shared/ui/PageContainer";


function formatPrice(value: string): string {
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) {
    return value;
  }
  return `${amount.toFixed(2)} ₽`;
}


export function ProductPage() {
  const params = useParams();
  const productId = Number(params.id);

  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (!Number.isInteger(productId) || productId <= 0) {
        setError("Некорректный ID товара.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getProduct(productId);
        if (active) {
          setProduct(data);
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message);
          setProduct(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  function addToCart(): void {
    if (!product) {
      return;
    }

    const cart = loadCart();
    const existing = cart.items.find((item) => item.productId === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.items.push({ productId: product.id, qty: 1 });
    }
    saveCart(cart);
    setNotice("Товар добавлен в корзину.");
  }

  return (
    <PageContainer title="Карточка товара" subtitle="Фото, описание и характеристики">
      <Link className="inline-block rounded border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100" to="/">
        Назад в каталог
      </Link>

      {loading ? <p className="text-sm text-stone-600">Загрузка...</p> : null}
      {error ? <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="rounded bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{notice}</p> : null}

      {product ? (
        <article className="grid gap-4 rounded border border-stone-300 bg-white p-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded bg-stone-200">
              {product.cover_url ? (
                <img alt={product.name} className="h-full w-full object-cover" src={product.cover_url} />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-stone-500">Без фото</div>
              )}
            </div>
            {(product.image_urls ?? []).length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {(product.image_urls ?? []).map((url) => (
                  <img className="aspect-square rounded object-cover" key={url} src={url} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-lg font-bold">{formatPrice(product.price)}</p>
            <p className="text-sm text-stone-700">{product.description || "Описание пока не добавлено."}</p>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-stone-700">Характеристики</h3>
              <ul className="space-y-1 text-sm">
                {Object.entries(product.characteristics ?? {}).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="rounded bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700"
              onClick={addToCart}
              type="button"
            >
              В корзину
            </button>
          </div>
        </article>
      ) : null}
    </PageContainer>
  );
}
