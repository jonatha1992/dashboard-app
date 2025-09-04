#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the path
sys.path.append('backend')
os.chdir('backend')

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_project.settings')
django.setup()

from dashboard_api.models import OperationalData

# Get unique dates
fechas = list(set(OperationalData.objects.values_list('fecha', flat=True)))
fechas_validas = [f for f in fechas if f and f != '-']
fechas_ordenadas = sorted(fechas_validas)

print('Primeras 10 fechas encontradas:', fechas_ordenadas[:10])
print('Últimas 10 fechas encontradas:', fechas_ordenadas[-10:])
print('Total fechas únicas:', len(fechas_ordenadas))

# Check if 31/01/2025 exists
if '31/01/2025' in fechas_validas:
    print('✅ 31/01/2025 SÍ está en los datos')
else:
    print('❌ 31/01/2025 NO está en los datos')