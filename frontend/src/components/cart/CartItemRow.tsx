import { Link } from "react-router-dom";

import { CartItem } from "../../types/models";
import { formatCurrency } from "../../utils/currency";
import { QuantitySelector } from "../product/QuantitySelector";
import { ImageWithFallback } from "../ui/ImageWithFallback";

type CartItemRowProps = {
  item: CartItem;
  onUpdateQty: (productId: CartItem["productId"], qty: number) => void;
  onRemove: (productId: CartItem["productId"]) => void;
};

export function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  const title = item.product?.title ?? `Товар #${item.productId}`;
  const image = item.product?.image ?? "";
  const lineTotal = (item.product?.price ?? 0) * item.qty;

  return (
    <article
      className="grid gap-5 rounded-[30px] border border-[var(--line)] bg-white p-5 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[140px_minmax(0,1fr)_220px]"
      data-product-id={String(item.productId)}
      data-testid="cart-item-row"
    >
      <div className="overflow-hidden rounded-[24px] bg-[var(--surface-secondary)]">
        <div className="aspect-square">
          <ImageWithFallback alt={title} className="h-full w-full object-cover" src={image} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {item.product?.collection || item.product?.type || `ID ${item.productId}`}
          </p>
          <Link
            className="block text-xl font-semibold text-[var(--text-primary)] transition-opacity hover:opacity-75"
            to={`/products/${item.productId}`}
          >
            {title}
          </Link>
          <p className="text-sm text-[var(--text-muted)]">
            {item.product
              ? item.product.inStock
                ? "В наличии"
                : "Сейчас нет в наличии"
              : "Детали товара загружаются или недоступны."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <QuantitySelector onChange={(qty) => onUpdateQty(item.productId, qty)} value={item.qty} />
          <button
            className="text-sm font-semibold text-[var(--text-primary)] transition-opacity hover:opacity-65"
            onClick={() => onRemove(item.productId)}
            type="button"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 lg:items-end">
        <p className="text-sm text-[var(--text-muted)]">Цена за штуку: {formatCurrency(item.product?.price ?? 0)}</p>
        <p className="text-2xl font-semibold text-[var(--text-primary)]">{formatCurrency(lineTotal)}</p>
      </div>
    </article>
  );
}
