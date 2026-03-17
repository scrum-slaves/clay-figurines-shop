import { ProductListItem } from "../../types/models";
import { LoadingBlock } from "../ui/LoadingBlock";
import { StatusCard } from "../ui/StatusCard";
import { ProductCard } from "./ProductCard";

type ProductsGridProps = {
  products: ProductListItem[];
  isLoading: boolean;
  error?: string | null;
  onAddToCart: (product: ProductListItem) => void;
};

export function ProductsGrid({
  products,
  isLoading,
  error,
  onAddToCart,
}: ProductsGridProps) {
  if (error) {
    return (
      <StatusCard
        description={error}
        title="Не удалось загрузить товары."
        tone="error"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="rounded-[28px] border border-[var(--line)] bg-white p-4" key={index}>
            <LoadingBlock className="aspect-[4/5]" />
            <LoadingBlock className="mt-4 h-4 w-24" />
            <LoadingBlock className="mt-3 h-8 w-full" />
            <LoadingBlock className="mt-6 h-12 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <StatusCard
        description="Попробуйте снять часть фильтров или расширить диапазон цены."
        title="По выбранным условиям ничего не найдено."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
      ))}
    </div>
  );
}
