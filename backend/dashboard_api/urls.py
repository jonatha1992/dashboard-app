from django.urls import path
from . import views
# Analysis views removed - DW system deleted

urlpatterns = [
    # Health check
    path('', views.HealthCheckView.as_view(), name='health-check'),
    
    # Authentication endpoints
    path('auth/login', views.LoginView.as_view(), name='login'),
    path('auth/me', views.CurrentUserView.as_view(), name='current-user'),
    
    # Data endpoints - Main endpoints used by frontend
    path('data', views.data_list_public, name='data-list'),
    path('data/stats', views.data_stats_public, name='data-stats'),
    path('data/specialized-stats', views.SpecializedTableStatsView.as_view(), name='specialized-stats'),
    path('data/filtering-stats', views.FilteringStatsView.as_view(), name='filtering-stats'),
    path('data/upload', views.DataUploadView.as_view(), name='data-upload'),
    path('data/clear', views.DataClearView.as_view(), name='data-clear'),
    
    # Specialized data endpoints
    path('data/detenidos', views.DetenidosListView.as_view(), name='data-detenidos'),
    path('data/incautaciones', views.IncautacionesListView.as_view(), name='data-incautaciones'),
    path('data/trata', views.TrataListView.as_view(), name='data-trata'),
    path('data/fallecidos', views.FallecidosListView.as_view(), name='data-fallecidos'),
    path('data/abatidos', views.AbatidosListView.as_view(), name='data-abatidos'),
    
    # Filtered specialized endpoints (only real data)
    path('data/filtered/incautaciones', views.FilteredIncautacionesView.as_view(), name='filtered-incautaciones'),
    path('data/filtered/detenidos', views.FilteredDetenidosView.as_view(), name='filtered-detenidos'),
    path('data/filtered/controlados', views.FilteredControladosView.as_view(), name='filtered-controlados'),
    path('data/filtered/afectados', views.FilteredAfectadosView.as_view(), name='filtered-afectados'),
    
    # Data Warehouse endpoints removed - DW system deleted
]