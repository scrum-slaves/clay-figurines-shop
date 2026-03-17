import { useEffect, useState } from "react";

import { getCollections, getProducts, getTypes } from "../api/products";
import { FiltersSidebar } from "../components/filters/FiltersSidebar";
import { PageContainer } from "../components/layout/PageContainer";
import { ProductsGrid } from "../components/product/ProductsGrid";
import { useCart } from "../hooks/useCart";
import { useProductsFilters } from "../hooks/useProductsFilters";
import { ProductListItem, ProductOption } from "../types/models";

export function ProductsPage() {
  const { addToCart, registerProducts } = useCart();
  const { filters, toggleType, toggleCollection, setAvailability, setMinPrice, setMaxPrice, resetFilters } =
    useProductsFilters();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [types, setTypes] = useState<ProductOption[]>([]);
  const [collections, setCollections] = useState<ProductOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [filtersError, setFiltersError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFilterOptions() {
      const [typesResult, collectionsResult] = await Promise.allSettled([getTypes(), getCollections()]);

      if (!isMounted) {
        return;
      }

      if (typesResult.status === "fulfilled") {
        setTypes(typesResult.value);
      } else {
        setFiltersError("Не удалось загрузить типы товаров. Часть фильтров может быть недоступна.");
      }

      if (collectionsResult.status === "fulfilled") {
        setCollections(collectionsResult.value);
      } else {
        setFiltersError("Не удалось загрузить коллекции. Часть фильтров может быть недоступна.");
      }
    }

    loadFilterOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoadingProducts(true);
      setProductsError(null);

      try {
        const nextProducts = await getProducts({
          types: filters.types,
          collections: filters.collections,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          availability: filters.availability,
        });

        if (!isMounted) {
          return;
        }

        setProducts(nextProducts);
        registerProducts(nextProducts);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProducts([]);
        setProductsError(error instanceof Error ? error.message : "Неизвестная ошибка загрузки каталога.");
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [filters.types.join(","), filters.collections.join(","), filters.minPrice, filters.maxPrice, filters.availability]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  function handleAddToCart(product: ProductListItem) {
    addToCart(product, 1);
    setNotice(`«${product.title}» добавлен в корзину.`);
  }

  return (
    <PageContainer
      description="Фигурки на любой вкус: выбирайте сердцем, фильтруйте как мастер."
      eyebrow="Каталог"
      title="ГЛИНЯНЫЕ ФИГУРКИ"
    >
      {notice ? (
        <div className="rounded-[24px] border border-[#b8d5c4] bg-[#f0fbf4] px-5 py-4 text-sm font-medium text-[#21573a]">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <FiltersSidebar
          collections={collections}
          filters={filters}
          filtersError={filtersError}
          onAvailabilityChange={setAvailability}
          onMaxPriceChange={setMaxPrice}
          onMinPriceChange={setMinPrice}
          onReset={resetFilters}
          onToggleCollection={toggleCollection}
          onToggleType={toggleType}
          types={types}
        />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[var(--line)] bg-white px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Каталог товаров
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {isLoadingProducts ? "Загружаем товары..." : `Найдено товаров: ${products.length}`}
              </p>
            </div>
            <button
              className="text-sm font-semibold text-[var(--text-primary)] transition-opacity hover:opacity-70"
              onClick={resetFilters}
              type="button"
            >
              Очистить фильтры
            </button>
          </div>

          <ProductsGrid
            error={productsError}
            isLoading={isLoadingProducts}
            onAddToCart={handleAddToCart}
            products={products}
          />
        </div>
      </div>
    </PageContainer>
  );
}
