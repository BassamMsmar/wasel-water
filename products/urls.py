from django.urls import path
from .views import (
    ProductList, ProductDetail, BrandList, BrandDetail, 
    CategoryList, CategoryDetail, OfferList, OfferDetail, BundleList,
    export_products_excel, import_products_excel, download_product_template
)

app_name = 'products'

urlpatterns = [
    path('products/', ProductList.as_view(), name='product_list'),
    
    
    path('bundles/', BundleList.as_view(), name='bundle_list'), 
    path('brands/', BrandList.as_view(), name='brand_list'), 
    path('brands/<str:slug>', BrandDetail.as_view(), name='brand_detail'), 

    path('categories/', CategoryList.as_view(), name='category_list'), 
    path('categories/<str:slug>', CategoryDetail.as_view(), name='category_detail'), 

    path('offers/', OfferList.as_view(), name='offer_list'), 
    path('offers/<int:pk>', OfferDetail.as_view(), name='offer_detail'), 

    path('<str:slug>', ProductDetail.as_view(), name='product_detail'), 

    # Excel Import/Export
    path('excel/export/', export_products_excel, name='export_products_excel'),
    path('excel/import/', import_products_excel, name='import_products_excel'),
    path('excel/template/', download_product_template, name='download_product_template'),

]