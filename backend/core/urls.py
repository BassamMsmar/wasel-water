from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .api import SectionViewSet, CompanyViewSet, BannerViewSet

router = DefaultRouter()
router.register(r'sections', SectionViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'banners', BannerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
