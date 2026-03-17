import { expect, test } from "@playwright/test";

import { catalogProducts, setupApiMocks } from "./helpers";


test.describe("catalog and product pages", () => {
  test("loads products, filters by type and opens product details", async ({ page }) => {
    const api = await setupApiMocks(page);

    await page.goto("/products");

    await expect(page.getByTestId("products-grid")).toBeVisible();
    await expect(page.getByTestId("product-card")).toHaveCount(3);
    await expect(page.getByText(catalogProducts[0].name)).toBeVisible();
    await expect(page.getByText(catalogProducts[1].name)).toBeVisible();

    const filteredRequest = page.waitForRequest((request) => request.url().includes("/api/v1/products/?type=2"));
    await page.getByTestId("type-filter-option-2").click();
    await filteredRequest;

    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByText(catalogProducts[2].name)).toBeVisible();
    expect(api.catalogRequests.some((search) => search.includes("type=2"))).toBeTruthy();

    await page.getByRole("button", { name: "Очистить фильтры" }).click();
    await expect(page.getByTestId("product-card")).toHaveCount(3);

    await page.getByTestId("product-card-details-link-1").click();

    await expect(page).toHaveURL(/\/products\/1$/);
    await expect(page.locator("h1").filter({ hasText: catalogProducts[0].name }).last()).toBeVisible();
    await expect(page.getByTestId("product-detail-add-to-cart")).toBeVisible();
  });

  test("adds a product to cart and writes localStorage", async ({ page }) => {
    await setupApiMocks(page);

    await page.goto("/products");
    await page.getByTestId("product-card-add-to-cart-1").click();

    await expect
      .poll(async () =>
        page.evaluate(() => JSON.parse(window.localStorage.getItem("clay-shop-cart") ?? "{\"items\":[]}"))
      )
      .toEqual({
        items: [{ productId: 1, qty: 1 }],
      });
  });
});
