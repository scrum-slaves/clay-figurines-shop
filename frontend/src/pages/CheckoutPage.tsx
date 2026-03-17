import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { validateCart } from "../api/checkout";
import { getProductsByIds } from "../api/products";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { StatusCard } from "../components/ui/StatusCard";
import { useCart } from "../hooks/useCart";
import { CheckoutFormValues, ValidateCartProblem } from "../types/models";
import { formatCurrency } from "../utils/currency";
import { buildTelegramDeepLink, buildTelegramOrderMessage } from "../utils/telegram";

const initialFormValues: CheckoutFormValues = {
  customerName: "",
  phone: "",
  address: "",
};

function formatProblem(problem: ValidateCartProblem): string {
  if (problem.reason === "not_enough_stock") {
    return `Товара с id=${problem.productId} недостаточно на складе. Доступно: ${problem.available ?? 0} шт.`;
  }

  return `Товар с id=${problem.productId} удалён или больше не активен.`;
}

export function CheckoutPage() {
  const { items, registerProducts, getTotalCount, getTotalPrice } = useCart();
  const masterUsername = import.meta.env.VITE_MASTER_USERNAME as string | undefined;

  const [formValues, setFormValues] = useState(initialFormValues);
  const [problems, setProblems] = useState<ValidateCartProblem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hydrationMessage, setHydrationMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateMissingProducts() {
      const missingIds = items.filter((item) => !item.product).map((item) => item.productId);

      if (missingIds.length === 0) {
        return;
      }

      const { products, missingIds: unavailableIds } = await getProductsByIds(missingIds);

      if (!isMounted) {
        return;
      }

      if (products.length > 0) {
        registerProducts(products);
      }

      setHydrationMessage(
        unavailableIds.length > 0
          ? "Часть товаров не удалось полностью загрузить. Сообщение в Telegram всё равно сформируется, но без полного описания."
          : null
      );
    }

    hydrateMissingProducts();

    return () => {
      isMounted = false;
    };
  }, [items.map((item) => `${item.productId}:${item.qty}:${item.product ? "1" : "0"}`).join("|")]);

  function updateField<K extends keyof CheckoutFormValues>(field: K, value: CheckoutFormValues[K]) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setProblems([]);

    if (items.length === 0) {
      setError("Корзина пуста. Добавьте товары перед оформлением.");
      return;
    }

    if (!masterUsername?.trim()) {
      setError("VITE_MASTER_USERNAME не задан. Невозможно открыть Telegram deep link.");
      return;
    }

    setIsSubmitting(true);

    try {
      const validationResult = await validateCart(items);

      if (!validationResult.ok) {
        setProblems(validationResult.problems);
        return;
      }

      const totalPrice = getTotalPrice();
      const message = buildTelegramOrderMessage(items, formValues, totalPrice);
      const deepLink = buildTelegramDeepLink(masterUsername, message);

      if (!deepLink) {
        setError("Не удалось сформировать ссылку Telegram.");
        return;
      }

      const popup = window.open(deepLink, "_blank", "noopener,noreferrer");

      if (!popup) {
        window.location.href = deepLink;
      }
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : "Не удалось оформить заказ.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer
      actions={
        <Link
          className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-white"
          to="/cart"
        >
          Назад в корзину
        </Link>
      }
      description="Почти готово — осталось только оставить адрес, и мы шепнём мастеру в Telegram."
      title="ОФОРМЛЕНИЕ"
    >
      {items.length === 0 ? (
        <StatusCard
          action={
            <Link
              className="inline-flex items-center justify-center rounded-full border border-[var(--text-primary)] bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--panel-bg)] transition-colors hover:bg-[#34302b]"
              to="/products"
            >
              Перейти в каталог
            </Link>
          }
          description="В checkout можно перейти только с наполненной корзиной."
          title="Оформлять пока нечего."
        />
      ) : null}

      {items.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            {!masterUsername?.trim() ? (
              <StatusCard
                description="Добавьте VITE_MASTER_USERNAME в env frontend, чтобы кнопка открытия Telegram заработала."
                title="Telegram username не настроен."
                tone="error"
              />
            ) : null}

            {hydrationMessage ? (
              <StatusCard description={hydrationMessage} title="Часть данных заказа неполная." tone="warning" />
            ) : null}

            {error ? <StatusCard description={error} title="Не удалось оформить заказ." tone="error" /> : null}

            {problems.length > 0 ? (
              <div className="rounded-[30px] border border-[#d7b3ae] bg-[#fff1ef] px-6 py-6 text-[#7b2d21]">
                <h2 className="text-lg font-semibold">Есть проблемы с доступностью товаров</h2>
                <ul className="mt-4 space-y-2 text-sm leading-6">
                  {problems.map((problem) => (
                    <li key={`${problem.productId}-${problem.reason}`}>{formatProblem(problem)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <form className="rounded-[30px] border border-[var(--line)] bg-white p-6 lg:p-8" onSubmit={handleSubmit}>
              <div className="grid gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Контакты
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Контакты и доставка</h2>
                </div>

                <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                  Имя и фамилия
                  <input
                    className="w-full rounded-[22px] border border-[var(--line)] bg-[var(--surface-primary)] px-4 py-3 outline-none transition-colors focus:border-[var(--line-strong)]"
                    onChange={(event) => updateField("customerName", event.target.value)}
                    placeholder="Например, Мария Смирнова"
                    required
                    type="text"
                    value={formValues.customerName}
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                  Телефон
                  <input
                    className="w-full rounded-[22px] border border-[var(--line)] bg-[var(--surface-primary)] px-4 py-3 outline-none transition-colors focus:border-[var(--line-strong)]"
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="+7 999 123-45-67"
                    required
                    type="tel"
                    value={formValues.phone}
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                  Адрес доставки
                  <textarea
                    className="min-h-28 w-full rounded-[22px] border border-[var(--line)] bg-[var(--surface-primary)] px-4 py-3 outline-none transition-colors focus:border-[var(--line-strong)]"
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="Город, улица, дом, квартира, ориентир"
                    required
                    value={formValues.address}
                  />
                </label>

                <Button disabled={isSubmitting || !masterUsername?.trim()} fullWidth type="submit">
                  {isSubmitting ? "Проверяем корзину..." : "Оформить через Telegram"}
                </Button>
              </div>
            </form>
          </div>

          <aside className="h-fit rounded-[30px] border border-[var(--line)] bg-white p-6">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Заказ</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Состав заказа</h2>
              </div>

              <div className="space-y-4 border-y border-[var(--line)] py-5">
                {items.map((item) => (
                  <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4" key={`${item.productId}`}>
                    <div className="overflow-hidden rounded-[18px] bg-[var(--surface-secondary)]">
                      <div className="aspect-square">
                        <ImageWithFallback
                          alt={item.product?.title ?? `Товар ${item.productId}`}
                          className="h-full w-full object-cover"
                          src={item.product?.image}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {item.product?.title ?? `Товар #${item.productId}`}
                      </p>
                      <div className="flex items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
                        <span>{item.qty} шт.</span>
                        <span>{formatCurrency((item.product?.price ?? 0) * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                  <span>Товаров в заказе</span>
                  <span className="font-semibold text-[var(--text-primary)]">{getTotalCount()}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                  <span>Итого</span>
                  <span className="text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </PageContainer>
  );
}
