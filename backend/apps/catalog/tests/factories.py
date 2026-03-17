from __future__ import annotations

from decimal import Decimal
from itertools import count

from apps.catalog.models import Collection, Master, Product, ProductType


_sequence = count(1)


def _next_number() -> int:
    return next(_sequence)


def create_product_type(**overrides) -> ProductType:
    number = _next_number()
    defaults = {
        "name": f"Type {number}",
        "description": f"Type description {number}",
    }
    defaults.update(overrides)
    return ProductType.objects.create(**defaults)


def create_collection(**overrides) -> Collection:
    number = _next_number()
    defaults = {
        "name": f"Collection {number}",
        "description": f"Collection description {number}",
    }
    defaults.update(overrides)
    return Collection.objects.create(**defaults)


def create_master(**overrides) -> Master:
    number = _next_number()
    defaults = {
        "telegram_username": f"master_{number}",
        "email": f"master_{number}@example.com",
        "phone": f"+100000000{number:02d}",
        "first_name": f"Master{number}",
        "last_name": f"Smith{number}",
    }
    defaults.update(overrides)
    return Master.objects.create(**defaults)


def create_product(**overrides) -> Product:
    number = _next_number()
    product_type = overrides.pop("product_type", None)
    collection = overrides.pop("collection", None)
    master = overrides.pop("master", None)
    defaults = {
        "name": f"Product {number}",
        "description": f"Product description {number}",
        "size": "10x10",
        "weight": 150,
        "material": "Clay",
        "price": Decimal("1500.00"),
        "stock_qty": 3,
        "product_type": product_type or create_product_type(),
        "collection": collection or create_collection(),
        "master": master or create_master(),
    }
    defaults.update(overrides)
    return Product.objects.create(**defaults)
