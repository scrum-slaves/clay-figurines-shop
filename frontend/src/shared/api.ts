import {
  CartItem,
  ProductCardDto,
  ProductDetailDto,
  ProductTypeDto,
  ValidateCartResponseDto,
} from "./types";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000/api/v1";


type FetchJsonOptions = RequestInit;


async function fetchJson<T>(path: string, options: FetchJsonOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // Ignore JSON parse errors for non-JSON responses.
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
}


export async function getTypes(): Promise<ProductTypeDto[]> {
  return fetchJson<ProductTypeDto[]>("/types/");
}


export async function getProducts(params: { typeIds?: number[] } = {}): Promise<ProductCardDto[]> {
  const query = new URLSearchParams();
  (params.typeIds ?? []).forEach((typeId) => query.append("type", String(typeId)));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return fetchJson<ProductCardDto[]>(`/products/${suffix}`);
}


export async function getProduct(id: number): Promise<ProductDetailDto> {
  return fetchJson<ProductDetailDto>(`/products/${id}/`);
}


export async function validateCart(items: CartItem[]): Promise<ValidateCartResponseDto> {
  return fetchJson<ValidateCartResponseDto>("/checkout/validate-cart/", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({
        product_id: item.productId,
        qty: item.qty,
      })),
    }),
  });
}


export { fetchJson };
