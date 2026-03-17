type AvailabilityFilterProps = {
  value: "all" | "in_stock";
  onChange: (value: "all" | "in_stock") => void;
};

export function AvailabilityFilter({ value, onChange }: AvailabilityFilterProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
        Наличие
      </h3>
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text-primary)]">
          <input
            checked={value === "all"}
            className="h-4 w-4 accent-[var(--text-primary)]"
            name="availability"
            onChange={() => onChange("all")}
            type="radio"
          />
          <span>Все товары</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text-primary)]">
          <input
            checked={value === "in_stock"}
            className="h-4 w-4 accent-[var(--text-primary)]"
            name="availability"
            onChange={() => onChange("in_stock")}
            type="radio"
          />
          <span>Только в наличии</span>
        </label>
      </div>
    </section>
  );
}
