#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script simple para poblar las tablas dimensionales
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_project.settings')
django.setup()

from dashboard_api.models import Regional, UnidadOperativa, TipoOperativo, TipoDelito

def poblar_regionales():
    """Crear regionales basicas"""
    regionales_data = [
        ('RG1', 'Regional 1', 'Buenos Aires y CABA'),
        ('RG2', 'Regional 2', 'Centro del pais'),
        ('RG3', 'Regional 3', 'Norte del pais'),
        ('RG4', 'Regional 4', 'Litoral'),
        ('RG5', 'Regional 5', 'Patagonia'),
    ]
    
    created = 0
    for codigo, nombre, desc in regionales_data:
        regional, was_created = Regional.objects.get_or_create(
            codigo_regional=codigo,
            defaults={'nombre_regional': nombre, 'descripcion': desc}
        )
        if was_created:
            created += 1
            print(f"  [OK] Regional creada: {regional}")
    
    return created

def poblar_unidades():
    """Crear unidades operativas basicas"""
    try:
        rg1 = Regional.objects.get(codigo_regional='RG1')
        rg2 = Regional.objects.get(codigo_regional='RG2')
    except Regional.DoesNotExist:
        print("[ERROR] Primero deben crearse las regionales")
        return 0
    
    unidades_data = [
        (rg1, 'EZE', 'Ezeiza', 'Buenos_Aires', 'Jose M. Ezeiza'),
        (rg1, 'AER', 'Aeroporto', 'C.A.B.A.', 'Comuna 14'),
        (rg2, 'MDZ', 'Mendoza', 'Mendoza', 'Las Heras'),
        (rg2, 'COR', 'Cordoba', 'Cordoba', 'Capital'),
    ]
    
    created = 0
    for regional, codigo, nombre, provincia, depto in unidades_data:
        unidad, was_created = UnidadOperativa.objects.get_or_create(
            codigo_unidad=codigo,
            defaults={
                'regional': regional,
                'nombre_unidad': nombre,
                'provincia': provincia,
                'departamento_partido_comuna': depto
            }
        )
        if was_created:
            created += 1
            print(f"  [OK] Unidad creada: {unidad}")
    
    return created

def poblar_tipos_operativo():
    """Crear tipos operativos basicos"""
    operativos_data = [
        (1, 'Barrios Seguros', 'Operativo de seguridad en barrios', 'GENERAL'),
        (2, 'Estaciones Seguras', 'Seguridad en estaciones de tren', 'GENERAL'),
        (6001, 'PFA - Rutas Seguras', 'Control en rutas', 'PFA'),
        (6003, 'PFA - Prevencion Federal', 'Operativos preventivos', 'PFA'),
    ]
    
    created = 0
    for codigo, nombre, alcance, categoria in operativos_data:
        tipo_op, was_created = TipoOperativo.objects.get_or_create(
            codigo_operativo=codigo,
            defaults={
                'nombre_operativo': nombre,
                'alcance': alcance,
                'categoria': categoria
            }
        )
        if was_created:
            created += 1
            print(f"  [OK] Tipo operativo creado: {tipo_op}")
    
    return created

def poblar_tipos_delito():
    """Crear tipos de delito basicos"""
    tipos_delito = [
        ('detencion', 'Narcotrafico', 'Delitos relacionados con drogas', 'grave'),
        ('detencion', 'Contrabando', 'Introduccion ilegal de mercaderias', 'moderada'),
        ('incautacion', 'Drogas', 'Sustancias estupefacientes', 'grave'),
        ('incautacion', 'Armas de fuego', 'Armas y municiones', 'muy_grave'),
        ('trata', 'Trata de personas', 'Explotacion de personas', 'muy_grave'),
        ('abatido', 'Enfrentamiento armado', 'Persona abatida en enfrentamiento', 'muy_grave'),
    ]
    
    created = 0
    for categoria, subcategoria, descripcion, gravedad in tipos_delito:
        tipo_delito, was_created = TipoDelito.objects.get_or_create(
            categoria=categoria,
            subcategoria=subcategoria,
            defaults={'descripcion': descripcion, 'gravedad': gravedad}
        )
        if was_created:
            created += 1
            print(f"  [OK] Tipo delito creado: {tipo_delito}")
    
    return created

def main():
    print("[INICIO] Poblacion de tablas dimensionales...")
    print("=" * 50)
    
    regionales = poblar_regionales()
    print(f"[INFO] {regionales} regionales creadas")
    
    unidades = poblar_unidades()
    print(f"[INFO] {unidades} unidades creadas")
    
    operativos = poblar_tipos_operativo()
    print(f"[INFO] {operativos} tipos operativo creados")
    
    delitos = poblar_tipos_delito()
    print(f"[INFO] {delitos} tipos delito creados")
    
    print("\n[RESUMEN FINAL]")
    print(f"  Regionales: {Regional.objects.count()}")
    print(f"  Unidades: {UnidadOperativa.objects.count()}")
    print(f"  Tipos Operativo: {TipoOperativo.objects.count()}")
    print(f"  Tipos Delito: {TipoDelito.objects.count()}")
    print("[OK] Poblacion completada!")

if __name__ == '__main__':
    main()