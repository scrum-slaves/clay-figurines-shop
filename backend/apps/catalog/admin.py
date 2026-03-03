from django.contrib import admin

from .models import Collection, Master, Product, ProductType


@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Master)
class MasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "first_name",
        "last_name",
        "telegram_username",
        "email",
        "phone",
    )
    search_fields = ("first_name", "last_name", "telegram_username", "email", "phone")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "product_type", "collection", "master", "price", "stock_qty")
    list_filter = ("product_type", "collection", "master")
    search_fields = ("name", "material", "description")
