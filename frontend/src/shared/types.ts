export type ProductTypeDto = {
  id: number;
  name: string;
};

export type ProductCardDto = {
  id: number;
  name: string;
  price: string;
  cover_url?: string;
  type_id?: number;
};

export type ProductDetailDto = {
  id: number;
  name: string;
  description: string;
  characteristics?: Record<string, string>;
  price: string;
  cover_url?: string;
  image_urls?: string[];
  stock?: number;
  is_active?: boolean;
};

export type CartItem = {
  productId: number;
  qty: number;
};

export type CartState = {
  items: CartItem[];
};

export type ValidateCartProblemDto = {
  product_id: number;
  reason: "deleted_or_inactive" | "not_enough_stock";
  available?: number;
};

export type ValidateCartResponseDto = {
  ok: boolean;
  problems: ValidateCartProblemDto[];
};
