from rest_framework import serializers


class TypeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class ProductCardSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    cover_url = serializers.CharField(allow_blank=True, required=False)
    type_id = serializers.IntegerField(required=False)


class ProductDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    characteristics = serializers.DictField(
        child=serializers.CharField(), required=False, default=dict
    )
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    cover_url = serializers.CharField(allow_blank=True, required=False)
    image_urls = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    stock = serializers.IntegerField(required=False)
    is_active = serializers.BooleanField(required=False)


# TODO: после добавления моделей можно перейти на ModelSerializer и привязать:
# - ProductType(id, name)
# - Product(id, name, description, characteristics, price, stock, is_active, type)
# - ProductImage(id, product, image, is_cover)
