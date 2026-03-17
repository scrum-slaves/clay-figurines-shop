import { ProductId } from "../types/models";

export type ApiOptionDto = {
  id: ProductId;
  name?: string | null;
  title?: string | null;
};

export type ApiEntityReference =
  | ApiOptionDto
  | string
  | number
  | null
  | undefined;

export type ApiProductListItemDto = {
  id: ProductId;
  name?: string | null;
  title?: string | null;
  price?: string | number | null;
  image?: string | null;
  photo_url?: string | null;
  photo_base64?: string | null;
  in_stock?: boolean | null;
  available?: boolean | null;
  stock_qty?: number | null;
  product_type?: ApiEntityReference;
  type?: ApiEntityReference;
  collection?: ApiEntityReference;
};

export type ApiProductDetailsDto = ApiProductListItemDto & {
  description?: string | null;
  images?: Array<string | null> | null;
  image_urls?: Array<string | null> | null;
  characteristics?: Record<string, string | number | null> | null;
  attributes?: Array<{
    label?: string | null;
    value?: string | number | null;
  }> | null;
  size?: string | null;
  weight?: string | number | null;
  material?: string | null;
};

export type ApiValidateCartProblemDto = {
  product_id: ProductId;
  reason: "deleted_or_inactive" | "not_enough_stock";
  available?: number | null;
  missing?: number | null;
};

export type ApiValidateCartResponseDto = {
  ok?: boolean;
  problems?: ApiValidateCartProblemDto[] | null;
};
