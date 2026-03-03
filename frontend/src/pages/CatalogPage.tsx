import { Link } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";

import { getProducts, getTypes } from "../shared/api";
import { loadCart, saveCart } from "../shared/storage";
import { ProductCardDto, ProductTypeDto } from "../shared/types";
import { PageContainer } from "../shared/ui/PageContainer";


function formatPrice(value: string): string {
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) {
    return value;
  }
  return `${amount.toFixed(2)} ₽`;
}


export function CatalogPage() {
  const [types, setTypes] = useState<ProductTypeDto[]>([]);
  const [products, setProducts] = useState<ProductCardDto[]>([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadTypeOptions() {
      try {
        const data = await getTypes();
        if (active) {
          setTypes(data);
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message);
        }
      }
    }

    loadTypeOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadProductList() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({ typeIds: selectedTypeIds });
        if (active) {
          setProducts(data);
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message);
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProductList();
    return () => {
      active = false;
    };
  }, [selectedTypeIds]);

  const selectedCount = useMemo(() => selectedTypeIds.length, [selectedTypeIds]);

  function toggleType(typeId: number): void {
    setSelectedTypeIds((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  }

  function addToCart(productId: number): void {
    const cart = loadCart();
    const existing = cart.items.find((item) => item.productId === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.items.push({ productId, qty: 1 });
    }
    saveCart(cart);
    setNotice("Товар добавлен в корзину.");
  }

  return (
    <PageContainer
      title="Каталог фигурок"
      subtitle="Выберите типы и добавьте товары в корзину"
    >
      {notice ? <p className="rounded bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{notice}</p> : null}
      <div className="rounded border border-stone-300 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-stone-700">Фильтр по типам</p>
        <div className="flex flex-wrap gap-3">
          {types.map((typeItem) => (
            <label className="flex items-center gap-2 text-sm" key={typeItem.id}>
              <input
                checked={selectedTypeIds.includes(typeItem.id)}
                onChange={() => toggleType(typeItem.id)}
                type="checkbox"
              />
              <span>{typeItem.name}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-500">Выбрано типов: {selectedCount}</p>
      </div>

      {loading ? <p className="text-sm text-stone-600">Загрузка...</p> : null}
      {error ? <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article className="rounded border border-stone-300 bg-white p-4" key={product.id}>
            <div className="mb-3 aspect-square overflow-hidden rounded bg-stone-200">
              {product.cover_url ? (
                <img alt={product.name} className="h-full w-full object-cover" src={product.cover_url} />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-stone-500">Без фото</div>
              )}
            </div>
            <h2 className="mb-1 text-base font-semibold">{product.name}</h2>
            <p className="mb-3 text-sm text-stone-700">{formatPrice(product.price)}</p>
            <div className="flex gap-2">
              <Link className="rounded border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100" to={`/product/${product.id}`}>
                Подробнее
              </Link>
              <button
                className="rounded bg-stone-900 px-3 py-1 text-sm text-white hover:bg-stone-700"
                onClick={() => addToCart(product.id)}
                type="button"
              >
                В корзину
              </button>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
