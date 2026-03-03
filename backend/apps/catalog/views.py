from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ProductCardSerializer, ProductDetailSerializer, TypeSerializer
from .services import get_product_detail, list_products, list_types


class TypeListAPIView(APIView):
    def get(self, request):
        _ = request
        try:
            data = list_types()
        except NotImplementedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED)
        serializer = TypeSerializer(data, many=True)
        return Response(serializer.data)


class ProductListAPIView(APIView):
    def get(self, request):
        raw_types = request.query_params.getlist("type")
        type_ids = [int(value) for value in raw_types if value.isdigit()]
        try:
            data = list_products(type_ids=type_ids)
        except NotImplementedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED)
        serializer = ProductCardSerializer(data, many=True)
        return Response(serializer.data)


class ProductDetailAPIView(APIView):
    def get(self, request, pk: int):
        _ = request
        try:
            data = get_product_detail(product_id=pk)
        except NotImplementedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED)

        serializer = ProductDetailSerializer(data)
        return Response(serializer.data)
