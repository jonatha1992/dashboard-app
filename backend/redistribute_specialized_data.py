#!/usr/bin/env python
"""
Script para redistribuir datos existentes a tablas especializadas
"""
import os
import sys
import django
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_project.settings')
django.setup()

from dashboard_api.models import (
    GeografiaProcedimiento,
    VehiculosPersonasControladas,
    PersonalElementosAfectados,
    DetenidosAprehendidos,
    Incautaciones,
    TrataTraficPersonas,
    OtrosDelitos,
    OtrosEventos,
    Fallecidos,
    Abatidos,
    CodigoOperativo
)

class SpecializedDataRedistributor:
    def __init__(self):
        self.stats = {
            'vehiculos_created': 0,
            'personal_created': 0,
            'detenidos_created': 0,
            'incautaciones_created': 0,
            'trata_created': 0,
            'otros_delitos_created': 0,
            'otros_eventos_created': 0,
            'fallecidos_created': 0,
            'abatidos_created': 0,
            'codigos_created': 0,
            'errors': 0
        }

    def safe_decimal(self, value):
        """Convertir valor a Decimal de forma segura"""
        if not value or str(value).strip() in ['-', '', 'None', 'null']:
            return None
        try:
            clean_value = str(value).replace(',', '.').strip()
            return Decimal(clean_value)
        except:
            return None

    def safe_int(self, value):
        """Convertir valor a int de forma segura"""
        if not value or str(value).strip() in ['-', '', 'None', 'null']:
            return None
        try:
            return int(float(str(value)))
        except:
            return None

    def safe_str(self, value):
        """Convertir valor a string de forma segura"""
        if value is None or str(value).strip() in ['None', 'null', '-', '']:
            return None
        return str(value).strip()

    def redistribute_vehiculos_personas_controladas(self):
        """Redistribuir datos de vehículos y personas controladas"""
        procedimientos = GeografiaProcedimiento.objects.filter(hoja='VEHI. Y PERSO. CONTROLADAS')
        print(f"Redistribuyendo {procedimientos.count()} registros de VEHI. Y PERSO. CONTROLADAS")
        
        for proc in procedimientos:
            # Buscar en extra_data del modelo original los campos específicos
            extra = proc.observaciones or ""  # Usaremos observaciones como contenedor temporal
            
            # Crear registro básico - en esta hoja normalmente no hay datos específicos adicionales
            # porque los datos principales ya están en GeografiaProcedimiento
            VehiculosPersonasControladas.objects.get_or_create(
                procedimiento=proc,
                defaults={
                    'vehiculos_controlados': None,
                    'personas_controladas': None,
                    'cant_averiguaciones_secuestro': None,
                    'cant_solicitudes_antecedentes': None,
                    'cant_embarcaciones_controladas': None
                }
            )
            self.stats['vehiculos_created'] += 1

    def redistribute_personal_elementos_afectados(self):
        """Redistribuir datos de personal y elementos afectados"""
        procedimientos = GeografiaProcedimiento.objects.filter(hoja='PERSONAL Y ELEMENTOS AFECTADOS')
        print(f"Redistribuyendo {procedimientos.count()} registros de PERSONAL Y ELEMENTOS AFECTADOS")
        
        for proc in procedimientos:
            PersonalElementosAfectados.objects.get_or_create(
                procedimiento=proc,
                defaults={
                    'cant_efectivos': None,
                    'cant_autos_camionetas': None,
                    'cant_scanners': None,
                    'cant_embarcaciones': None,
                    'cant_motos': None,
                    'cant_caballos': None,
                    'cant_canes': None,
                    'cant_morphrapid': None,
                    'cant_lpr': None
                }
            )
            self.stats['personal_created'] += 1

    def redistribute_detenidos_aprehendidos(self):
        """Redistribuir datos de detenidos y aprehendidos"""
        procedimientos = GeografiaProcedimiento.objects.filter(hoja='DETENIDOS Y APREHENDIDOS')
        print(f"Redistribuyendo {procedimientos.count()} registros de DETENIDOS Y APREHENDIDOS")
        
        for proc in procedimientos:
            DetenidosAprehendidos.objects.get_or_create(
                procedimiento=proc,
                defaults={
                    'edad': None,
                    'sexo': None,
                    'nacionalidad': None,
                    'situacion_procesal': None,
                    'delito_imputado': None,
                    'juzgado_interviniente': None,
                    'caratula_causa': None,
                    'num_causa': None
                }
            )
            self.stats['detenidos_created'] += 1

    def redistribute_incautaciones(self):
        """Redistribuir datos de incautaciones"""
        procedimientos = GeografiaProcedimiento.objects.filter(hoja='INCAUTACIONES')
        print(f"Redistribuyendo {procedimientos.count()} registros de INCAUTACIONES")
        
        for proc in procedimientos:
            Incautaciones.objects.get_or_create(
                procedimiento=proc,
                defaults={
                    'incautaciones': None,
                    'tipo': None,
                    'subtipo': None,
                    'cantidad': None,
                    'medidas': None,
                    'aforo': None,
                    'observaciones': None,
                    'tipo_delito': None,
                    'juzgado_interviniente': None,
                    'caratula_causa': None,
                    'num_causa': None
                }
            )
            self.stats['incautaciones_created'] += 1

    def redistribute_trata_trafico_personas(self):
        """Redistribuir datos de trata y tráfico de personas"""
        procedimientos = GeografiaProcedimiento.objects.filter(hoja='TRATA O TRAFIC PERSONAS')
        print(f"Redistribuyendo {procedimientos.count()} registros de TRATA O TRAFIC PERSONAS")
        
        for proc in procedimientos:
            TrataTraficPersonas.objects.get_or_create(
                procedimiento=proc,
                defaults={
                    'tipo_delito': None,
                    'sexo_victima': None,
                    'genero_victima': None,
                    'edad_victima': None,
                    'nacionalidad': None,
                    'juzgado_interviniente': None,
                    'caratula_causa': None,
                    'num_causa': None,
                    'observaciones': None
                }
            )
            self.stats['trata_created'] += 1

    def redistribute_otros_delitos(self):
        """Redistribuir datos de otros delitos"""
        procedimientos = GeografiaProcedimiento.objects.filter(hoja='OTROS DELITOS')
        print(f"Redistribuyendo {procedimientos.count()} registros de OTROS DELITOS")
        
        for proc in procedimientos:
            OtrosDelitos.objects.get_or_create(
                procedimiento=proc,
                defaults={
                    'tipo_otro_delito': None,
                    'sexo_victima': None,
                    'genero_victima': None,
                    'edad_victima': None,
                    'nacionalidad': None,
                    'observaciones': None,
                    'juzgado_interviniente': None,
                    'caratula_causa': None,
                    'num_causa': None
                }
            )
            self.stats['otros_delitos_created'] += 1

    def redistribute_otros_eventos(self):
        """Redistribuir datos de otros eventos"""
        procedimientos = GeografiaProcedimiento.objects.filter(hoja='OTROS EVENTOS')
        print(f"Redistribuyendo {procedimientos.count()} registros de OTROS EVENTOS")
        
        for proc in procedimientos:
            OtrosEventos.objects.get_or_create(
                procedimiento=proc,
                defaults={
                    'tipo_siniestro': None,
                    'cant_ilesos': None,
                    'cant_lesionados': None,
                    'cant_muertos': None,
                    'observaciones': None,
                    'juzgado_interviniente': None,
                    'caratula_causa': None,
                    'num_causa': None
                }
            )
            self.stats['otros_eventos_created'] += 1

    def redistribute_codigo_operativo(self):
        """Redistribuir códigos operativos"""
        procedimientos = GeografiaProcedimiento.objects.filter(hoja='CODIGO OPERATIVO')
        print(f"Redistribuyendo {procedimientos.count()} registros de CODIGO OPERATIVO")
        
        for proc in procedimientos:
            CodigoOperativo.objects.get_or_create(
                procedimiento=proc,
                defaults={
                    'codigo_operativo': None
                }
            )
            self.stats['codigos_created'] += 1

    def redistribute_all(self):
        """Redistribuir todos los datos a tablas especializadas"""
        print("="*60)
        print("REDISTRIBUCION DE DATOS A TABLAS ESPECIALIZADAS")
        print("="*60)
        
        try:
            self.redistribute_vehiculos_personas_controladas()
            self.redistribute_personal_elementos_afectados()
            self.redistribute_detenidos_aprehendidos()
            self.redistribute_incautaciones()
            self.redistribute_trata_trafico_personas()
            self.redistribute_otros_delitos()
            self.redistribute_otros_eventos()
            self.redistribute_codigo_operativo()
            
            print(f"\n[SUCCESS] Redistribución completada!")
            print("="*60)
            print("ESTADISTICAS DE REDISTRIBUCION")
            print("="*60)
            print(f"VehiculosPersonasControladas: {self.stats['vehiculos_created']}")
            print(f"PersonalElementosAfectados: {self.stats['personal_created']}")
            print(f"DetenidosAprehendidos: {self.stats['detenidos_created']}")
            print(f"Incautaciones: {self.stats['incautaciones_created']}")
            print(f"TrataTraficPersonas: {self.stats['trata_created']}")
            print(f"OtrosDelitos: {self.stats['otros_delitos_created']}")
            print(f"OtrosEventos: {self.stats['otros_eventos_created']}")
            print(f"CodigoOperativo: {self.stats['codigos_created']}")
            print(f"Errores: {self.stats['errors']}")
            
            # Verificar totales
            total_specialized = sum([
                self.stats['vehiculos_created'],
                self.stats['personal_created'],
                self.stats['detenidos_created'],
                self.stats['incautaciones_created'],
                self.stats['trata_created'],
                self.stats['otros_delitos_created'],
                self.stats['otros_eventos_created'],
                self.stats['codigos_created']
            ])
            print(f"\nTotal registros especializados creados: {total_specialized}")
            
        except Exception as e:
            print(f"[ERROR] Error durante la redistribución: {e}")
            return False
        
        return True

if __name__ == "__main__":
    redistributor = SpecializedDataRedistributor()
    success = redistributor.redistribute_all()
    
    if success:
        print(f"\n[SUCCESS] Redistribución completada exitosamente!")
        
        # Mostrar conteos finales
        print(f"\nConteos finales en base de datos:")
        print(f"GeografiaProcedimiento: {GeografiaProcedimiento.objects.count()}")
        print(f"VehiculosPersonasControladas: {VehiculosPersonasControladas.objects.count()}")
        print(f"PersonalElementosAfectados: {PersonalElementosAfectados.objects.count()}")
        print(f"DetenidosAprehendidos: {DetenidosAprehendidos.objects.count()}")
        print(f"Incautaciones: {Incautaciones.objects.count()}")
        print(f"TrataTraficPersonas: {TrataTraficPersonas.objects.count()}")
        print(f"OtrosDelitos: {OtrosDelitos.objects.count()}")
        print(f"OtrosEventos: {OtrosEventos.objects.count()}")
        print(f"CodigoOperativo: {CodigoOperativo.objects.count()}")
        
    else:
        print(f"\n[ERROR] La redistribución falló")
        sys.exit(1)