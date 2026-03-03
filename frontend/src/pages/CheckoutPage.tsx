import { FormEvent, useMemo, useState } from "react";

import { getProduct, validateCart } from "../shared/api";
import { loadCart } from "../shared/storage";
import { ValidateCartProblemDto } from "../shared/types";
import { PageContainer } from "../shared/ui/PageContainer";


function parsePrice(price: string): number {
  const value = Number.parseFloat(price);
  return Number.isNaN(value) ? 0 : value;
}


export function CheckoutPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [problems, setProblems] = useState<ValidateCartProblemDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const masterUsername = import.meta.env.VITE_MASTER_USERNAME as string | undefined;

  const formattedProblems = useMemo(() => {
    return problems.map((problem) => {
      if (problem.reason === "not_enough_stock") {
        return `Товар #${problem.product_id}: недостаточно на складе (доступно ${problem.available ?? 0})`;
      }
      return `Товар #${problem.product_id}: удален или неактивен`;
    });
  }, [problems]);

  async function handleOpenTelegram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setProblems([]);

    if (!masterUsername) {
      setError("Не задан VITE_MASTER_USERNAME в env фронтенда.");
      return;
    }

    const cart = loadCart();
    if (cart.items.length === 0) {
      setError("Корзина пуста.");
      return;
    }

    setLoading(true);
    try {
      const validation = await validateCart(cart.items);
      if (!validation.ok) {
        setProblems(validation.problems);
        return;
      }

      const lines: string[] = [];
      let total = 0;

      for (const item of cart.items) {
        try {
          const product = await getProduct(item.productId);
          const lineSum = parsePrice(product.price) * item.qty;
          total += lineSum;
          lines.push(`- ${product.name} x${item.qty} = ${lineSum.toFixed(2)} ₽`);
        } catch {
          lines.push(`- Товар #${item.productId} x${item.qty}`);
        }
      }

      const message = [
        "Здравствуйте! Хочу заказать:",
        ...lines,
        `Итого: ${total.toFixed(2)} ₽`,
        `Контакты: ${name}, ${phone}`,
        `Комментарий: ${comment || "-"}`,
      ].join("\n");

      const encoded = encodeURIComponent(message);
      window.location.href = `https://t.me/${masterUsername}?text=${encoded}`;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="Оформление заказа" subtitle="Без регистрации, отправка в Telegram">
      {error ? <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {formattedProblems.length > 0 ? (
        <div className="rounded border border-red-300 bg-red-50 p-3">
          <p className="mb-2 text-sm font-semibold text-red-700">Проблемы с корзиной:</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
            {formattedProblems.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="space-y-3 rounded border border-stone-300 bg-white p-4" onSubmit={handleOpenTelegram}>
        <label className="block text-sm">
          Имя
          <input
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </label>

        <label className="block text-sm">
          Телефон
          <input
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            onChange={(event) => setPhone(event.target.value)}
            required
            type="tel"
            value={phone}
          />
        </label>

        <label className="block text-sm">
          Комментарий
          <textarea
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            value={comment}
          />
        </label>

        <button
          className="rounded bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
          disabled={loading}
          type="submit"
        >
          {loading ? "Проверка корзины..." : "Открыть Telegram"}
        </button>
      </form>
    </PageContainer>
  );
}
