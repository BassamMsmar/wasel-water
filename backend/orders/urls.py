from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .api import CheckoutAPIView, OrderViewSet, OrderItemViewSet, BranchViewSet, OrderStatusViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'order-statuses', OrderStatusViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', CheckoutAPIView.as_view(), name='api_checkout'),
]
