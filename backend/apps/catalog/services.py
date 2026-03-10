from __future__ import annotations

from collections import defaultdict
from typing import Any

from django.db.models import Q

from .models import Collection, Product, ProductType


def list_types() -> list[ProductType]:
    """Получить все типы товаров."""
    return list(ProductType.objects.all())


def list_collections() -> list[Collection]:
    """Получить все коллекции."""
    return list(Collection.objects.all())


def list_products(type_ids: list[int] | None = None, collection_ids: list[int] | None = None, min_price: float | None = None, max_price: float | None = None) -> list[Product]:
    """
    Получить список товаров с фильтрацией.
    
    Args:
        type_ids: список ID типов товаров
        collection_ids: список ID коллекций
        min_price: минимальная цена
        max_price: максимальная цена
    """
    queryset = Product.objects.all()
    
    if type_ids:
        queryset = queryset.filter(product_type_id__in=type_ids)
    
    if collection_ids:
        queryset = queryset.filter(collection_id__in=collection_ids)
    
    if min_price is not None:
        queryset = queryset.filter(price__gte=min_price)
    
    if max_price is not None:
        queryset = queryset.filter(price__lte=max_price)
    
    return list(queryset)


def get_product_detail(product_id: int) -> Product | None:
    """Получить полную информацию о товаре по ID."""
    try:
        return Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return None


def get_products_by_ids(product_ids: list[int]) -> dict[int, dict[str, Any]]:
    """
    Получить товары по списку ID для валидации корзины.
    
    Возвращаемый формат:
    {
      10: {"id": 10, "is_active": True, "stock": 5},
      ...
    }
    """
    products = Product.objects.filter(id__in=product_ids)
    result = {}
    for product in products:
        result[product.id] = {
            "id": product.id,
            "is_active": True,
            "stock": product.stock_qty,
        }
    return result


def validate_cart_items(items: list[dict[str, int]]) -> dict[str, Any]:
    """
    Валидация товаров в корзине.
    
    Проверяет:
    - существование товара
    - наличие в наличии достаточного количества
    
    Args:
        items: список словарей с product_id и qty
        
    Returns:
        {'ok': bool, 'problems': [{'product_id': int, 'reason': str, 'missing': int}]}
    """
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
            missing = requested_qty - available
            problems.append(
                {
                    "product_id": product_id,
                    "reason": "not_enough_stock",
                    "missing": missing,
                }
            )

    return {
        "ok": len(problems) == 0,
        "problems": problems,
    }
