import { CartItem, CheckoutFormValues } from "../types/models";
import { formatCurrency } from "./currency";

function normalizeTelegramUsername(value: string): string {
  return value.trim().replace(/^@/, "");
}

export function buildTelegramOrderMessage(
  items: CartItem[],
  formValues: CheckoutFormValues,
  totalPrice: number
): string {
  const productLines = items.map((item) => {
    const title = item.product?.title ?? `Товар #${item.productId}`;
    const unitPrice = item.product?.price ?? 0;
    const lineTotal = unitPrice * item.qty;
    const pricePart = unitPrice > 0 ? `, ${formatCurrency(lineTotal)}` : "";

    return `- ${title} — ${item.qty} шт. (id=${item.productId})${pricePart}`;
  });

  return [
    `Здравствуйте, меня зовут ${formValues.customerName}.`,
    `Мой телефон: ${formValues.phone}.`,
    `Адрес доставки: ${formValues.address}.`,
    "Меня интересуют следующие товары:",
    ...productLines,
    `Итого: ${formatCurrency(totalPrice)}`,
  ].join("\n");
}

export function buildTelegramDeepLink(masterUsername: string, message: string): string {
  const normalizedUsername = normalizeTelegramUsername(masterUsername);

  if (!normalizedUsername) {
    return "";
  }

  return `https://t.me/${normalizedUsername}?text=${encodeURIComponent(message)}`;
}
