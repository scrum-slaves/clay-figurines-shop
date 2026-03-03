from rest_framework import serializers


class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    qty = serializers.IntegerField(min_value=1)


class ValidateCartRequestSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)


class CartProblemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    reason = serializers.ChoiceField(choices=["deleted_or_inactive", "not_enough_stock"])
    available = serializers.IntegerField(required=False)


class ValidateCartResponseSerializer(serializers.Serializer):
    ok = serializers.BooleanField()
    problems = CartProblemSerializer(many=True)


# TODO: при появлении моделей при необходимости добавить сериализацию доп. данных
# (например, актуальных цен/названий для снапшота корзины).
