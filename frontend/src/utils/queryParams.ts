import { ProductsFilters } from "../types/models";

export const defaultProductsFilters: ProductsFilters = {
  types: [],
  collections: [],
  minPrice: "",
  maxPrice: "",
  availability: "all",
};

function getNonEmptyValues(searchParams: URLSearchParams, key: string): string[] {
  return searchParams.getAll(key).map((value) => value.trim()).filter(Boolean);
}

export function getProductsFiltersFromSearchParams(
  searchParams: URLSearchParams
): ProductsFilters {
  const availability = searchParams.get("availability");

  return {
    types: getNonEmptyValues(searchParams, "type"),
    collections: getNonEmptyValues(searchParams, "collection"),
    minPrice: searchParams.get("min_price")?.trim() ?? "",
    maxPrice: searchParams.get("max_price")?.trim() ?? "",
    availability: availability === "in_stock" ? "in_stock" : "all",
  };
}

export function createProductsSearchParams(filters: ProductsFilters): URLSearchParams {
  const searchParams = new URLSearchParams();

  filters.types.forEach((value) => searchParams.append("type", value));
  filters.collections.forEach((value) => searchParams.append("collection", value));

  if (filters.minPrice.trim()) {
    searchParams.set("min_price", filters.minPrice.trim());
  }

  if (filters.maxPrice.trim()) {
    searchParams.set("max_price", filters.maxPrice.trim());
  }

  if (filters.availability === "in_stock") {
    searchParams.set("availability", "in_stock");
  }

  return searchParams;
}
