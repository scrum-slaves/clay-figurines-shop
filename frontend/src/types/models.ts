export type ProductId = number | string;

export type ProductListItem = {
  id: ProductId;
  title: string;
  price: number;
  image: string;
  inStock: boolean;
  type?: string | number;
  collection?: string;
};

export type ProductAttribute = {
  label: string;
  value: string;
};

export type ProductDetails = ProductListItem & {
  images: string[];
  description: string;
  attributes?: ProductAttribute[];
};

export type CartItem = {
  productId: ProductId;
  qty: number;
  product?: ProductListItem | ProductDetails;
};

export type CartStorage = {
  items: Array<{
    productId: ProductId;
    qty: number;
  }>;
};

export type ProductOption = {
  id: string;
  label: string;
};

export type ProductsFilters = {
  types: string[];
  collections: string[];
  minPrice: string;
  maxPrice: string;
  availability: "all" | "in_stock";
};

export type ValidateCartProblem = {
  productId: ProductId;
  reason: "deleted_or_inactive" | "not_enough_stock";
  available?: number;
};

export type ValidateCartResult = {
  ok: boolean;
  problems: ValidateCartProblem[];
};

export type CheckoutFormValues = {
  customerName: string;
  phone: string;
  address: string;
};
