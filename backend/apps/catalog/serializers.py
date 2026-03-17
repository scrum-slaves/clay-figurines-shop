import base64

from django.utils.encoding import force_bytes
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
    photo_url = serializers.SerializerMethodField()
    photo_base64 = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "photo_url",
            "photo_base64",
            "in_stock",
            "product_type",
            "collection",
        ]

    def get_photo_url(self, obj):
        photo_path, _ = _resolve_photo_blob(obj.photo_blob)
        if not photo_path:
            return None

        request = self.context.get("request")
        media_path = f"/media/{photo_path.lstrip('/')}"
        return request.build_absolute_uri(media_path) if request else media_path

    def get_photo_base64(self, obj):
        _, binary_payload = _resolve_photo_blob(obj.photo_blob)
        return base64.b64encode(binary_payload).decode("utf-8") if binary_payload else None

    def get_in_stock(self, obj):
        return obj.stock_qty > 0


class ProductDetailSerializer(serializers.ModelSerializer):
    product_type = TypeSerializer(read_only=True)
    collection = CollectionSerializer(read_only=True)
    master = MasterSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()
    photo_base64 = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "photo_url",
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

    def get_photo_url(self, obj):
        photo_path, _ = _resolve_photo_blob(obj.photo_blob)
        if not photo_path:
            return None

        request = self.context.get("request")
        media_path = f"/media/{photo_path.lstrip('/')}"
        return request.build_absolute_uri(media_path) if request else media_path

    def get_photo_base64(self, obj):
        _, binary_payload = _resolve_photo_blob(obj.photo_blob)
        return base64.b64encode(binary_payload).decode("utf-8") if binary_payload else None

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


def _resolve_photo_blob(photo_blob):
    if not photo_blob:
        return None, None

    blob_bytes = force_bytes(photo_blob)

    try:
        blob_text = blob_bytes.decode("utf-8").strip()
    except UnicodeDecodeError:
        blob_text = ""

    if blob_text.lower().startswith("product_photos/"):
        return blob_text, None

    return None, blob_bytes
