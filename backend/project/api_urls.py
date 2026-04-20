from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

from accounts.api import CustomerViewSet, AddressViewSet, RegisterView, ProfileView
from products.api import (
    ProductViewSet, BrandViewSet, CategoryViewSet,
    OfferViewSet, ReviewViewSet, BundleViewSet, BundleItemViewSet
)
from orders.api import CheckoutAPIView, OrderViewSet, OrderItemViewSet
from cart.api import CartViewSet
from core.api import SectionViewSet, CompanyViewSet, BannerViewSet

router = DefaultRouter()

# Accounts
router.register(r'customers', CustomerViewSet)
router.register(r'addresses', AddressViewSet)

# Products
router.register(r'products', ProductViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'offers', OfferViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'bundles', BundleViewSet)
router.register(r'bundle-items', BundleItemViewSet)

# Orders
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)

# Cart
router.register(r'cart', CartViewSet)

# Core
router.register(r'sections', SectionViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'banners', BannerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', CheckoutAPIView.as_view(), name='api_checkout'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/profile/', ProfileView.as_view(), name='auth_profile'),
]
