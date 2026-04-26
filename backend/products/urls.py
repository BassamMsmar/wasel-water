from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .api import (
    ProductViewSet, BrandViewSet, CategoryViewSet,
    OfferViewSet, ReviewViewSet, BundleViewSet, BundleItemViewSet,
    FlagViewSet, FeaturedProductViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'offers', OfferViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'bundles', BundleViewSet)
router.register(r'bundle-items', BundleItemViewSet)
router.register(r'flags', FlagViewSet)
router.register(r'featured-products', FeaturedProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
]