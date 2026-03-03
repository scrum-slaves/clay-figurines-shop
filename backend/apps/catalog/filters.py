import django_filters


class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass


class ProductFilter(django_filters.FilterSet):
    type = NumberInFilter(field_name="type_id", lookup_expr="in")

    class Meta:
        fields = ["type"]
        # TODO: после добавления моделей указать model = Product.
