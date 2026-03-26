from django.urls import path
from .views import home, about, contact, privacy, tos, return_policy


app_name = 'settings'
urlpatterns = [
    path('home/', home, name='home'),
    path('about/', about, name='about'),
    path('contact/', contact, name='contact'),
    path('privacy-policy/', privacy, name='privacy'),
    path('terms-of-service/', tos, name='tos'),
    path('return-policy/', return_policy, name='return_policy'),
]

