"""
URL Configuration — API-Only Mode
Frontend: Next.js (http://localhost:3000)
Backend API: /api/v1/
Admin: /admin/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView




urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # REST API
    path('api/v1/', include('project.api_urls')),

    # API Documentation (Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='api-schema'), name='swagger-ui'),

    # Allauth (Google OAuth callback — API flow)
    path('accounts/social/', include('allauth.urls')),
]

# Media files (في الإنتاج يُعالجها Nginx)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Debug Toolbar — في وضع التطوير فقط
if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
