import { ProductOption } from "../../types/models";

type TypeFilterProps = {
  title: string;
  options: ProductOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  emptyText?: string;
};

export function TypeFilter({
  title,
  options,
  selectedValues,
  onToggle,
  emptyText = "Значения пока не настроены.",
}: TypeFilterProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">{title}</h3>
        <span className="text-xs text-[var(--text-muted)]">{selectedValues.length || "Все"}</span>
      </div>
      {options.length === 0 ? (
        <p className="text-sm leading-6 text-[var(--text-muted)]">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {options.map((option) => {
            const checked = selectedValues.includes(option.id);

            return (
              <label
                className="flex cursor-pointer items-center gap-3 text-sm leading-6 text-[var(--text-primary)]"
                data-testid={`type-filter-option-${option.id}`}
                key={option.id}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                    checked
                      ? "border-[var(--text-primary)] bg-[var(--text-primary)]"
                      : "border-[var(--line-strong)] bg-white"
                  }`}
                >
                  {checked ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--panel-bg)]" /> : null}
                </span>
                <input
                  checked={checked}
                  className="sr-only"
                  onChange={() => onToggle(option.id)}
                  type="checkbox"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
