from django.urls import path
from .views import (
    home, about, contact, privacy, tos, return_policy,
    AdminDashboardView, AdminProductListView, AdminProductCreateView, AdminProductUpdateView,
    AdminOrderListView, AdminOrderCreateView, AdminOrderUpdateStatusView, AdminOrderDetailView, AdminOrderUpdateView,
    AdminCustomerListView, AdminOfferListView, AdminOfferCreateView, AdminOfferUpdateView, AdminStaffListView,
    AdminBrandListView, AdminBrandCreateView, AdminBrandUpdateView,
    AdminCategoryListView, AdminCategoryCreateView, AdminCategoryUpdateView
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
    
    # Products
    path('admin/products/', AdminProductListView.as_view(), name='admin_products'),
    path('admin/products/add/', AdminProductCreateView.as_view(), name='admin_product_create'),
    path('admin/products/<int:pk>/edit/', AdminProductUpdateView.as_view(), name='admin_product_update'),
    
    # Categories
    path('admin/categories/', AdminCategoryListView.as_view(), name='admin_categories'),
    path('admin/categories/add/', AdminCategoryCreateView.as_view(), name='admin_category_create'),
    path('admin/categories/<int:pk>/edit/', AdminCategoryUpdateView.as_view(), name='admin_category_update'),

    # Brands
    path('admin/brands/', AdminBrandListView.as_view(), name='admin_brands'),
    path('admin/brands/add/', AdminBrandCreateView.as_view(), name='admin_brand_create'),
    path('admin/brands/<int:pk>/edit/', AdminBrandUpdateView.as_view(), name='admin_brand_update'),

    # Offers
    path('admin/offers/', AdminOfferListView.as_view(), name='admin_offers'),
    path('admin/offers/add/', AdminOfferCreateView.as_view(), name='admin_offer_create'),
    path('admin/offers/<int:pk>/edit/', AdminOfferUpdateView.as_view(), name='admin_offer_update'),

    # Orders
    path('admin/orders/', AdminOrderListView.as_view(), name='admin_orders'),
    path('admin/orders/add/', AdminOrderCreateView.as_view(), name='admin_order_create'),
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin_order_detail'),
    path('admin/orders/<int:pk>/edit/', AdminOrderUpdateView.as_view(), name='admin_order_update'),
    path('admin/orders/<int:pk>/status/', AdminOrderUpdateStatusView.as_view(), name='admin_order_update_status'),

    path('admin/customers/', AdminCustomerListView.as_view(), name='admin_customers'),
    path('admin/staff/', AdminStaffListView.as_view(), name='admin_staff'),
]
