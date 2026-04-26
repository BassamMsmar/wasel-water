from django.urls import path, include

urlpatterns = [
    path('', include('core.urls')),
    path('', include('accounts.urls')),
    path('', include('products.urls')),
    path('', include('orders.urls')),
    path('', include('cart.urls')),
]
