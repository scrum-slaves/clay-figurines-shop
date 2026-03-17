import { Link } from "react-router-dom";

import { ProductDetails } from "../../types/models";
import { formatCurrency } from "../../utils/currency";
import { AddToCartButton } from "./AddToCartButton";
import { QuantitySelector } from "./QuantitySelector";

type ProductInfoProps = {
  product: ProductDetails;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
};

export function ProductInfo({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
}: ProductInfoProps) {
  return (
    <div className="rounded-[30px] border border-[var(--line)] bg-white p-6 lg:p-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <Link
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] transition-opacity hover:opacity-70"
            to="/products"
          >
            <span>←</span>
            <span>Назад к каталогу</span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {[product.type, product.collection].filter(Boolean).join(" / ") || "Карточка товара"}
          </p>
          <h1 className="text-3xl font-semibold uppercase tracking-[0.05em] text-[var(--text-primary)] lg:text-4xl">
            {product.title}
          </h1>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{formatCurrency(product.price)}</p>
        </div>

        <div
          className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${
            product.inStock
              ? "border-[#bfd7ca] bg-[#f1fbf5] text-[#245d3e]"
              : "border-[#dec7c0] bg-[#fff3f1] text-[#8a4032]"
          }`}
        >
          {product.inStock ? "В наличии" : "Нет в наличии"}
        </div>

        <p className="text-sm leading-7 text-[var(--text-muted)]">
          {product.description || "Описание пока не заполнено. Перед оформлением можно уточнить детали в Telegram."}
        </p>

        {product.attributes && product.attributes.length > 0 ? (
          <div className="space-y-4 border-t border-[var(--line)] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
              Параметры
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {product.attributes.map((attribute) => (
                <div className="rounded-[22px] bg-[var(--surface-secondary)] px-4 py-4" key={attribute.label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {attribute.label}
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-[var(--text-primary)]">{attribute.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="space-y-4 border-t border-[var(--line)] pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <QuantitySelector onChange={onQuantityChange} value={quantity} />
            <div className="min-w-[220px] flex-1">
              <AddToCartButton disabled={!product.inStock} fullWidth onClick={onAddToCart} />
            </div>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
            to="/cart"
          >
            Перейти в корзину
          </Link>
        </div>
      </div>
    </div>
  );
}
