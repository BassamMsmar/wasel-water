from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

from .api import (
    AddressViewSet,
    CustomerViewSet,
    IdentifierLoginView,
    LocationSyncView,
    OTPRequestView,
    OTPVerifyView,
    ProfileView,
    RegisterView,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'addresses', AddressViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('auth/identifier-login/', IdentifierLoginView.as_view(), name='auth_identifier_login'),
    path('auth/location/', LocationSyncView.as_view(), name='auth_location_sync'),
    path('auth/otp/request/', OTPRequestView.as_view(), name='auth_otp_request'),
    path('auth/otp/verify/', OTPVerifyView.as_view(), name='auth_otp_verify'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/profile/', ProfileView.as_view(), name='auth_profile'),
]
