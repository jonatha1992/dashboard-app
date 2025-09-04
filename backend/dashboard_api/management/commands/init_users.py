from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Initialize default users for the dashboard'
    
    def handle(self, *args, **options):
        with transaction.atomic():
            created_users = []
            
            # Create default admin user
            if not User.objects.filter(username='admin').exists():
                admin_user = User.objects.create_user(
                    username='admin',
                    password='admin123',
                    role='admin',
                    is_staff=True,
                    is_superuser=True
                )
                created_users.append('admin')
                self.stdout.write(
                    self.style.SUCCESS('✅ Admin user created: admin/admin123')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('⚠️ Admin user already exists')
                )
            
            # Create default viewer user
            if not User.objects.filter(username='viewer').exists():
                viewer_user = User.objects.create_user(
                    username='viewer',
                    password='viewer123',
                    role='viewer'
                )
                created_users.append('viewer')
                self.stdout.write(
                    self.style.SUCCESS('✅ Viewer user created: viewer/viewer123')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('⚠️ Viewer user already exists')
                )
            
            if created_users:
                self.stdout.write(
                    self.style.SUCCESS(f'\n🎉 Successfully created {len(created_users)} user(s): {", ".join(created_users)}')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS('\n✅ All default users already exist')
                )