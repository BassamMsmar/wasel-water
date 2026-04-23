"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from core.views import home, custom_logout_view
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='swagger-ui', permanent=False), name='home'),
    path('admin/', admin.site.urls),
    path('store/', home, name='store-home'),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='api-schema'), name='swagger-ui'),
    
    # Authentication URLs
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('accounts/social/', include('allauth.urls')),  # Social Login (Google)
    path('accounts/logout/', custom_logout_view, name='logout'),
    path('accounts/', include('django.contrib.auth.urls')),  # Fallback
    path('products/', include('products.urls', namespace='products')),
    path('orders/', include('orders.urls', namespace='orders')),
    path('cart/', include('cart.urls', namespace='cart')),
    path('core/', include('core.urls', namespace='settings')),
    path('api/v1/', include('project.api_urls')),
    path('api-auth/', include('rest_framework.urls')),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
