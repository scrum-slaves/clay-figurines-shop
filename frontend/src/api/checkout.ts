import { adaptValidateCartResponse } from "./adapters";
import { ApiError, requestJson } from "./client";
import { ApiValidateCartResponseDto } from "./types";
import { CartItem, ValidateCartResult } from "../types/models";

const validateCartPaths = ["/checkout/validate-cart/", "/products/checkout/"];

export async function validateCart(items: CartItem[]): Promise<ValidateCartResult> {
  const payload = {
    items: items.map((item) => ({
      product_id: Number(item.productId),
      qty: item.qty,
    })),
  };

  let lastError: unknown = null;

  for (const path of validateCartPaths) {
    try {
      const response = await requestJson<ApiValidateCartResponseDto>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return adaptValidateCartResponse(response, items);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("Не удалось проверить корзину.");
}
