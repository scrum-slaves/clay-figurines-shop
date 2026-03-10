import django_filters

from .models import Product


class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass


class ProductFilter(django_filters.FilterSet):
    type = NumberInFilter(field_name="product_type__name", lookup_expr="in")
    collection = NumberInFilter(field_name="collection__name", lookup_expr="in")
    min_price = django_filters.NumberFilter(
        field_name="price", lookup_expr="gte"
    )
    max_price = django_filters.NumberFilter(
        field_name="price", lookup_expr="lte"
    )

    class Meta:
        model = Product
        fields = ["product_type", "collection", "price"]
