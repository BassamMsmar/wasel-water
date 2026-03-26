from django.urls import path
from .views import (
    home, about, contact, privacy, tos, return_policy,
    AdminDashboardView, AdminProductListView, AdminOrderListView,
    AdminCustomerListView, AdminOfferListView
)


app_name = 'settings'
urlpatterns = [
    path('home/', home, name='home'),
    path('about/', about, name='about'),
    path('contact/', contact, name='contact'),
    path('privacy-policy/', privacy, name='privacy'),
    path('terms-of-service/', tos, name='tos'),
    path('return-policy/', return_policy, name='return_policy'),

    # Admin Dashboard
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/products/', AdminProductListView.as_view(), name='admin_products'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin_orders'),
    path('admin/customers/', AdminCustomerListView.as_view(), name='admin_customers'),
    path('admin/offers/', AdminOfferListView.as_view(), name='admin_offers'),
]

