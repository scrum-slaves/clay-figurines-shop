import { expect, Page, Route } from "@playwright/test";


export type MockOption = {
  id: number;
  name: string;
};

export type MockProduct = {
  id: number;
  name: string;
  price: string;
  stock_qty: number;
  product_type: string;
  collection: string;
  description?: string;
  material?: string;
  size?: string;
  weight?: number;
};

type SetupApiMocksOptions = {
  types?: MockOption[];
  collections?: MockOption[];
  products?: MockProduct[];
  checkoutResponse?: {
    ok: boolean;
    problems: Array<{
      product_id: number;
      reason: "deleted_or_inactive" | "not_enough_stock";
      available?: number;
      missing?: number;
    }>;
  };
  validateCartStatus?: number;
};

type ProductDetailResponse = {
  id: number;
  name: string;
  description: string;
  price: string;
  photo_url: string | null;
  photo_base64: string | null;
  stock_qty: number;
  in_stock: boolean;
  product_type: { id: number; name: string };
  collection: { id: number; name: string };
  master: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  size: string;
  weight: number;
  material: string;
};

export const catalogTypes: MockOption[] = [
  { id: 1, name: "Animals" },
  { id: 2, name: "Decor" },
];

export const catalogCollections: MockOption[] = [
  { id: 11, name: "Forest" },
  { id: 12, name: "Moon" },
];

export const catalogProducts: MockProduct[] = [
  {
    id: 1,
    name: "Forest Fox",
    price: "1200.00",
    stock_qty: 4,
    product_type: "Animals",
    collection: "Forest",
    description: "Fox figurine for the forest collection.",
    material: "Clay",
    size: "10x12 cm",
    weight: 320,
  },
  {
    id: 2,
    name: "Moon Owl",
    price: "1800.00",
    stock_qty: 1,
    product_type: "Animals",
    collection: "Moon",
    description: "Owl figurine for the moon collection.",
    material: "Clay",
    size: "14x10 cm",
    weight: 410,
  },
  {
    id: 3,
    name: "Tiny Vase",
    price: "900.00",
    stock_qty: 0,
    product_type: "Decor",
    collection: "Forest",
    description: "Small decorative vase.",
    material: "Ceramic clay",
    size: "8x7 cm",
    weight: 220,
  },
];

function json(route: Route, payload: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

function findTypeIdByName(typeName: string, types: MockOption[]): number {
  return types.find((type) => type.name === typeName)?.id ?? 0;
}

function findCollectionIdByName(collectionName: string, collections: MockOption[]): number {
  return collections.find((collection) => collection.name === collectionName)?.id ?? 0;
}

function toProductListResponse(product: MockProduct) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    photo_url: null,
    photo_base64: null,
    stock_qty: product.stock_qty,
    in_stock: product.stock_qty > 0,
    product_type: product.product_type,
    collection: product.collection,
  };
}

function toProductDetailResponse(
  product: MockProduct,
  types: MockOption[],
  collections: MockOption[]
): ProductDetailResponse {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? `${product.name} description`,
    price: product.price,
    photo_url: null,
    photo_base64: null,
    stock_qty: product.stock_qty,
    in_stock: product.stock_qty > 0,
    product_type: {
      id: findTypeIdByName(product.product_type, types),
      name: product.product_type,
    },
    collection: {
      id: findCollectionIdByName(product.collection, collections),
      name: product.collection,
    },
    master: {
      id: 1,
      first_name: "Anna",
      last_name: "Potter",
      email: "anna@example.com",
    },
    size: product.size ?? "10x10 cm",
    weight: product.weight ?? 300,
    material: product.material ?? "Clay",
  };
}

function filterProducts(products: MockProduct[], url: URL, types: MockOption[], collections: MockOption[]) {
  const typeIds = url.searchParams.getAll("type");
  const collectionIds = url.searchParams.getAll("collection");
  const minPrice = Number(url.searchParams.get("min_price") ?? "");
  const maxPrice = Number(url.searchParams.get("max_price") ?? "");

  return products.filter((product) => {
    const typeId = String(findTypeIdByName(product.product_type, types));
    const collectionId = String(findCollectionIdByName(product.collection, collections));
    const price = Number(product.price);

    if (typeIds.length > 0 && !typeIds.includes(typeId)) {
      return false;
    }

    if (collectionIds.length > 0 && !collectionIds.includes(collectionId)) {
      return false;
    }

    if (url.searchParams.has("min_price") && price < minPrice) {
      return false;
    }

    if (url.searchParams.has("max_price") && price > maxPrice) {
      return false;
    }

    return true;
  });
}

export async function seedCartStorage(page: Page, items: Array<{ productId: number; qty: number }>) {
  await page.addInitScript((cartItems) => {
    window.localStorage.setItem("clay-shop-cart", JSON.stringify({ items: cartItems }));
  }, items);
}

export async function captureWindowOpen(page: Page) {
  await page.addInitScript(() => {
    const openedUrls: string[] = [];
    (window as Window & { __openedUrls?: string[] }).__openedUrls = openedUrls;

    window.open = ((url?: string | URL) => {
      openedUrls.push(String(url ?? ""));
      return { closed: false } as Window;
    }) as typeof window.open;
  });
}

export async function getOpenedUrls(page: Page) {
  return page.evaluate(() => (window as Window & { __openedUrls?: string[] }).__openedUrls ?? []);
}

export async function setupApiMocks(page: Page, options: SetupApiMocksOptions = {}) {
  const types = options.types ?? catalogTypes;
  const collections = options.collections ?? catalogCollections;
  const products = options.products ?? catalogProducts;
  const productDetails = new Map(
    products.map((product) => [String(product.id), toProductDetailResponse(product, types, collections)])
  );

  const catalogRequests: string[] = [];
  const validateCartPayloads: unknown[] = [];
  const productsCheckoutPayloads: unknown[] = [];

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith("/products/types/")) {
      return json(route, types);
    }

    if (path.endsWith("/products/collections/")) {
      return json(route, collections);
    }

    if (path.endsWith("/products/") && route.request().method() === "GET") {
      catalogRequests.push(url.search);
      return json(route, filterProducts(products, url, types, collections).map(toProductListResponse));
    }

    const detailMatch = path.match(/\/api\/v1\/products\/(\d+)\/$/);
    if (detailMatch) {
      const detailResponse = productDetails.get(detailMatch[1]);
      return detailResponse
        ? json(route, detailResponse)
        : json(route, { detail: "Product not found" }, 404);
    }

    if (path.endsWith("/checkout/validate-cart/")) {
      validateCartPayloads.push(JSON.parse(route.request().postData() ?? "{}"));

      if ((options.validateCartStatus ?? 404) === 404) {
        return json(route, { detail: "Not found" }, 404);
      }

      return json(route, options.checkoutResponse ?? { ok: true, problems: [] }, options.validateCartStatus);
    }

    if (path.endsWith("/products/checkout/")) {
      productsCheckoutPayloads.push(JSON.parse(route.request().postData() ?? "{}"));
      return json(route, options.checkoutResponse ?? { ok: true, problems: [] });
    }

    return route.fallback();
  });

  return {
    catalogRequests,
    validateCartPayloads,
    productsCheckoutPayloads,
  };
}

export async function expectCartStorage(page: Page, items: Array<{ productId: number; qty: number }>) {
  await expect
    .poll(async () =>
      page.evaluate(() => JSON.parse(window.localStorage.getItem("clay-shop-cart") ?? "{\"items\":[]}"))
    )
    .toEqual({ items });
}
