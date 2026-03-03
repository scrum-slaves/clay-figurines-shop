from __future__ import annotations

from collections import defaultdict
from typing import Any


def get_products_by_ids(product_ids: list[int]) -> dict[int, dict[str, Any]]:
    """
    Заглушка репозитория.
    TODO: подключить реальный запрос к модели Product.

    Ожидаемый формат результата:
    {
      10: {"id": 10, "is_active": True, "stock": 5},
      ...
    }
    """
    _ = product_ids
    return {}


def validate_cart_items(items: list[dict[str, int]]) -> dict[str, Any]:
    requested_qty_by_id: dict[int, int] = defaultdict(int)
    for item in items:
        requested_qty_by_id[item["product_id"]] += item["qty"]

    product_ids = list(requested_qty_by_id.keys())
    products = get_products_by_ids(product_ids)

    problems: list[dict[str, Any]] = []

    for product_id, requested_qty in requested_qty_by_id.items():
        product = products.get(product_id)
        if not product or not bool(product.get("is_active", False)):
            problems.append(
                {"product_id": product_id, "reason": "deleted_or_inactive"}
            )
            continue

        available = int(product.get("stock", 0))
        if requested_qty > available:
            problems.append(
                {
                    "product_id": product_id,
                    "reason": "not_enough_stock",
                    "available": available,
                }
            )

    return {
        "ok": len(problems) == 0,
        "problems": problems,
    }
