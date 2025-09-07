#!/usr/bin/env python
"""
Script temporal para analizar la estructura de la base de datos
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_project.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from dashboard_api.models import GeografiaProcedimiento, DetenidosAprehendidos, Incautaciones, VehiculosPersonasControladas

def analyze_db_structure():
    print("=== ANALISIS DE ESTRUCTURA DE BASE DE DATOS ===\n")
    
    # Analizar tabla maestra
    total_procedimientos = GeografiaProcedimiento.objects.count()
    print(f"Total de procedimientos en GeografiaProcedimiento: {total_procedimientos}")
    
    if total_procedimientos > 0:
        print("\n--- EJEMPLOS DE PROCEDIMIENTOS ---")
        for i, obj in enumerate(GeografiaProcedimiento.objects.all()[:5]):
            print(f"{i+1}. ID_OPERATIVO: '{obj.id_operativo}' | ID_PROCEDIMIENTO: '{obj.id_procedimiento}'")
            print(f"   Descripción: {obj.descripcion[:50] if obj.descripcion else 'N/A'}...")
            print(f"   Provincia: {obj.provincia}")
            print(f"   Fecha: {obj.fecha_iso}")
            print()
    
    # Analizar relaciones
    print("\n--- ANALISIS DE RELACIONES ---")
    
    # Detenidos
    total_detenidos = DetenidosAprehendidos.objects.count()
    print(f"Total de detenidos: {total_detenidos}")
    if total_detenidos > 0:
        detenido = DetenidosAprehendidos.objects.first()
        print(f"   Ejemplo: Relacionado con procedimiento '{detenido.procedimiento.id_operativo}'")
    
    # Incautaciones  
    total_incautaciones = Incautaciones.objects.count()
    print(f"Total de incautaciones: {total_incautaciones}")
    if total_incautaciones > 0:
        incautacion = Incautaciones.objects.first()
        print(f"   Ejemplo: Relacionado con procedimiento '{incautacion.procedimiento.id_operativo}'")
    
    # Vehiculos controlados
    total_vehiculos = VehiculosPersonasControladas.objects.count()
    print(f"Total de vehiculos/personas controladas: {total_vehiculos}")
    if total_vehiculos > 0:
        vehiculo = VehiculosPersonasControladas.objects.first()
        print(f"   Ejemplo: Relacionado con procedimiento '{vehiculo.procedimiento.id_operativo}'")
    
    # Analizar ID_OPERATIVO unicos
    print("\n--- ANALISIS DE ID_OPERATIVO ---")
    
    operativos_unicos = GeografiaProcedimiento.objects.values('id_operativo').distinct().count()
    print(f"ID_OPERATIVO unicos: {operativos_unicos}")
    print(f"Total de procedimientos: {total_procedimientos}")
    
    if operativos_unicos < total_procedimientos:
        print("ATENCION: Hay mas procedimientos que operativos unicos")
        print("   Esto significa que un ID_OPERATIVO tiene multiples ID_PROCEDIMIENTO")
        
        # Mostrar ejemplos de operativos con multiples procedimientos
        from django.db.models import Count
        multiples = GeografiaProcedimiento.objects.values('id_operativo').annotate(
            total=Count('id_procedimiento')
        ).filter(total__gt=1)[:3]
        
        print("\n   Ejemplos de ID_OPERATIVO con multiples procedimientos:")
        for multiple in multiples:
            print(f"   - ID_OPERATIVO '{multiple['id_operativo']}' tiene {multiple['total']} procedimientos")
            procs = GeografiaProcedimiento.objects.filter(id_operativo=multiple['id_operativo'])
            for proc in procs:
                print(f"     - ID_PROCEDIMIENTO: '{proc.id_procedimiento}'")
    else:
        print("OK: Relacion 1:1 entre ID_OPERATIVO e ID_PROCEDIMIENTO")

if __name__ == "__main__":
    analyze_db_structure()