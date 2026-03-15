from rest_framework import serializers

from .models import Collection, Master, Product, ProductType


class TypeSerializer(serializers.ModelSerializer):
    name = serializers.CharField()

    class Meta:
        model = ProductType
        fields = ["id", "name"]


class CollectionSerializer(serializers.ModelSerializer):
    name = serializers.CharField()

    class Meta:
        model = Collection
        fields = ["id", "name"]


class MasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Master
        fields = ["id", "first_name", "last_name", "email"]


class ProductCardSerializer(serializers.ModelSerializer):
    product_type = serializers.CharField(source="product_type.name", read_only=True)
    collection = serializers.CharField(source="collection.name", read_only=True)
    photo_base64 = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "price", "photo_base64", "in_stock", "product_type", "collection"]

    def get_photo_base64(self, obj):
        if obj.photo_blob:
            try:
                data = obj.photo_blob.read()
            except Exception:
                return None

            if data:
                import base64

                return base64.b64encode(data).decode("utf-8")
        return None

    def get_in_stock(self, obj):
        return obj.stock_qty > 0


class ProductDetailSerializer(serializers.ModelSerializer):
    product_type = TypeSerializer(read_only=True)
    collection = CollectionSerializer(read_only=True)
    master = MasterSerializer(read_only=True)
    photo_base64 = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "photo_base64",
            "stock_qty",
            "in_stock",
            "product_type",
            "collection",
            "master",
            "size",
            "weight",
            "material",
        ]

    def get_photo_base64(self, obj):
        if obj.photo_blob:
            try:
                data = obj.photo_blob.read()
            except Exception:
                return None

            if data:
                import base64

                return base64.b64encode(data).decode("utf-8")
        return None

    def get_in_stock(self, obj):
        return obj.stock_qty > 0


class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    qty = serializers.IntegerField(min_value=1)


class ValidateCartRequestSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)


class CartProblemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    reason = serializers.ChoiceField(choices=["deleted_or_inactive", "not_enough_stock"])
    missing = serializers.IntegerField(required=False)

class ValidateCartResponseSerializer(serializers.Serializer):
    ok = serializers.BooleanField()
    problems = CartProblemSerializer(many=True)
