type PriceRangeFilterProps = {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
};

function normalizePriceInput(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: PriceRangeFilterProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
        Цена
      </h3>
      <div className="grid gap-3">
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          От
          <input
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-normal text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--line-strong)]"
            inputMode="numeric"
            onChange={(event) => onMinPriceChange(normalizePriceInput(event.target.value))}
            placeholder="0"
            type="text"
            value={minPrice}
          />
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          До
          <input
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-normal text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--line-strong)]"
            inputMode="numeric"
            onChange={(event) => onMaxPriceChange(normalizePriceInput(event.target.value))}
            placeholder="0"
            type="text"
            value={maxPrice}
          />
        </label>
      </div>
    </section>
  );
}
