from django.urls import path

from .views import ValidateCartAPIView


urlpatterns = [
    path(
        "checkout/validate-cart/",
        ValidateCartAPIView.as_view(),
        name="checkout-validate-cart",
    ),
]
