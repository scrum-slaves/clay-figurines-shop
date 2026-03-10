from django.urls import path

from .views import (
    CheckoutValidateAPIView,
    CollectionListAPIView,
    ProductDetailAPIView,
    ProductFilterAPIView,
    ProductListAPIView,
    TypeListAPIView,
)

urlpatterns = [
    # Специфичные маршруты ПЕРЕД общими
    path("products/types/", TypeListAPIView.as_view(), name="product-types"),
    # Удобные алиасы без префикса products/
    path("types/", TypeListAPIView.as_view(), name="type-list"),
    path("products/collections/", CollectionListAPIView.as_view(), name="product-collections"),
    path("collections/", CollectionListAPIView.as_view(), name="collection-list"),
    path("products/filter/", ProductFilterAPIView.as_view(), name="product-filter"),
    path("products/checkout/", CheckoutValidateAPIView.as_view(), name="checkout-validate"),
    
    # Общие маршруты в конце
    path("products/<int:pk>/", ProductDetailAPIView.as_view(), name="product-detail"),
    path("products/", ProductListAPIView.as_view(), name="product-list"),
]
