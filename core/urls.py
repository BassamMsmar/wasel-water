from django.urls import path
from . import views
from .views import (
    home, about, contact, privacy, tos, return_policy,
    AdminDashboardView, AdminProductListView, AdminProductCreateView, AdminProductUpdateView, AdminProductDeleteView,
    AdminOrderListView, AdminOrderCreateView, AdminOrderUpdateStatusView, AdminOrderDetailView, AdminOrderUpdateView, AdminOrderDeleteView,
    AdminCustomerListView, AdminCustomerDeleteView, AdminOfferListView, AdminOfferCreateView, AdminOfferUpdateView, AdminOfferDeleteView,
    AdminStaffListView, AdminStaffCreateView, AdminStaffUpdateView, AdminStaffDeleteView,
    AdminBrandListView, AdminBrandCreateView, AdminBrandUpdateView, AdminBrandDeleteView,
    AdminCategoryListView, AdminCategoryCreateView, AdminCategoryUpdateView, AdminCategoryDeleteView
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
    path('admin/products/<int:pk>/delete/', AdminProductDeleteView.as_view(), name='admin_product_delete'),
    
    # Categories
    path('admin/categories/', AdminCategoryListView.as_view(), name='admin_categories'),
    path('admin/categories/add/', AdminCategoryCreateView.as_view(), name='admin_category_create'),
    path('admin/categories/<int:pk>/edit/', AdminCategoryUpdateView.as_view(), name='admin_category_update'),
    path('admin/categories/<int:pk>/delete/', AdminCategoryDeleteView.as_view(), name='admin_category_delete'),

    # Brands
    path('admin/brands/', AdminBrandListView.as_view(), name='admin_brands'),
    path('admin/brands/add/', AdminBrandCreateView.as_view(), name='admin_brand_create'),
    path('admin/brands/<int:pk>/edit/', AdminBrandUpdateView.as_view(), name='admin_brand_update'),
    path('admin/brands/<int:pk>/delete/', AdminBrandDeleteView.as_view(), name='admin_brand_delete'),

    # Offers
    path('admin/offers/', AdminOfferListView.as_view(), name='admin_offers'),
    path('admin/offers/add/', AdminOfferCreateView.as_view(), name='admin_offer_create'),
    path('admin/offers/<int:pk>/edit/', AdminOfferUpdateView.as_view(), name='admin_offer_update'),
    path('admin/offers/<int:pk>/delete/', AdminOfferDeleteView.as_view(), name='admin_offer_delete'),

    # Orders
    path('admin/orders/', AdminOrderListView.as_view(), name='admin_orders'),
    path('admin/orders/add/', AdminOrderCreateView.as_view(), name='admin_order_create'),
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin_order_detail'),
    path('admin/orders/<int:pk>/edit/', AdminOrderUpdateView.as_view(), name='admin_order_update'),
    path('admin/orders/<int:pk>/delete/', AdminOrderDeleteView.as_view(), name='admin_order_delete'),
    path('admin/orders/<int:pk>/status/', AdminOrderUpdateStatusView.as_view(), name='admin_order_update_status'),

    # Customers/Users
    path('admin/customers/', AdminCustomerListView.as_view(), name='admin_customers'),
    path('admin/customers/<int:pk>/delete/', AdminCustomerDeleteView.as_view(), name='admin_customer_delete'),
    
    # Staff
    path('admin/staff/', AdminStaffListView.as_view(), name='admin_staff'),
    path('admin/staff/add/', AdminStaffCreateView.as_view(), name='admin_staff_create'),
    path('admin/staff/<int:pk>/edit/', AdminStaffUpdateView.as_view(), name='admin_staff_update'),
    path('admin/staff/<int:pk>/delete/', AdminStaffDeleteView.as_view(), name='admin_staff_delete'),
]
