"""
URL configuration for dashboard_project project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('dashboard_api.urls')),
    
    # Swagger/OpenAPI documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve React static files in production
if not settings.DEBUG:
    # Serve React build files
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
        # Catch-all pattern for React Router (must be last)
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
    ]
else:
    # Development static files
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # In development, serve React app like production
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
    ]