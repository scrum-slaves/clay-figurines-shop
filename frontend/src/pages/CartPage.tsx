import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getProductsByIds } from "../api/products";
import { CartItemRow } from "../components/cart/CartItemRow";
import { CartSummary } from "../components/cart/CartSummary";
import { EmptyCartState } from "../components/cart/EmptyCartState";
import { PageContainer } from "../components/layout/PageContainer";
import { StatusCard } from "../components/ui/StatusCard";
import { useCart } from "../hooks/useCart";

export function CartPage() {
  const { items, updateQty, removeFromCart, clearCart, registerProducts, getTotalCount, getTotalPrice } = useCart();

  const [isHydrating, setIsHydrating] = useState(false);
  const [hydrationMessage, setHydrationMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function hydrateMissingProducts() {
      const missingIds = items.filter((item) => !item.product).map((item) => item.productId);

      if (missingIds.length === 0) {
        return;
      }

      setIsHydrating(true);

      const { products, missingIds: unavailableIds } = await getProductsByIds(missingIds);

      if (!isMounted) {
        return;
      }

      if (products.length > 0) {
        registerProducts(products);
      }

      setHydrationMessage(
        unavailableIds.length > 0
          ? "Некоторые позиции не удалось загрузить. Их можно удалить из корзины или оставить для ручной проверки."
          : null
      );
      setIsHydrating(false);
    }

    hydrateMissingProducts();

    return () => {
      isMounted = false;
    };
  }, [items.map((item) => `${item.productId}:${item.qty}:${item.product ? "1" : "0"}`).join("|")]);

  return (
    <PageContainer
      actions={
        <Link
          className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-white"
          to="/products"
        >
          Продолжить покупки
        </Link>
      }
      description="Ваш маленький глиняный запас: проверьте что набрали и готовьтесь к встрече с красотой."
      eyebrow="Cart"
      title="КОРЗИНА"
    >
      {items.length === 0 ? <EmptyCartState /> : null}

      {items.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {isHydrating ? (
              <StatusCard
                description="Проверяем детали товаров, чтобы показать цену, наличие и изображения."
                title="Загружаем позиции корзины..."
              />
            ) : null}

            {hydrationMessage ? (
              <StatusCard description={hydrationMessage} title="Часть данных недоступна." tone="warning" />
            ) : null}

            {items.map((item) => (
              <CartItemRow
                item={item}
                key={`${item.productId}`}
                onRemove={removeFromCart}
                onUpdateQty={updateQty}
              />
            ))}
          </div>

          <CartSummary
            actionLabel="Продолжить оформление"
            actionTo="/checkout"
            secondaryAction={{
              label: "Очистить корзину",
              onClick: clearCart,
            }}
            totalItems={getTotalCount()}
            totalPrice={getTotalPrice()}
          />
        </div>
      ) : null}
    </PageContainer>
  );
}
