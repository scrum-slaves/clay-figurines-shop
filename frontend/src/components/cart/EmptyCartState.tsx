import { Link } from "react-router-dom";

import { StatusCard } from "../ui/StatusCard";

type EmptyCartStateProps = {
  title?: string;
  description?: string;
};

export function EmptyCartState({
  title = "Корзина пока пуста.",
  description = "Добавьте фигурки из каталога, чтобы перейти к оформлению.",
}: EmptyCartStateProps) {
  return (
    <StatusCard
      action={
        <Link
          className="inline-flex items-center justify-center rounded-full border border-[var(--text-primary)] bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--panel-bg)] transition-colors hover:bg-[#34302b]"
          to="/products"
        >
          Вернуться в каталог
        </Link>
      }
      description={description}
      title={title}
    />
  );
}
