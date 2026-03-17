import { expect, test } from "@playwright/test";

import {
  captureWindowOpen,
  catalogProducts,
  expectCartStorage,
  getOpenedUrls,
  seedCartStorage,
  setupApiMocks,
} from "./helpers";


test.describe("cart and checkout", () => {
  test("shows empty checkout state when localStorage cart is empty", async ({ page }) => {
    await setupApiMocks(page);

    await page.goto("/checkout");

    await expect(page.getByText("Оформлять пока нечего.")).toBeVisible();
    await expect(page.getByTestId("checkout-form")).toHaveCount(0);
  });

  test("renders cart items from localStorage and can proceed to checkout", async ({ page }) => {
    await seedCartStorage(page, [{ productId: 1, qty: 2 }]);
    await setupApiMocks(page);

    await page.goto("/cart");

    await expect(page.getByTestId("cart-item-row")).toHaveCount(1);
    await expect(page.getByText(catalogProducts[0].name)).toBeVisible();
    await expect(page.getByTestId("cart-summary-action")).toHaveAttribute("href", "/checkout");
  });

  test("submits checkout, uses localStorage cart payload and opens Telegram deep link", async ({ page }) => {
    await seedCartStorage(page, [
      { productId: 1, qty: 2 },
      { productId: 2, qty: 1 },
    ]);
    await captureWindowOpen(page);
    const api = await setupApiMocks(page, {
      checkoutResponse: { ok: true, problems: [] },
    });

    await page.goto("/checkout");

    await expect(page.getByTestId("checkout-order-item")).toHaveCount(2);
    await page.getByTestId("checkout-customer-name").fill("Мария Смирнова");
    await page.getByTestId("checkout-phone").fill("+7 999 123-45-67");
    await page.getByTestId("checkout-address").fill("Москва, Тверская 1");
    await page.getByTestId("checkout-submit").click();

    await expect.poll(() => api.validateCartPayloads.length).toBe(1);
    await expect.poll(() => api.productsCheckoutPayloads.length).toBe(1);

    expect(api.productsCheckoutPayloads[0]).toEqual({
      items: [
        { product_id: 1, qty: 2 },
        { product_id: 2, qty: 1 },
      ],
    });

    await expect.poll(async () => (await getOpenedUrls(page)).length).toBe(1);

    const [deepLink] = await getOpenedUrls(page);
    expect(deepLink).toContain("https://t.me/clay_master?text=");
    expect(deepLink).toContain("text=");

    const deepLinkUrl = new URL(deepLink);
    const encodedMessage = deepLinkUrl.searchParams.get("text") ?? "";
    const message = decodeURIComponent(encodedMessage);

    expect(deepLinkUrl.pathname).toBe("/clay_master");
    expect(message).toContain("Мария Смирнова");
    expect(message).toContain("+7 999 123-45-67");
    expect(message).toContain("Москва, Тверская 1");
    expect(message).toContain("Forest Fox");
    expect(message).toContain("Moon Owl");
    expect(message).toContain("2 шт.");
    expect(message).toContain("1 шт.");
    expect(message).toContain("Итого:");
    expect(message).toContain("₽");
    expect(deepLink).toContain(`text=${encodeURIComponent(message)}`);
    await expect(page.getByTestId("checkout-problem")).toHaveCount(0);
  });

  test("shows deleted_or_inactive problem and blocks Telegram navigation", async ({ page }) => {
    await seedCartStorage(page, [{ productId: 1, qty: 1 }]);
    await captureWindowOpen(page);
    await setupApiMocks(page, {
      checkoutResponse: {
        ok: false,
        problems: [{ product_id: 1, reason: "deleted_or_inactive" }],
      },
    });

    await page.goto("/checkout");
    await page.getByTestId("checkout-customer-name").fill("Иван Петров");
    await page.getByTestId("checkout-phone").fill("+7 900 000-00-00");
    await page.getByTestId("checkout-address").fill("Казань, Кремль");
    await page.getByTestId("checkout-submit").click();

    await expect(page.getByTestId("checkout-problem")).toHaveCount(1);
    await expect(page.getByTestId("checkout-problems")).toContainText("id=1");
    await expect.poll(async () => (await getOpenedUrls(page)).length).toBe(0);
  });

  test("shows not_enough_stock problem and blocks Telegram navigation", async ({ page }) => {
    await seedCartStorage(page, [{ productId: 2, qty: 3 }]);
    await captureWindowOpen(page);
    await setupApiMocks(page, {
      checkoutResponse: {
        ok: false,
        problems: [{ product_id: 2, reason: "not_enough_stock", missing: 2 }],
      },
    });

    await page.goto("/checkout");
    await page.getByTestId("checkout-customer-name").fill("Ольга Власова");
    await page.getByTestId("checkout-phone").fill("+7 901 111-22-33");
    await page.getByTestId("checkout-address").fill("Санкт-Петербург, Невский 10");
    await page.getByTestId("checkout-submit").click();

    await expect(page.getByTestId("checkout-problem")).toHaveCount(1);
    await expect(page.getByTestId("checkout-problem").first()).toContainText("id=2");
    await expect(page.getByTestId("checkout-problem").first()).toContainText("1 шт.");
    await expect.poll(async () => (await getOpenedUrls(page)).length).toBe(0);
  });

  test("shows multiple problems and keeps cart unchanged", async ({ page }) => {
    await seedCartStorage(page, [
      { productId: 1, qty: 2 },
      { productId: 3, qty: 4 },
    ]);
    await captureWindowOpen(page);
    await setupApiMocks(page, {
      checkoutResponse: {
        ok: false,
        problems: [
          { product_id: 1, reason: "not_enough_stock", missing: 1 },
          { product_id: 3, reason: "deleted_or_inactive" },
        ],
      },
    });

    await page.goto("/checkout");
    await page.getByTestId("checkout-customer-name").fill("Алексей Орлов");
    await page.getByTestId("checkout-phone").fill("+7 911 111-22-33");
    await page.getByTestId("checkout-address").fill("Пермь, Ленина 15");
    await page.getByTestId("checkout-submit").click();

    await expect(page.getByTestId("checkout-problem")).toHaveCount(2);
    await expect(page.getByTestId("checkout-problem").nth(0)).toContainText("id=1");
    await expect(page.getByTestId("checkout-problem").nth(1)).toContainText("id=3");
    await expect.poll(async () => (await getOpenedUrls(page)).length).toBe(0);
    await expectCartStorage(page, [
      { productId: 1, qty: 2 },
      { productId: 3, qty: 4 },
    ]);
  });
});
