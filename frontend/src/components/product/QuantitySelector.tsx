type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
}: QuantitySelectorProps) {
  function setNextValue(nextValue: number) {
    onChange(Math.max(min, Math.floor(nextValue)));
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[var(--line-strong)] bg-white">
      <button
        className="h-12 w-12 text-lg transition-colors hover:bg-[var(--surface-secondary)]"
        onClick={() => setNextValue(value - 1)}
        type="button"
      >
        −
      </button>
      <input
        className="w-14 border-x border-[var(--line)] bg-transparent text-center text-sm font-semibold outline-none"
        min={min}
        onChange={(event) => setNextValue(Number(event.target.value || min))}
        type="number"
        value={value}
      />
      <button
        className="h-12 w-12 text-lg transition-colors hover:bg-[var(--surface-secondary)]"
        onClick={() => setNextValue(value + 1)}
        type="button"
      >
        +
      </button>
    </div>
  );
}
