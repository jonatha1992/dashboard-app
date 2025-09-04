from django.apps import AppConfig


class DashboardApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard_api'
    
    def ready(self):
        """
        App ready hook - avoid database operations here
        """
        # Database operations moved to setup.py management command
        # to avoid RuntimeWarning during app initialization
        pass