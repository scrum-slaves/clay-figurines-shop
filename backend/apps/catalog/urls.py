from django.urls import path

from .views import ProductDetailAPIView, ProductListAPIView, TypeListAPIView


urlpatterns = [
    path("types/", TypeListAPIView.as_view(), name="type-list"),
    path("products/", ProductListAPIView.as_view(), name="product-list"),
    path("products/<int:pk>/", ProductDetailAPIView.as_view(), name="product-detail"),
]
