import pandas as pd
from datetime import datetime, timedelta
from django.db.models import Avg, Sum, Count, Q, Min, Max
from .dw_models import DimTiempo, DimGeografia, FactProcedimientos, AggMensualProvincia, AggMensualDepartamento
from .models import GeografiaProcedimiento
import unicodedata
import re
import logging

logger = logging.getLogger('etl')

class DimensionETLProcessor:
    
    def get_dynamic_date_range(self):
        """Detectar rango de fechas automáticamente desde datos reales"""
        logger.info("Detectando rango de fechas dinámico desde datos operacionales")
        
        date_range = GeografiaProcedimiento.objects.filter(
            fecha_iso__isnull=False
        ).aggregate(
            min_fecha=Min('fecha_iso'),
            max_fecha=Max('fecha_iso')
        )
        
        if not date_range['min_fecha'] or not date_range['max_fecha']:
            # Fallback si no hay datos
            logger.warning("No se encontraron fechas válidas, usando rango por defecto")
            return '2025-01-01', '2025-12-31'
        
        # Extender el rango para tener buffer (1 mes antes y después)
        min_date = date_range['min_fecha']
        max_date = date_range['max_fecha']
        
        # Extender rango
        extended_min = min_date.replace(day=1)  # Primer día del mes
        if extended_min.month == 12:
            extended_max = max_date.replace(year=max_date.year + 1, month=1, day=31)
        else:
            try:
                extended_max = max_date.replace(month=max_date.month + 1, day=31)
            except ValueError:
                # Manejar meses con menos de 31 días
                extended_max = max_date.replace(month=max_date.month + 1, day=28)
        
        start_str = extended_min.strftime('%Y-%m-%d')
        end_str = extended_max.strftime('%Y-%m-%d')
        
        logger.info(f"Rango dinámico detectado: {start_str} a {end_str}")
        return start_str, end_str
    
    def populate_dim_tiempo(self, start_date=None, end_date=None):
        """Pobla la dimensión tiempo para el rango especificado o dinámico"""
        if not start_date or not end_date:
            start_date, end_date = self.get_dynamic_date_range()
        
        logger.info(f"Poblando dimensión tiempo desde {start_date} hasta {end_date} (dinámico)")
        print(f"Poblando dimensión tiempo desde {start_date} hasta {end_date}")
        
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        meses_nombres = {
            1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
            5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
            9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
        }
        
        dias_nombres = {
            0: 'Lunes', 1: 'Martes', 2: 'Miércoles', 3: 'Jueves',
            4: 'Viernes', 5: 'Sábado', 6: 'Domingo'
        }
        
        feriados_argentina = {
            # Feriados fijos 2025
            '2025-01-01': 'Año Nuevo',
            '2025-05-01': 'Día del Trabajador',
            '2025-05-25': 'Revolución de Mayo',
            '2025-07-09': 'Día de la Independencia',
            '2025-08-17': 'Paso a la Inmortalidad del General San Martín',
            '2025-12-08': 'Inmaculada Concepción de María',
            '2025-12-25': 'Navidad',
            # Agregar más feriados según necesidad
        }
        
        created_count = 0
        current_date = start
        
        while current_date <= end:
            if not DimTiempo.objects.filter(fecha_completa=current_date).exists():
                trimestre = (current_date.month - 1) // 3 + 1
                semestre = 1 if current_date.month <= 6 else 2
                fecha_str = current_date.strftime('%Y-%m-%d')
                
                DimTiempo.objects.create(
                    fecha_completa=current_date,
                    año=current_date.year,
                    mes=current_date.month,
                    dia=current_date.day,
                    trimestre=trimestre,
                    semestre=semestre,
                    nombre_mes=meses_nombres[current_date.month],
                    dia_semana=current_date.weekday(),
                    nombre_dia_semana=dias_nombres[current_date.weekday()],
                    es_fin_semana=current_date.weekday() >= 5,
                    es_feriado=fecha_str in feriados_argentina,
                    año_mes=current_date.strftime('%Y-%m'),
                    año_trimestre=f"{current_date.year}-Q{trimestre}",
                    año_semestre=f"{current_date.year}-S{semestre}"
                )
                created_count += 1
            
            current_date += timedelta(days=1)
        
        print(f"Creados {created_count} registros en DimTiempo")
        return created_count
    
    def populate_dim_geografia(self):
        """Pobla dimensión geografía desde datos existentes"""
        print("Poblando dimensión geografía desde GeografiaProcedimiento")
        
        # Obtener combinaciones únicas provincia/departamento
        unique_geo = GeografiaProcedimiento.objects.values(
            'provincia', 'departamento_o_partido', 'localidad',
            'zona_seguridad_fronteras'
        ).distinct()
        
        created_count = 0
        
        for geo in unique_geo:
            if geo['provincia'] and geo['departamento_o_partido']:
                provincia_key = self.normalize_provincia(geo['provincia'])
                departamento_key = self.normalize_departamento(geo['departamento_o_partido'])
                combined_key = f"{provincia_key}_{departamento_key}"
                
                if not DimGeografia.objects.filter(provincia_departamento_key=combined_key).exists():
                    # Calcular coordenadas promedio para este departamento
                    coords = GeografiaProcedimiento.objects.filter(
                        provincia_key=provincia_key,
                        departamento_o_partido__icontains=geo['departamento_o_partido']
                    ).exclude(
                        latitud__isnull=True, longitud__isnull=True
                    ).aggregate(
                        lat_prom=Avg('latitud'),
                        lng_prom=Avg('longitud')
                    )
                    
                    DimGeografia.objects.create(
                        provincia=geo['provincia'],
                        provincia_key=provincia_key,
                        departamento_o_partido=geo['departamento_o_partido'],
                        departamento_key=departamento_key,
                        localidad=geo['localidad'],
                        provincia_departamento_key=combined_key,
                        es_zona_fronteriza=bool(geo['zona_seguridad_fronteras']),
                        zona_seguridad_fronteras=geo['zona_seguridad_fronteras'],
                        latitud_promedio=coords['lat_prom'],
                        longitud_promedio=coords['lng_prom'],
                        region=self.get_region(geo['provincia'])
                    )
                    created_count += 1
        
        print(f"Creados {created_count} registros en DimGeografia")
        return created_count
    
    def transform_to_facts(self):
        """Transforma datos operacionales a tabla de hechos"""
        print("Transformando datos operacionales a tabla de hechos")
        
        operational_data = GeografiaProcedimiento.objects.filter(
            fecha_iso__isnull=False,
            provincia__isnull=False
        )
        
        created_count = 0
        updated_count = 0
        
        for record in operational_data:
            # Buscar dimensión tiempo correspondiente
            dim_tiempo = DimTiempo.objects.filter(fecha_completa=record.fecha_iso).first()
            if not dim_tiempo:
                print(f"No se encontró DimTiempo para fecha {record.fecha_iso}")
                continue
            
            # Buscar dimensión geografía correspondiente
            provincia_key = self.normalize_provincia(record.provincia)
            departamento_key = self.normalize_departamento(record.departamento_o_partido)
            combined_key = f"{provincia_key}_{departamento_key}"
            
            dim_geografia = DimGeografia.objects.filter(
                provincia_departamento_key=combined_key
            ).first()
            
            if not dim_geografia:
                print(f"No se encontró DimGeografia para {combined_key}")
                continue
            
            # Crear clave única para el fact
            fact_record_key = f"{record.id_operativo}_{record.id_procedimiento}_{record.hoja}"
            
            # Contar métricas relacionadas
            cantidad_detenidos = self.count_detenidos(record)
            cantidad_incautaciones = self.count_incautaciones(record)
            cantidad_vehiculos = self.count_vehiculos(record)
            
            # Crear o actualizar fact
            fact, created = FactProcedimientos.objects.update_or_create(
                record_key=fact_record_key,
                defaults={
                    'dim_tiempo': dim_tiempo,
                    'dim_geografia': dim_geografia,
                    'id_operativo': record.id_operativo or 'N/A',
                    'id_procedimiento': record.id_procedimiento or 'N/A',
                    'cantidad_procedimientos': 1,
                    'cantidad_detenidos': cantidad_detenidos,
                    'cantidad_incautaciones': cantidad_incautaciones,
                    'cantidad_vehiculos_controlados': cantidad_vehiculos,
                }
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        print(f"Creados {created_count} y actualizados {updated_count} registros en FactProcedimientos")
        return created_count, updated_count
    
    def calculate_monthly_aggregations(self):
        """Calcula agregaciones mensuales"""
        print("Calculando agregaciones mensuales")
        
        # Limpiar agregaciones existentes
        AggMensualProvincia.objects.all().delete()
        AggMensualDepartamento.objects.all().delete()
        
        # Agregaciones por provincia
        provincial_aggs = FactProcedimientos.objects.values(
            'dim_tiempo__año_mes',
            'dim_tiempo__año',
            'dim_tiempo__mes',
            'dim_tiempo__nombre_mes',
            'dim_geografia__provincia_key',
            'dim_geografia__provincia'
        ).annotate(
            total_procedimientos=Sum('cantidad_procedimientos'),
            total_detenidos=Sum('cantidad_detenidos'),
            total_incautaciones=Sum('cantidad_incautaciones'),
            total_vehiculos_controlados=Sum('cantidad_vehiculos_controlados')
        )
        
        provincia_count = 0
        for agg in provincial_aggs:
            AggMensualProvincia.objects.create(
                año_mes=agg['dim_tiempo__año_mes'],
                provincia_key=agg['dim_geografia__provincia_key'],
                provincia_nombre=agg['dim_geografia__provincia'],
                total_procedimientos=agg['total_procedimientos'] or 0,
                total_detenidos=agg['total_detenidos'] or 0,
                total_incautaciones=agg['total_incautaciones'] or 0,
                total_vehiculos_controlados=agg['total_vehiculos_controlados'] or 0,
                año=agg['dim_tiempo__año'],
                mes=agg['dim_tiempo__mes'],
                mes_nombre=agg['dim_tiempo__nombre_mes']
            )
            provincia_count += 1
        
        # Agregaciones por departamento
        departamental_aggs = FactProcedimientos.objects.values(
            'dim_tiempo__año_mes',
            'dim_tiempo__año',
            'dim_tiempo__mes',
            'dim_tiempo__nombre_mes',
            'dim_geografia__provincia_departamento_key',
            'dim_geografia__provincia_key',
            'dim_geografia__departamento_key',
            'dim_geografia__provincia',
            'dim_geografia__departamento_o_partido'
        ).annotate(
            total_procedimientos=Sum('cantidad_procedimientos'),
            total_detenidos=Sum('cantidad_detenidos'),
            total_incautaciones=Sum('cantidad_incautaciones'),
            total_vehiculos_controlados=Sum('cantidad_vehiculos_controlados')
        )
        
        departamento_count = 0
        for agg in departamental_aggs:
            AggMensualDepartamento.objects.create(
                año_mes=agg['dim_tiempo__año_mes'],
                provincia_departamento_key=agg['dim_geografia__provincia_departamento_key'],
                provincia_key=agg['dim_geografia__provincia_key'],
                departamento_key=agg['dim_geografia__departamento_key'],
                provincia_nombre=agg['dim_geografia__provincia'],
                departamento_nombre=agg['dim_geografia__departamento_o_partido'],
                total_procedimientos=agg['total_procedimientos'] or 0,
                total_detenidos=agg['total_detenidos'] or 0,
                total_incautaciones=agg['total_incautaciones'] or 0,
                total_vehiculos_controlados=agg['total_vehiculos_controlados'] or 0,
                año=agg['dim_tiempo__año'],
                mes=agg['dim_tiempo__mes'],
                mes_nombre=agg['dim_tiempo__nombre_mes']
            )
            departamento_count += 1
        
        print(f"Creadas {provincia_count} agregaciones provinciales y {departamento_count} departamentales")
        return provincia_count, departamento_count
    
    def run_full_etl(self):
        """Ejecuta el ETL completo"""
        print("=== INICIANDO ETL COMPLETO ===")
        
        try:
            # Paso 1: Poblar dimensión tiempo
            tiempo_count = self.populate_dim_tiempo()
            
            # Paso 2: Poblar dimensión geografía
            geo_count = self.populate_dim_geografia()
            
            # Paso 3: Transformar a hechos
            fact_created, fact_updated = self.transform_to_facts()
            
            # Paso 4: Calcular agregaciones
            prov_agg, dept_agg = self.calculate_monthly_aggregations()
            
            result = {
                'status': 'success',
                'tiempo_records': tiempo_count,
                'geografia_records': geo_count,
                'facts_created': fact_created,
                'facts_updated': fact_updated,
                'provincial_aggs': prov_agg,
                'departmental_aggs': dept_agg
            }
            
            print("=== ETL COMPLETO EXITOSO ===")
            return result
            
        except Exception as e:
            print(f"Error en ETL: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def run_full_etl_auto(self):
        """Ejecuta el ETL completo optimizado para post-upload automático"""
        logger.info("=== INICIANDO ETL AUTOMÁTICO POST-UPLOAD ===")
        print("=== INICIANDO ETL AUTOMÁTICO POST-UPLOAD ===")
        
        try:
            # Detectar rango dinámico
            start_date, end_date = self.get_dynamic_date_range()
            
            # Paso 1: Poblar dimensión tiempo (solo fechas necesarias)
            logger.info("Paso 1: Poblando dimensión tiempo dinámicamente")
            tiempo_count = self.populate_dim_tiempo(start_date, end_date)
            
            # Paso 2: Poblar dimensión geografía (incremental)
            logger.info("Paso 2: Poblando dimensión geografía")
            geo_count = self.populate_dim_geografia()
            
            # Paso 3: Transformar a hechos (incremental)
            logger.info("Paso 3: Transformando datos a tabla de hechos")
            fact_created, fact_updated = self.transform_to_facts()
            
            # Paso 4: Calcular agregaciones (regenerar completamente)
            logger.info("Paso 4: Calculando agregaciones mensuales")
            prov_agg, dept_agg = self.calculate_monthly_aggregations()
            
            result = {
                'status': 'success',
                'date_range': {'start': start_date, 'end': end_date},
                'tiempo_records': tiempo_count,
                'geografia_records': geo_count,
                'facts_created': fact_created,
                'facts_updated': fact_updated,
                'provincial_aggs': prov_agg,
                'departmental_aggs': dept_agg,
                'auto_executed': True
            }
            
            logger.info(f"ETL automático completado exitosamente: {result}")
            print("=== ETL AUTOMÁTICO COMPLETADO EXITOSAMENTE ===")
            return result
            
        except Exception as e:
            logger.error(f"Error en ETL automático: {str(e)}")
            print(f"Error en ETL automático: {str(e)}")
            return {
                'status': 'error',
                'message': str(e),
                'auto_executed': True
            }
    
    # Métodos auxiliares
    def count_detenidos(self, record):
        """Cuenta cantidad de detenidos relacionados"""
        # Por ahora retorna 0, se puede mejorar con data real
        if 'deten' in (record.descripcion or '').lower():
            return 1
        return 0
    
    def count_incautaciones(self, record):
        """Cuenta cantidad de incautaciones relacionadas"""
        if 'incaut' in (record.descripcion or '').lower():
            return 1
        return 0
    
    def count_vehiculos(self, record):
        """Cuenta cantidad de vehículos controlados"""
        if 'vehiculo' in (record.descripcion or '').lower() or 'control' in (record.descripcion or '').lower():
            return 1
        return 0
    
    def get_region(self, provincia):
        """Asigna región geográfica a provincia"""
        regiones = {
            'NOA': ['JUJUY', 'SALTA', 'TUCUMAN', 'CATAMARCA', 'LA RIOJA', 'SANTIAGO DEL ESTERO'],
            'NEA': ['FORMOSA', 'CHACO', 'CORRIENTES', 'MISIONES'],
            'CUYO': ['SAN JUAN', 'MENDOZA', 'SAN LUIS'],
            'CENTRO': ['CORDOBA', 'SANTA FE', 'ENTRE RIOS'],
            'PAMPEANA': ['BUENOS AIRES', 'LA PAMPA'],
            'PATAGONIA': ['NEUQUEN', 'RIO NEGRO', 'CHUBUT', 'SANTA CRUZ', 'TIERRA DEL FUEGO']
        }
        
        provincia_upper = provincia.upper()
        for region, provincias in regiones.items():
            for prov in provincias:
                if prov in provincia_upper:
                    return region
        
        if 'CIUDAD AUTONOMA' in provincia_upper or 'CABA' in provincia_upper:
            return 'CENTRO'
        
        return 'OTRAS'
    
    @staticmethod
    def normalize_provincia(provincia_name):
        """Normaliza nombre de provincia"""
        if not provincia_name:
            return ''
        
        # Convert to string and clean
        s = str(provincia_name).strip()
        s = re.sub(r'\s+', ' ', s)
        
        # Remove diacritics
        s = unicodedata.normalize('NFD', s)
        s = ''.join(char for char in s if unicodedata.category(char) != 'Mn')
        s = s.lower()
        
        # Handle CABA variations
        if s == 'caba' or 'ciudad autonoma' in s:
            return 'ciudad_autonoma_de_buenos_aires'
        
        # Replace spaces with underscores
        s = s.replace(' ', '_')
        
        return s
    
    @staticmethod
    def normalize_departamento(departamento_name):
        """Normaliza nombre de departamento"""
        if not departamento_name:
            return 'sin_departamento'
        
        # Convert to string and clean
        s = str(departamento_name).strip()
        s = re.sub(r'\s+', ' ', s)
        
        # Remove diacritics
        s = unicodedata.normalize('NFD', s)
        s = ''.join(char for char in s if unicodedata.category(char) != 'Mn')
        s = s.lower()
        
        # Replace spaces with underscores
        s = s.replace(' ', '_')
        
        return s