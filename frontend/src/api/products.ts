import { adaptOption, adaptProductDetails, adaptProductListItem } from "./adapters";
import { ApiError, requestJson } from "./client";
import { ApiOptionDto, ApiProductDetailsDto, ApiProductListItemDto } from "./types";
import { ProductDetails, ProductId, ProductListItem, ProductOption } from "../types/models";

type GetProductsParams = {
  types?: Array<string | number>;
  collections?: Array<string | number>;
  minPrice?: string | number;
  maxPrice?: string | number;
  availability?: "all" | "in_stock";
};

function appendMany(searchParams: URLSearchParams, key: string, values: Array<string | number>) {
  values.forEach((value) => {
    const normalizedValue = `${value}`.trim();
    if (normalizedValue) {
      searchParams.append(key, normalizedValue);
    }
  });
}

export async function getProducts(params: GetProductsParams = {}): Promise<ProductListItem[]> {
  const searchParams = new URLSearchParams();

  appendMany(searchParams, "type", params.types ?? []);
  appendMany(searchParams, "collection", params.collections ?? []);

  if (`${params.minPrice ?? ""}`.trim()) {
    searchParams.set("min_price", `${params.minPrice}`.trim());
  }

  if (`${params.maxPrice ?? ""}`.trim()) {
    searchParams.set("max_price", `${params.maxPrice}`.trim());
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const data = await requestJson<ApiProductListItemDto[]>(`/products/${suffix}`);
  const products = data.map(adaptProductListItem);

  return params.availability === "in_stock"
    ? products.filter((product) => product.inStock)
    : products;
}

export async function getProductById(id: ProductId): Promise<ProductDetails> {
  const data = await requestJson<ApiProductDetailsDto>(`/products/${id}/`);
  return adaptProductDetails(data);
}

export async function getProductsByIds(
  ids: ProductId[]
): Promise<{ products: ProductDetails[]; missingIds: ProductId[] }> {
  const uniqueIds = [...new Map(ids.map((id) => [String(id), id])).values()];
  const results = await Promise.allSettled(uniqueIds.map((id) => getProductById(id)));

  const products: ProductDetails[] = [];
  const missingIds: ProductId[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      products.push(result.value);
      return;
    }

    missingIds.push(uniqueIds[index]);
  });

  return { products, missingIds };
}

export async function getTypes(): Promise<ProductOption[]> {
  const data = await requestJson<ApiOptionDto[]>("/products/types/");
  return data.map(adaptOption);
}

export async function getCollections(): Promise<ProductOption[]> {
  try {
    const data = await requestJson<ApiOptionDto[]>("/products/collections/");
    return data.map(adaptOption);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 501)) {
      return [];
    }

    throw error;
  }
}
