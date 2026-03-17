import { Link } from "react-router-dom";

import { ProductListItem } from "../../types/models";
import { formatCurrency } from "../../utils/currency";
import { Button } from "../ui/Button";
import { ImageWithFallback } from "../ui/ImageWithFallback";

type ProductCardProps = {
  product: ProductListItem;
  onAddToCart: (product: ProductListItem) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-[28px] border border-[var(--line)] bg-white p-4 transition-all hover:-translate-y-1 hover:border-[var(--line-strong)]">
      <Link className="block" to={`/products/${product.id}`}>
        <div className="aspect-[4/5] overflow-hidden rounded-[22px] bg-[var(--surface-secondary)]">
          <ImageWithFallback
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            src={product.image}
          />
        </div>
      </Link>
      <div className="mt-4 flex flex-1 flex-col justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {product.collection || product.type || "Авторская работа"}
              </p>
              <Link
                className="block text-lg font-semibold leading-snug text-[var(--text-primary)] transition-opacity hover:opacity-75"
                to={`/products/${product.id}`}
              >
                {product.title}
              </Link>
            </div>
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                product.inStock
                  ? "border-[#bfd7ca] bg-[#f1fbf5] text-[#245d3e]"
                  : "border-[#dec7c0] bg-[#fff3f1] text-[#8a4032]"
              }`}
            >
              {product.inStock ? "В наличии" : "Нет в наличии"}
            </span>
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(product.price)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="flex-1" disabled={!product.inStock} onClick={() => onAddToCart(product)}>
            В корзину
          </Button>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
            to={`/products/${product.id}`}
          >
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}
