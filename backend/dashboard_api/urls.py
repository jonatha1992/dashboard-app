from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('', views.HealthCheckView.as_view(), name='health-check'),
    
    # Authentication endpoints
    path('auth/login', views.LoginView.as_view(), name='login'),
    path('auth/me', views.CurrentUserView.as_view(), name='current-user'),
    
    # Data endpoints
    path('data', views.DataListView.as_view(), name='data-list'),
    path('data/stats', views.DataStatsView.as_view(), name='data-stats'),
    path('data/upload', views.DataUploadView.as_view(), name='data-upload'),
    path('data/clear', views.DataClearView.as_view(), name='data-clear'),
]