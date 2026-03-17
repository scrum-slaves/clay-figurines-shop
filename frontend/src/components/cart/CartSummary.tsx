import { Link } from "react-router-dom";

import { formatCurrency } from "../../utils/currency";

type CartSummaryProps = {
  totalItems: number;
  totalPrice: number;
  actionLabel: string;
  actionTo: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
};

export function CartSummary({
  totalItems,
  totalPrice,
  actionLabel,
  actionTo,
  secondaryAction,
}: CartSummaryProps) {
  return (
    <aside className="sticky top-6 rounded-[30px] border border-[var(--line)] bg-white p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Итог</p>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Итог заказа</h2>
        </div>
        <div className="space-y-3 border-y border-[var(--line)] py-5">
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
            <span>Количество</span>
            <span className="font-semibold text-[var(--text-primary)]">{totalItems}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
            <span>Итого</span>
            <span className="text-xl font-semibold text-[var(--text-primary)]">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Link
            className="inline-flex w-full items-center justify-center rounded-full border border-[var(--text-primary)] bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--panel-bg)] transition-colors hover:bg-[#34302b]"
            to={actionTo}
          >
            {actionLabel}
          </Link>
          {secondaryAction ? (
            <button
              className="inline-flex w-full items-center justify-center rounded-full border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
              onClick={secondaryAction.onClick}
              type="button"
            >
              {secondaryAction.label}
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
