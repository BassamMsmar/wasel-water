from django.urls import path
from .views import CartList, CartCheckout, cart_add, cart_update, cart_remove

app_name = 'cart'
urlpatterns = [
    path('', CartList.as_view(), name='cart_detail'),
    path('checkout/', CartCheckout.as_view(), name='checkout'),
    path('add/', cart_add, name='cart_add'),
    path('update/', cart_update, name='cart_update'),
    path('remove/', cart_remove, name='cart_remove'),
]
