import os
import secrets
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Initialize default users for the dashboard from environment or secure random passwords'
    
    def handle(self, *args, **options):
        with transaction.atomic():
            created_users = []
            
            # Create default admin user
            if not User.objects.filter(username='admin').exists():
                admin_pass = os.environ.get('DJANGO_ADMIN_PASSWORD') or secrets.token_urlsafe(16)
                admin_user = User.objects.create_user(
                    username='admin',
                    password=admin_pass,
                    role='admin',
                    is_staff=True,
                    is_superuser=True
                )
                created_users.append('admin')
                self.stdout.write(
                    self.style.SUCCESS(f'Admin user created with username: admin')
                )
                if not os.environ.get('DJANGO_ADMIN_PASSWORD'):
                    self.stdout.write(
                        self.style.NOTICE(f'Generated random password for admin: {admin_pass}')
                    )
            else:
                self.stdout.write(
                    self.style.WARNING('Admin user already exists')
                )
            
            # Create default viewer user
            if not User.objects.filter(username='viewer').exists():
                viewer_pass = os.environ.get('DJANGO_VIEWER_PASSWORD') or secrets.token_urlsafe(16)
                viewer_user = User.objects.create_user(
                    username='viewer',
                    password=viewer_pass,
                    role='viewer'
                )
                created_users.append('viewer')
                self.stdout.write(
                    self.style.SUCCESS(f'Viewer user created with username: viewer')
                )
                if not os.environ.get('DJANGO_VIEWER_PASSWORD'):
                    self.stdout.write(
                        self.style.NOTICE(f'Generated random password for viewer: {viewer_pass}')
                    )
            else:
                self.stdout.write(
                    self.style.WARNING('Viewer user already exists')
                )
            
            if created_users:
                self.stdout.write(
                    self.style.SUCCESS(f'\nSuccessfully created {len(created_users)} user(s): {", ".join(created_users)}')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS('\nAll default users already exist')
                )