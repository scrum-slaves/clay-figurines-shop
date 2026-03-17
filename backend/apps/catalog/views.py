from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    CollectionSerializer,
    ProductCardSerializer,
    ProductDetailSerializer,
    TypeSerializer,
    ValidateCartRequestSerializer,
    ValidateCartResponseSerializer,
)
from .services import (
    get_product_detail,
    list_collections,
    list_products,
    list_types,
    validate_cart_items,
)


class TypeListAPIView(APIView):
    """GET /products/types/ - Получить все типы товаров."""

    def get(self, request):
        _ = request
        try:
            data = list_types()
        except NotImplementedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED)
        serializer = TypeSerializer(data, many=True)
        return Response(serializer.data)


class CollectionListAPIView(APIView):
    """GET /products/collections/ - Получить все коллекции."""

    def get(self, request):
        _ = request
        try:
            data = list_collections()
        except NotImplementedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED)
        serializer = CollectionSerializer(data, many=True)
        return Response(serializer.data)


class ProductListAPIView(APIView):
    """GET /products/ - Список товаров с фильтрацией."""

    def get(self, request):
        # Получить параметры фильтрации
        type_ids = request.query_params.getlist("type")
        collection_ids = request.query_params.getlist("collection")
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")

        # Конвертировать в нужные типы
        type_ids = [int(value) for value in type_ids if value.isdigit()] or None
        collection_ids = [int(value) for value in collection_ids if value.isdigit()] or None
        min_price = float(min_price) if min_price else None
        max_price = float(max_price) if max_price else None

        try:
            data = list_products(
                type_ids=type_ids,
                collection_ids=collection_ids,
                min_price=min_price,
                max_price=max_price,
            )
        except NotImplementedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED)
        
        serializer = ProductCardSerializer(data, many=True, context={"request": request})
        return Response(serializer.data)


class ProductDetailAPIView(APIView):
    """GET /products/{id}/ - Полная информация о товаре по ID."""

    def get(self, request, pk: int):
        _ = request
        try:
            data = get_product_detail(product_id=pk)
        except NotImplementedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED)

        if data is None:
            return Response(
                {"detail": "Product not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProductDetailSerializer(data, context={"request": request})
        return Response(serializer.data)


class ProductFilterAPIView(APIView):
    """GET /products/filter/ - Фильтрация товаров по критериям."""

    def get(self, request):
        # Получить параметры фильтрации
        product_type_name = request.query_params.get("type")
        collection_name = request.query_params.get("collection")
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")

        # Конвертировать в нужные типы
        # Для типов и коллекций - поиск по названию
        type_ids = None
        collection_ids = None
        
        if product_type_name:
            from .models import ProductType
            type_objs = ProductType.objects.filter(name__iexact=product_type_name)
            type_ids = [t.id for t in type_objs]
        
        if collection_name:
            from .models import Collection
            collection_objs = Collection.objects.filter(name__iexact=collection_name)
            collection_ids = [c.id for c in collection_objs]
        
        min_price = float(min_price) if min_price else None
        max_price = float(max_price) if max_price else None

        try:
            data = list_products(
                type_ids=type_ids,
                collection_ids=collection_ids,
                min_price=min_price,
                max_price=max_price,
            )
        except NotImplementedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED)

        serializer = ProductCardSerializer(data, many=True, context={"request": request})
        return Response(serializer.data)


class CheckoutValidateAPIView(APIView):
    """POST /products/checkout/ - Проверка доступности товаров в корзине."""

    def post(self, request):
        request_serializer = ValidateCartRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        result = validate_cart_items(request_serializer.validated_data["items"])
        response_serializer = ValidateCartResponseSerializer(result)
        return Response(response_serializer.data)
