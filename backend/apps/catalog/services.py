from __future__ import annotations

from typing import Any


class CatalogServiceError(RuntimeError):
    """Raised when catalog services are not wired to database models yet."""


def list_types() -> list[dict[str, Any]]:
    raise NotImplementedError("TODO: подключить модели")


def list_products(type_ids: list[int] | None = None) -> list[dict[str, Any]]:
    _ = type_ids
    raise NotImplementedError("TODO: подключить модели")


def get_product_detail(product_id: int) -> dict[str, Any]:
    _ = product_id
    raise NotImplementedError("TODO: подключить модели")
