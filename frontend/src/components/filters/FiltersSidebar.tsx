import { ProductOption, ProductsFilters } from "../../types/models";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { CollectionFilter } from "./CollectionFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { TypeFilter } from "./TypeFilter";

type FiltersSidebarProps = {
  types: ProductOption[];
  collections: ProductOption[];
  filters: ProductsFilters;
  filtersError?: string | null;
  onToggleType: (value: string) => void;
  onToggleCollection: (value: string) => void;
  onAvailabilityChange: (value: "all" | "in_stock") => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onReset: () => void;
};

function getActiveFiltersCount(filters: ProductsFilters): number {
  return (
    filters.types.length +
    filters.collections.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.availability === "in_stock" ? 1 : 0)
  );
}

export function FiltersSidebar({
  types,
  collections,
  filters,
  filtersError,
  onToggleType,
  onToggleCollection,
  onAvailabilityChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}: FiltersSidebarProps) {
  const activeFiltersCount = getActiveFiltersCount(filters);

  return (
    <aside className="h-fit rounded-[30px] border border-[var(--line)] bg-white p-6">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Фильтры</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Подбор товаров</h2>
        </div>
        {activeFiltersCount > 0 ? (
          <button
            className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)] transition-opacity hover:opacity-70"
            onClick={onReset}
            type="button"
          >
            Сбросить
          </button>
        ) : null}
      </div>
      {filtersError ? (
        <p className="mb-5 rounded-2xl border border-[#dfcfb1] bg-[#fff8ea] px-4 py-3 text-sm text-[#7f5c1e]">
          {filtersError}
        </p>
      ) : null}
      <div className="space-y-6">
        <AvailabilityFilter onChange={onAvailabilityChange} value={filters.availability} />
        <div className="border-t border-[var(--line)] pt-6">
          <TypeFilter
            onToggle={onToggleType}
            options={types}
            selectedValues={filters.types}
            title="Тип товара"
          />
        </div>
        <div className="border-t border-[var(--line)] pt-6">
          <CollectionFilter
            onToggle={onToggleCollection}
            options={collections}
            selectedValues={filters.collections}
          />
        </div>
        <div className="border-t border-[var(--line)] pt-6">
          <PriceRangeFilter
            maxPrice={filters.maxPrice}
            minPrice={filters.minPrice}
            onMaxPriceChange={onMaxPriceChange}
            onMinPriceChange={onMinPriceChange}
          />
        </div>
      </div>
    </aside>
  );
}
