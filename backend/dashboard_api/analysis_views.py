from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q, Min, Max
from django.db.models.functions import TruncMonth, TruncYear
from django.db import models
from .dw_models import (
    AggMensualProvincia, AggMensualDepartamento, 
    FactProcedimientos, DimTiempo, DimGeografia
)
from .dw_serializers import (
    AnalisisTemporalSerializer, AnalisisGeograficoSerializer, 
    ComparisonAnalysisSerializer, DWStatusSerializer
)
from .etl_dimensions import DimensionETLProcessor
import logging

logger = logging.getLogger(__name__)

class AnalisisTemporalView(APIView):
    """
    API para análisis temporal por provincia
    GET /api/dw/analysis/temporal/?provincia=BUENOS_AIRES&year=2025&grain=monthly
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            provincia_key = request.GET.get('provincia')
            year = request.GET.get('year', '2025')
            grain = request.GET.get('grain', 'monthly')  # monthly, quarterly
            
            if grain == 'monthly':
                queryset = AggMensualProvincia.objects.filter(
                    año=int(year)
                )
                
                if provincia_key:
                    queryset = queryset.filter(provincia_key=provincia_key)
                
                data = queryset.order_by('mes').values(
                    'año_mes', 'provincia_nombre', 'provincia_key',
                    'total_procedimientos', 'total_detenidos', 
                    'total_incautaciones', 'total_vehiculos_controlados',
                    'mes_nombre', 'mes', 'año'
                )
                
            elif grain == 'quarterly':
                # Agregación trimestral
                data = AggMensualProvincia.objects.filter(
                    año=int(year)
                ).extra(
                    select={
                        'trimestre': 'CASE WHEN mes <= 3 THEN 1 WHEN mes <= 6 THEN 2 WHEN mes <= 9 THEN 3 ELSE 4 END',
                        'año_trimestre': "año || '-Q' || CASE WHEN mes <= 3 THEN 1 WHEN mes <= 6 THEN 2 WHEN mes <= 9 THEN 3 ELSE 4 END"
                    }
                ).values(
                    'provincia_key', 'provincia_nombre', 'trimestre', 'año_trimestre'
                ).annotate(
                    total_procedimientos=Sum('total_procedimientos'),
                    total_detenidos=Sum('total_detenidos'),
                    total_incautaciones=Sum('total_incautaciones'),
                    total_vehiculos_controlados=Sum('total_vehiculos_controlados')
                ).order_by('provincia_key', 'trimestre')
            
            serializer = AnalisisTemporalSerializer(data, many=True)
            
            return Response({
                'status': 'success',
                'data': serializer.data,
                'filters': {
                    'provincia': provincia_key,
                    'year': year,
                    'grain': grain
                },
                'count': len(serializer.data)
            })
            
        except Exception as e:
            logger.error(f"Error in AnalisisTemporalView: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AnalisisGeograficoView(APIView):
    """
    API para análisis geográfico por período
    GET /api/dw/analysis/geografico/?periodo=2025-01&nivel=provincia&top=10
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            periodo = request.GET.get('periodo', '2025-01')  # año-mes
            nivel = request.GET.get('nivel', 'provincia')  # provincia, departamento
            top = int(request.GET.get('top', 0))  # Límite de resultados
            provincia_filtro = request.GET.get('provincia_filtro')
            
            if nivel == 'provincia':
                queryset = AggMensualProvincia.objects.filter(año_mes=periodo)
                
                if provincia_filtro:
                    queryset = queryset.filter(provincia_key=provincia_filtro)
                
                data = queryset.order_by('-total_procedimientos').values(
                    'provincia_key', 'provincia_nombre',
                    'total_procedimientos', 'total_detenidos',
                    'total_incautaciones', 'total_vehiculos_controlados',
                    'año_mes', 'mes_nombre'
                )
                
            elif nivel == 'departamento':
                # Análisis departamental
                queryset = AggMensualDepartamento.objects.filter(año_mes=periodo)
                
                if provincia_filtro:
                    queryset = queryset.filter(provincia_key=provincia_filtro)
                
                data = queryset.order_by('-total_procedimientos').values(
                    'provincia_departamento_key', 'provincia_nombre', 
                    'departamento_nombre', 'provincia_key',
                    'total_procedimientos', 'total_detenidos', 
                    'total_incautaciones', 'total_vehiculos_controlados',
                    'año_mes', 'mes_nombre'
                )
            
            # Aplicar límite de top resultados si se especifica
            if top > 0:
                data = data[:top]
            
            serializer = AnalisisGeograficoSerializer(data, many=True)
            
            return Response({
                'status': 'success',
                'data': serializer.data,
                'filters': {
                    'periodo': periodo,
                    'nivel': nivel,
                    'top': top,
                    'provincia_filtro': provincia_filtro
                },
                'count': len(serializer.data)
            })
            
        except Exception as e:
            logger.error(f"Error in AnalisisGeograficoView: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ComparisonAnalysisView(APIView):
    """
    API para comparaciones entre provincias
    GET /api/dw/analysis/comparison/?provincias=BUENOS_AIRES,CORDOBA&year=2025&comparison_type=temporal
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            provincias_param = request.GET.get('provincias', '')
            provincias_list = [p.strip() for p in provincias_param.split(',') if p.strip()]
            year = request.GET.get('year', '2025')
            comparison_type = request.GET.get('comparison_type', 'temporal')
            
            if not provincias_list:
                return Response({
                    'status': 'error',
                    'message': 'Debe especificar al menos una provincia'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if comparison_type == 'temporal':
                # Comparación temporal entre provincias
                data = AggMensualProvincia.objects.filter(
                    provincia_key__in=provincias_list,
                    año=int(year)
                ).order_by('provincia_key', 'mes').values(
                    'año_mes', 'provincia_key', 'provincia_nombre',
                    'total_procedimientos', 'total_detenidos',
                    'total_incautaciones', 'total_vehiculos_controlados',
                    'mes_nombre', 'mes'
                )
                
            elif comparison_type == 'summary':
                # Comparación resumen anual
                from django.db.models import Case, When, IntegerField
                
                data = AggMensualProvincia.objects.filter(
                    provincia_key__in=provincias_list,
                    año=int(year)
                ).values('provincia_key', 'provincia_nombre').annotate(
                    total_procedimientos=Sum('total_procedimientos'),
                    total_detenidos=Sum('total_detenidos'),
                    total_incautaciones=Sum('total_incautaciones'),
                    total_vehiculos_controlados=Sum('total_vehiculos_controlados'),
                    meses_con_datos=Count('id')
                ).order_by('-total_procedimientos')
                
                # Calcular promedio mensual manualmente
                data_list = list(data)
                for item in data_list:
                    if item['meses_con_datos'] > 0:
                        item['promedio_mensual_procedimientos'] = item['total_procedimientos'] / item['meses_con_datos']
                    else:
                        item['promedio_mensual_procedimientos'] = 0
                data = data_list
            
            serializer = ComparisonAnalysisSerializer(data, many=True)
            
            return Response({
                'status': 'success',
                'data': serializer.data,
                'filters': {
                    'provincias': provincias_list,
                    'year': year,
                    'comparison_type': comparison_type
                },
                'count': len(serializer.data)
            })
            
        except Exception as e:
            logger.error(f"Error in ComparisonAnalysisView: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DWStatusView(APIView):
    """
    API para obtener estado del Data Warehouse
    GET /api/dw/status/ - Estado general
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Contar registros en cada tabla
            tiempo_count = DimTiempo.objects.count()
            geografia_count = DimGeografia.objects.count()
            facts_count = FactProcedimientos.objects.count()
            agg_provincia_count = AggMensualProvincia.objects.count()
            agg_departamento_count = AggMensualDepartamento.objects.count()
            
            # Rango de fechas disponibles
            fecha_range = DimTiempo.objects.aggregate(
                fecha_min=Min('fecha_completa'),
                fecha_max=Max('fecha_completa')
            )
            
            # Últimas agregaciones
            ultima_agregacion = AggMensualProvincia.objects.order_by('-fecha_calculo').first()
            fecha_ultima_agregacion = ultima_agregacion.fecha_calculo if ultima_agregacion else None
            
            # Provincias disponibles
            provincias_disponibles = list(
                DimGeografia.objects.values_list('provincia', 'provincia_key').distinct()
            )
            
            status_data = {
                'tablas': {
                    'dim_tiempo': tiempo_count,
                    'dim_geografia': geografia_count,
                    'fact_procedimientos': facts_count,
                    'agg_mensual_provincia': agg_provincia_count,
                    'agg_mensual_departamento': agg_departamento_count
                },
                'rango_fechas': {
                    'fecha_minima': fecha_range['fecha_min'],
                    'fecha_maxima': fecha_range['fecha_max']
                },
                'ultima_agregacion': fecha_ultima_agregacion,
                'provincias_disponibles': provincias_disponibles,
                'status': 'ready' if facts_count > 0 else 'empty'
            }
            
            serializer = DWStatusSerializer(status_data)
            
            return Response({
                'status': 'success',
                'data': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error in DWStatusView: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ETLExecutionView(APIView):
    """
    API para ejecutar y monitorear ETL
    POST /api/dw/etl/run/ - Ejecuta ETL completo
    GET /api/dw/etl/status/ - Estado del último ETL ejecutado
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Ejecuta ETL completo"""
        try:
            logger.info("Iniciando ETL por solicitud de usuario")
            
            etl_processor = DimensionETLProcessor()
            result = etl_processor.run_full_etl()
            
            if result['status'] == 'success':
                return Response({
                    'status': 'success',
                    'message': 'ETL ejecutado correctamente',
                    'details': result
                })
            else:
                return Response({
                    'status': 'error',
                    'message': result.get('message', 'Error desconocido en ETL')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error ejecutando ETL: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Error ejecutando ETL: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Obtiene estado del ETL"""
        try:
            # Por simplicidad, retornamos estado basado en data existente
            facts_count = FactProcedimientos.objects.count()
            ultima_carga = FactProcedimientos.objects.order_by('-fecha_carga').first()
            
            return Response({
                'status': 'success',
                'etl_status': 'ready' if facts_count > 0 else 'not_executed',
                'facts_count': facts_count,
                'ultima_carga': ultima_carga.fecha_carga if ultima_carga else None
            })
            
        except Exception as e:
            logger.error(f"Error obteniendo estado ETL: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProvinciasListView(APIView):
    """
    API para obtener lista de provincias disponibles
    GET /api/dw/provincias/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            provincias = DimGeografia.objects.values(
                'provincia', 'provincia_key'
            ).distinct().order_by('provincia')
            
            return Response({
                'status': 'success',
                'data': list(provincias)
            })
            
        except Exception as e:
            logger.error(f"Error obteniendo provincias: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)