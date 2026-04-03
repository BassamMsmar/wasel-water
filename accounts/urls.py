from django.urls import path
from .views import (
    DashboardView, SettingsView, AddressListView, ProfileView, PaymentMethodsView,
    AddressCreateView, AddressUpdateView, AddressDeleteView, SignUpView,
    save_temp_location, save_user_location,
    otp_login_page_view, otp_request_view, otp_verify_view, traditional_login_view
)

app_name = 'accounts'

urlpatterns = [
    path('login/', otp_login_page_view, name='login'),
    path('otp/request/', otp_request_view, name='otp_request'),
    path('otp/verify/', otp_verify_view, name='otp_verify'),
    path('traditional-login/', traditional_login_view, name='traditional_login'),
    path('save-temp-location/', save_temp_location, name='save_temp_location'),
    path('save-location/', save_user_location, name='save_user_location'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('profile/', ProfileView.as_view(), name='profile_detail'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('addresses/', AddressListView.as_view(), name='address_list'),
    path('addresses/add/', AddressCreateView.as_view(), name='address_create'),
    path('addresses/<int:pk>/edit/', AddressUpdateView.as_view(), name='address_update'),
    path('addresses/<int:pk>/delete/', AddressDeleteView.as_view(), name='address_delete'),
    path('payment-methods/', PaymentMethodsView.as_view(), name='payment_methods'),
]
