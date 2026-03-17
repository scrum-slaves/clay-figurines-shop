import { useSearchParams } from "react-router-dom";

import { ProductsFilters } from "../types/models";
import {
  createProductsSearchParams,
  defaultProductsFilters,
  getProductsFiltersFromSearchParams,
} from "../utils/queryParams";

function toggleValue(values: string[], nextValue: string): string[] {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export function useProductsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = getProductsFiltersFromSearchParams(searchParams);

  function updateFilters(nextFilters: ProductsFilters) {
    setSearchParams(createProductsSearchParams(nextFilters), { replace: true });
  }

  function patchFilters(patch: Partial<ProductsFilters>) {
    updateFilters({
      ...filters,
      ...patch,
    });
  }

  return {
    filters,
    toggleType(typeId: string) {
      patchFilters({
        types: toggleValue(filters.types, typeId),
      });
    },
    toggleCollection(collectionId: string) {
      patchFilters({
        collections: toggleValue(filters.collections, collectionId),
      });
    },
    setMinPrice(value: string) {
      patchFilters({ minPrice: value });
    },
    setMaxPrice(value: string) {
      patchFilters({ maxPrice: value });
    },
    setAvailability(value: ProductsFilters["availability"]) {
      patchFilters({ availability: value });
    },
    resetFilters() {
      updateFilters(defaultProductsFilters);
    },
  };
}
