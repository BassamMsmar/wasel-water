from django.urls import path
from .views import (
    DashboardView, SettingsView, AddressListView, ProfileView, PaymentMethodsView,
    AddressCreateView, AddressUpdateView, AddressDeleteView, SignUpView, save_temp_location
)

app_name = 'accounts'

urlpatterns = [
    path('save-temp-location/', save_temp_location, name='save_temp_location'),
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
