#!/usr/bin/env python
"""
Script para respaldar datos actuales antes de migrar a la nueva estructura
"""
import os
import sys
import django
import json
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_project.settings')
django.setup()

from dashboard_api.models import OperationalData

def backup_current_data():
    """Respaldar todos los datos actuales a un archivo JSON"""
    
    print("[INFO] Iniciando respaldo de datos actuales...")
    
    # Obtener todos los datos
    try:
        all_data = OperationalData.objects.all()
        total_records = all_data.count()
        print(f"[INFO] Total de registros a respaldar: {total_records}")
        
        if total_records == 0:
            print("[WARN] No hay datos para respaldar")
            return
        
        # Preparar datos para serialización
        backup_data = []
        
        for i, record in enumerate(all_data, 1):
            if i % 100 == 0:  # Progreso cada 100 registros
                print(f"[INFO] Procesando registro {i}/{total_records}")
            
            # Serializar cada registro manualmente para evitar problemas
            record_data = {
                'id': record.id,
                'id_operativo': record.id_operativo,
                'id_procedimiento': record.id_procedimiento,
                'fuerza_interviniente': record.fuerza_interviniente,
                'unidad_interviniente': record.unidad_interviniente,
                'descripcion': record.descripcion,
                'tipo_intervencion': record.tipo_intervencion,
                'provincia': record.provincia,
                'provincia_key': record.provincia_key,
                'departamento_o_partido': record.departamento_o_partido,
                'localidad': record.localidad,
                'direccion': record.direccion,
                'latitud': str(record.latitud) if record.latitud else None,
                'longitud': str(record.longitud) if record.longitud else None,
                'fecha': record.fecha,
                'fecha_iso': record.fecha_iso.isoformat() if record.fecha_iso else None,
                'hora': record.hora,
                'zona_seguridad_fronteras': record.zona_seguridad_fronteras,
                'paso_fronterizo': record.paso_fronterizo,
                'otras_agencias_intervinientes': record.otras_agencias_intervinientes,
                'observaciones': record.observaciones,
                'hoja': record.hoja,
                'archivo_original': record.archivo_original,
                'fecha_importacion': record.fecha_importacion.isoformat() if record.fecha_importacion else None,
                'record_key': record.record_key,
                'extra_data': record.extra_data,
            }
            backup_data.append(record_data)
        
        # Crear archivo de respaldo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"operational_data_backup_{timestamp}.json"
        backup_path = os.path.join(os.path.dirname(__file__), backup_filename)
        
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump({
                'backup_timestamp': timestamp,
                'total_records': total_records,
                'data': backup_data
            }, f, indent=2, ensure_ascii=False)
        
        print(f"[SUCCESS] Respaldo completado exitosamente!")
        print(f"[INFO] Archivo: {backup_path}")
        print(f"[INFO] Registros respaldados: {total_records}")
        
        return backup_path
        
    except Exception as e:
        print(f"[ERROR] Error durante el respaldo: {e}")
        return None

def verify_backup(backup_path):
    """Verificar la integridad del respaldo"""
    print(f"\n[INFO] Verificando respaldo: {backup_path}")
    
    try:
        with open(backup_path, 'r', encoding='utf-8') as f:
            backup_data = json.load(f)
        
        expected_records = backup_data['total_records']
        actual_records = len(backup_data['data'])
        
        if expected_records == actual_records:
            print(f"[SUCCESS] Verificación exitosa: {actual_records} registros")
            return True
        else:
            print(f"[ERROR] Error de verificación: esperados {expected_records}, encontrados {actual_records}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Error verificando respaldo: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("RESPALDO DE DATOS OPERACIONALES")
    print("="*60)
    
    backup_path = backup_current_data()
    
    if backup_path:
        if verify_backup(backup_path):
            print("\n[SUCCESS] Respaldo completado y verificado exitosamente!")
        else:
            print("\n[WARN] Respaldo completado pero falló la verificación")
    else:
        print("\n[ERROR] Error durante el proceso de respaldo")
        sys.exit(1)