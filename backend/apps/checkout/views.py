from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ValidateCartRequestSerializer, ValidateCartResponseSerializer
from .services import validate_cart_items


class ValidateCartAPIView(APIView):
    def post(self, request):
        request_serializer = ValidateCartRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        result = validate_cart_items(request_serializer.validated_data["items"])
        response_serializer = ValidateCartResponseSerializer(result)
        return Response(response_serializer.data)
