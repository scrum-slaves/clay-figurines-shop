import {
  ApiEntityReference,
  ApiOptionDto,
  ApiProductDetailsDto,
  ApiProductListItemDto,
  ApiValidateCartResponseDto,
} from "./types";
import {
  CartItem,
  ProductAttribute,
  ProductDetails,
  ProductListItem,
  ProductOption,
  ValidateCartResult,
} from "../types/models";

function toTitle(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function toLabel(reference: ApiEntityReference): string | undefined {
  if (typeof reference === "string") {
    return reference.trim() || undefined;
  }

  if (typeof reference === "number") {
    return String(reference);
  }

  if (reference && typeof reference === "object") {
    return reference.name?.trim() || reference.title?.trim() || undefined;
  }

  return undefined;
}

function toBase64Image(base64Value: string | null | undefined): string {
  const normalizedValue = base64Value?.trim();
  if (!normalizedValue) {
    return "";
  }

  return `data:image/jpeg;base64,${normalizedValue}`;
}

function toImage(
  dto: Pick<ApiProductListItemDto, "image" | "photo_url" | "photo_base64">
): string {
  return dto.image?.trim() || dto.photo_url?.trim() || toBase64Image(dto.photo_base64);
}

function pushAttribute(
  attributes: ProductAttribute[],
  label: string,
  value: string | number | null | undefined
) {
  const normalizedValue = `${value ?? ""}`.trim();
  if (!normalizedValue) {
    return;
  }

  attributes.push({
    label,
    value: normalizedValue,
  });
}

function buildAttributes(dto: ApiProductDetailsDto): ProductAttribute[] {
  const attributes: ProductAttribute[] = [];

  (dto.attributes ?? []).forEach((attribute) => {
    const label = attribute.label?.trim();
    const value = `${attribute.value ?? ""}`.trim();

    if (!label || !value) {
      return;
    }

    attributes.push({ label, value });
  });

  Object.entries(dto.characteristics ?? {}).forEach(([label, value]) => {
    pushAttribute(attributes, label, value);
  });

  pushAttribute(attributes, "Размер", dto.size);
  pushAttribute(attributes, "Вес", dto.weight ? `${dto.weight} г` : dto.weight);
  pushAttribute(attributes, "Материал", dto.material);

  return attributes;
}

function buildImages(dto: ApiProductDetailsDto, primaryImage: string): string[] {
  const candidates = [...(dto.images ?? []), ...(dto.image_urls ?? []), primaryImage];
  const uniqueImages = new Set<string>();

  candidates.forEach((image) => {
    const normalizedImage = image?.trim();
    if (normalizedImage) {
      uniqueImages.add(normalizedImage);
    }
  });

  return [...uniqueImages];
}

export function adaptOption(dto: ApiOptionDto): ProductOption {
  return {
    id: String(dto.id),
    label: toTitle(dto.name ?? dto.title, `Опция #${dto.id}`),
  };
}

export function adaptProductListItem(dto: ApiProductListItemDto): ProductListItem {
  return {
    id: dto.id,
    title: toTitle(dto.title ?? dto.name, `Товар #${dto.id}`),
    price: toNumber(dto.price),
    image: toImage(dto),
    inStock: Boolean(dto.in_stock ?? dto.available ?? (dto.stock_qty ?? 0) > 0),
    type: toLabel(dto.type ?? dto.product_type),
    collection: toLabel(dto.collection),
  };
}

export function adaptProductDetails(dto: ApiProductDetailsDto): ProductDetails {
  const baseProduct = adaptProductListItem(dto);
  const attributes = buildAttributes(dto);

  return {
    ...baseProduct,
    description: dto.description?.trim() || "",
    images: buildImages(dto, baseProduct.image),
    attributes,
  };
}

export function adaptValidateCartResponse(
  dto: ApiValidateCartResponseDto,
  requestedItems: CartItem[]
): ValidateCartResult {
  const requestedQuantities = new Map<string, number>();

  requestedItems.forEach((item) => {
    const productKey = String(item.productId);
    requestedQuantities.set(productKey, (requestedQuantities.get(productKey) ?? 0) + item.qty);
  });

  const problems = (dto.problems ?? []).map((problem) => {
    const productKey = String(problem.product_id);
    const requestedQty = requestedQuantities.get(productKey) ?? 0;

    return {
      productId: problem.product_id,
      reason: problem.reason,
      available:
        typeof problem.available === "number"
          ? problem.available
          : typeof problem.missing === "number"
            ? Math.max(requestedQty - problem.missing, 0)
            : undefined,
    };
  });

  return {
    ok: problems.length === 0 ? Boolean(dto.ok ?? true) : false,
    problems,
  };
}
