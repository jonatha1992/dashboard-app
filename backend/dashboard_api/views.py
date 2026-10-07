import openpyxl
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import datetime
import json
from decimal import Decimal, InvalidOperation
import logging
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.openapi import OpenApiTypes

logger = logging.getLogger(__name__)

from .models import (
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
from .serializers import (
    LoginSerializer, 
    UserSerializer, 
    GeografiaProcedimientoSerializer, 
    DataStatsSerializer,
    FileUploadSerializer,
    FilteringStatsSerializer,
    UploadResultSerializer,
    SpecializedTableStatsSerializer,
    FilteredIncautacionesSerializer,
    FilteredDetenidosSerializer,
    FilteredControladosSerializer,
    FilteredAfectadosSerializer
)
from .authentication import generate_jwt_token

User = get_user_model()


# Public endpoints using @api_view decorator to bypass authentication issues
@extend_schema(
    tags=['Datos Públicos'],
    summary='Obtener datos operacionales',
    description='Obtener todos los datos operacionales de la tabla maestra (sin autenticación)',
    responses={
        200: GeografiaProcedimientoSerializer(many=True)
    }
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def data_list_public(request):
    """
    Get operational data - public endpoint
    """
    data = GeografiaProcedimiento.objects.all()
    serializer = GeografiaProcedimientoSerializer(data, many=True)
    return Response(serializer.data)

@extend_schema(
    tags=['Estadísticas'],
    summary='Obtener estadísticas de datos',
    description='Obtener estadísticas generales de los datos (sin autenticación)',
    responses={
        200: DataStatsSerializer
    }
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def data_stats_public(request):
    """
    Get data statistics - public endpoint
    """
    # Get all data from tabla maestra
    all_data = GeografiaProcedimiento.objects.all()
    
    # Calculate date range
    date_range = {'earliest': None, 'latest': None}
    
    valid_dates = all_data.filter(
        fecha_iso__isnull=False
    ).exclude(
        fecha__in=['-', '', None]
    ).order_by('fecha_iso')
    
    if valid_dates.exists():
        earliest_date = valid_dates.first().fecha_iso
        latest_date = valid_dates.last().fecha_iso
        date_range = {
            'earliest': earliest_date.isoformat() if earliest_date else None,
            'latest': latest_date.isoformat() if latest_date else None
        }
    
    # Get unique sheets
    sheets = list(all_data.values_list('hoja', flat=True).distinct())
    sheets = [sheet for sheet in sheets if sheet]
    
    # Get unique provinces
    provinces = list(all_data.values_list('provincia', flat=True).distinct())
    provinces = [prov for prov in provinces if prov and prov != '-']
    
    stats_data = {
        'totalRecords': all_data.count(),
        'sheets': sheets,
        'dateRange': date_range,
        'provinces': provinces
    }
    
    return Response(stats_data)



@extend_schema(
    tags=['Health Check'],
    summary='Verificar estado del servidor',
    description='Endpoint para verificar que el servidor está funcionando correctamente',
    responses={
        200: {
            'description': 'Servidor funcionando correctamente',
            'examples': {
                'application/json': {
                    'message': 'Dashboard Django API - Nueva Estructura',
                    'version': '2.0.0',
                    'status': 'running'
                }
            }
        }
    }
)
class HealthCheckView(APIView):
    """
    Health check endpoint (equivalent to Node.js '/' route)
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            'message': 'Dashboard Django API - Nueva Estructura',
            'version': '2.0.0',
            'status': 'running'
        })


@extend_schema(
    tags=['Autenticación'],
    summary='Iniciar sesión',
    description='Autenticar usuario con credenciales y obtener token JWT',
    request=LoginSerializer,
    responses={
        200: {
            'description': 'Login exitoso',
            'example': {
                'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                'user': {
                    'id': 1,
                    'username': 'admin',
                    'role': 'admin'
                }
            }
        },
        401: {
            'description': 'Credenciales inválidas',
            'example': {'error': 'Credenciales inválidas'}
        }
    }
)
class LoginView(APIView):
    """
    Login endpoint (equivalent to Node.js '/api/auth/login')
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token = generate_jwt_token(user)
            
            return Response({
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role
                }
            })
        
        return Response({
            'error': 'Credenciales inválidas'
        }, status=status.HTTP_401_UNAUTHORIZED)


@extend_schema(
    tags=['Autenticación'],
    summary='Obtener usuario actual',
    description='Obtener información del usuario autenticado',
    responses={
        200: UserSerializer,
        401: {
            'description': 'Token inválido o expirado',
            'example': {'error': 'Token inválido'}
        }
    }
)
class CurrentUserView(APIView):
    """
    Get current user info (equivalent to Node.js '/api/auth/me')
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user_serializer = UserSerializer(request.user)
        return Response({
            'user': user_serializer.data
        })




@extend_schema(
    tags=['Estadísticas'],
    summary='Obtener estadísticas de tablas especializadas',
    description='Obtener conteos de registros en todas las tablas especializadas filtradas',
    responses={
        200: SpecializedTableStatsSerializer
    }
)
class SpecializedTableStatsView(APIView):
    """
    Get statistics for all specialized tables (filtered counts)
    """
    
    def get(self, request):
        # Get counts from each specialized table (these already contain filtered data)
        stats = {
            'incautaciones_count': Incautaciones.objects.count(),
            'detenidos_count': DetenidosAprehendidos.objects.count(),
            'controlados_count': VehiculosPersonasControladas.objects.count(),
            'afectados_count': PersonalElementosAfectados.objects.count(),
            'trata_count': TrataTraficPersonas.objects.count(),
            'otros_delitos_count': OtrosDelitos.objects.count(),
            'otros_eventos_count': OtrosEventos.objects.count(),
            'fallecidos_count': Fallecidos.objects.count(),
            'abatidos_count': Abatidos.objects.count(),
            'codigos_count': CodigoOperativo.objects.count(),
        }
        
        stats['total_specialized_records'] = sum(stats.values())
        
        serializer = SpecializedTableStatsSerializer(stats)
        return Response(serializer.data)


@extend_schema(
    tags=['Estadísticas'],
    summary='Obtener estadísticas de filtrado',
    description='Obtener estadísticas detalladas de filtrado mostrando conteos antes/después por tabla',
    responses={
        200: FilteringStatsSerializer(many=True)
    }
)
class FilteringStatsView(APIView):
    """
    Get detailed filtering statistics showing before/after counts
    """
    
    def get(self, request):
        # Get total geography records (master table)
        total_geografia = GeografiaProcedimiento.objects.count()
        
        # Get current specialized table counts (after filtering)
        specialized_counts = {
            'incautaciones': Incautaciones.objects.count(),
            'detenidos': DetenidosAprehendidos.objects.count(),
            'controlados': VehiculosPersonasControladas.objects.count(),
            'afectados': PersonalElementosAfectados.objects.count(),
            'trata': TrataTraficPersonas.objects.count(),
            'otros_delitos': OtrosDelitos.objects.count(),
            'otros_eventos': OtrosEventos.objects.count(),
            'fallecidos': Fallecidos.objects.count(),
            'abatidos': Abatidos.objects.count(),
            'codigos': CodigoOperativo.objects.count(),
        }
        
        # Calculate filtering stats for each table
        filtering_details = []
        
        # Define criteria for each table type
        criterios = {
            'incautaciones': 'INCAUTACIONES ≠ "-"',
            'detenidos': 'EDAD ≠ "-"',
            'controlados': 'VEHICULOS_CONTROLADOS ≠ "-" OR PERSONAS_CONTROLADAS ≠ "-"',
            'afectados': 'CANT_EFECTIVOS > 0',
            'trata': 'Todos los registros (sin filtrado)',
            'otros_delitos': 'Todos los registros (sin filtrado)',
            'otros_eventos': 'Todos los registros (sin filtrado)',
            'fallecidos': 'Todos los registros (sin filtrado)',
            'abatidos': 'Todos los registros (sin filtrado)',
            'codigos': 'Todos los registros (sin filtrado)'
        }
        
        for tabla, count in specialized_counts.items():
            registros_omitidos = max(0, total_geografia - count) if tabla in ['incautaciones', 'detenidos', 'controlados', 'afectados'] else 0
            porcentaje_reduccion = (registros_omitidos / total_geografia * 100) if total_geografia > 0 else 0
            
            filtering_details.append({
                'tabla': tabla.replace('_', ' ').title(),
                'registros_total': total_geografia,
                'registros_filtrados': count,
                'registros_omitidos': registros_omitidos,
                'porcentaje_reduccion': round(porcentaje_reduccion, 2),
                'criterio_filtrado': criterios.get(tabla, 'Sin criterio especificado')
            })
        
        return Response(filtering_details)


@extend_schema(
    tags=['Datos Filtrados'],
    summary='Obtener incautaciones filtradas',
    description='Obtener solo registros de incautaciones con datos reales de decomisos',
    responses={
        200: FilteredIncautacionesSerializer(many=True)
    }
)
class FilteredIncautacionesView(APIView):
    """
    Get filtered incautaciones (only records with real seizures)
    Devuelve datos unificados: tabla maestra + datos específicos de incautaciones
    
    Estructura de respuesta JSON (ejemplo real del database):
    {
        "FUERZA_INTERVINIENTE": "PSA",
        "ID_OPERATIVO": "PS-0013-EZE/25",
        "ID_PROCEDIMIENTO": "PS-111-EZE-2025",
        "UNIDAD_INTERVINIENTE": "EZE", 
        "PROVINCIA": "BUENOS AIRES",
        "DEPARTAMENTO O PARTIDO": "JOSÉ M. EZEIZA",
        "FECHA": "09/01/2025",
        "FECHA_ISO": "2025-01-09",
        "DESCRIPCIÓN": "CONTROL PREVENTIVO - SECTOR DE SEGURIDAD RESTRINGIDA AEROPORTUARIA",
        "INCAUTACIONES": "ARMAS", 
        "TIPO": "PISTOLA",
        "CANTIDAD": "1",
        "MEDIDAS": "UNIDADES",
        "AFORO": null,
        "OBSERVACIONES_INCAUTACION": "MARCA GLOCK CALIBRE 9MM"
    }
    """
    
    def get(self, request):
        # GET incautaciones with JOIN to procedimiento (tabla maestra)
        incautaciones = Incautaciones.objects.select_related('procedimiento').all()
        
        # Crear estructura unificada combinando ambas tablas
        unified_data = []
        for incautacion in incautaciones:
            procedimiento = incautacion.procedimiento
            
            # Combinar datos de tabla maestra + datos específicos de incautaciones
            unified_record = {
                # Campos de tabla maestra (GeografiaProcedimiento)
                'ID_OPERATIVO': procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': procedimiento.id_procedimiento,
                'PROVINCIA': procedimiento.provincia,
                'FECHA': procedimiento.fecha,
                'FECHA_ISO': procedimiento.fecha_iso.isoformat() if procedimiento.fecha_iso else None,
                'HORA': procedimiento.hora,
                'LATITUD': float(procedimiento.latitud) if procedimiento.latitud else None,
                'LONGITUD': float(procedimiento.longitud) if procedimiento.longitud else None,
                'DESCRIPCIÓN': procedimiento.descripcion,
                'TIPO_INTERVENCION': procedimiento.tipo_intervencion,
                'FUERZA_INTERVINIENTE': procedimiento.fuerza_interviniente,
                'UNIDAD_INTERVINIENTE': procedimiento.unidad_interviniente or procedimiento.fuerza_interviniente,
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO O PARTIDO': procedimiento.departamento_o_partido,
                
                # Campos específicos de Incautaciones
                'INCAUTACIONES': incautacion.incautaciones,
                'TIPO': incautacion.tipo,
                'SUBTIPO': incautacion.subtipo,
                'CANTIDAD': incautacion.cantidad,
                'MEDIDAS': incautacion.medidas,
                'AFORO': incautacion.aforo,
                'OBSERVACIONES_INCAUTACION': incautacion.observaciones,
                
                # Metadatos
                'FECHA_IMPORTACION': procedimiento.fecha_importacion.isoformat() if procedimiento.fecha_importacion else None,
                'ARCHIVO_ORIGINAL': procedimiento.archivo_original,
                'HOJA': procedimiento.hoja
            }
            
            unified_data.append(unified_record)
        
        return Response(unified_data)


@extend_schema(
    tags=['Datos Filtrados'],
    summary='Obtener detenidos filtrados',
    description='Obtener solo registros de detenidos con datos reales de personas',
    responses={
        200: FilteredDetenidosSerializer(many=True)
    }
)
class FilteredDetenidosView(APIView):
    """
    Get filtered detenidos (only records with real detained persons)
    Devuelve datos unificados: tabla maestra + datos específicos de detenidos
    
    Estructura de respuesta JSON (ejemplo real del database):
    {
        "FUERZA_INTERVINIENTE": "PSA",
        "ID_OPERATIVO": "3747",
        "ID_PROCEDIMIENTO": "RL-7-AER-2025", 
        "UNIDAD_INTERVINIENTE": "AER",
        "PROVINCIA": "CIUDAD AUTONOMA DE BUENOS AIRES",
        "DEPARTAMENTO O PARTIDO": "COMUNA 14",
        "FECHA": "02/01/2025",
        "FECHA_ISO": "2025-01-02",
        "HORA": "03:15",
        "DESCRIPCIÓN": "DENUNCIA POLICIAL",
        "EDAD": 32,
        "SEXO": "MASCULINO",
        "NACIONALIDAD": "ARGENTINA",
        "DELITO_IMPUTADO": "CAPTURA",
        "SITUACION_PROCESAL": "LIBERADO",
        "JUZGADO_INTERVINIENTE": "NACIONAL_PRIMERA INSTANCIA_MENORES_NRO_01"
    }
    """
    
    def get(self, request):
        # GET detenidos with JOIN to procedimiento (tabla maestra)
        detenidos = DetenidosAprehendidos.objects.select_related('procedimiento').all()
        
        # Crear estructura unificada combinando ambas tablas
        unified_data = []
        for detenido in detenidos:
            procedimiento = detenido.procedimiento
            
            # Combinar datos de tabla maestra + datos específicos de detenidos
            unified_record = {
                # Campos de tabla maestra (GeografiaProcedimiento)
                'ID_OPERATIVO': procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': procedimiento.id_procedimiento,
                'PROVINCIA': procedimiento.provincia,
                'FECHA': procedimiento.fecha,
                'FECHA_ISO': procedimiento.fecha_iso.isoformat() if procedimiento.fecha_iso else None,
                'HORA': procedimiento.hora,
                'LATITUD': float(procedimiento.latitud) if procedimiento.latitud else None,
                'LONGITUD': float(procedimiento.longitud) if procedimiento.longitud else None,
                'DESCRIPCIÓN': procedimiento.descripcion,
                'TIPO_INTERVENCION': procedimiento.tipo_intervencion,
                'FUERZA_INTERVINIENTE': procedimiento.fuerza_interviniente,
                'UNIDAD_INTERVINIENTE': procedimiento.unidad_interviniente or procedimiento.fuerza_interviniente,
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO O PARTIDO': procedimiento.departamento_o_partido,
                
                # Campos específicos de DetenidosAprehendidos
                'EDAD': detenido.edad,
                'SEXO': detenido.sexo,
                'NACIONALIDAD': detenido.nacionalidad,
                'SITUACION_PROCESAL': detenido.situacion_procesal,
                'DELITO_IMPUTADO': detenido.delito_imputado,
                'JUZGADO_INTERVINIENTE': detenido.juzgado_interviniente,
                
                # Metadatos
                'FECHA_IMPORTACION': procedimiento.fecha_importacion.isoformat() if procedimiento.fecha_importacion else None,
                'ARCHIVO_ORIGINAL': procedimiento.archivo_original,
                'HOJA': procedimiento.hoja
            }
            
            unified_data.append(unified_record)
        
        return Response(unified_data)


@extend_schema(
    tags=['Datos Filtrados'],
    summary='Obtener controlados filtrados',
    description='Obtener solo registros de controles con datos reales de vehículos/personas',
    responses={
        200: FilteredControladosSerializer(many=True)
    }
)
class FilteredControladosView(APIView):
    """
    Get filtered controlados (only records with real vehicle/person controls)
    Devuelve datos unificados: tabla maestra + datos específicos de controlados
    """
    
    def get(self, request):
        # GET controlados with JOIN to procedimiento (tabla maestra)
        controlados = VehiculosPersonasControladas.objects.select_related('procedimiento').all()
        
        # Crear estructura unificada combinando ambas tablas
        unified_data = []
        for controlado in controlados:
            procedimiento = controlado.procedimiento
            
            # Combinar datos de tabla maestra + datos específicos de controlados
            unified_record = {
                # Campos de tabla maestra (GeografiaProcedimiento)
                'ID_OPERATIVO': procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': procedimiento.id_procedimiento,
                'PROVINCIA': procedimiento.provincia,
                'FECHA': procedimiento.fecha,
                'FECHA_ISO': procedimiento.fecha_iso.isoformat() if procedimiento.fecha_iso else None,
                'HORA': procedimiento.hora,
                'LATITUD': float(procedimiento.latitud) if procedimiento.latitud else None,
                'LONGITUD': float(procedimiento.longitud) if procedimiento.longitud else None,
                'DESCRIPCIÓN': procedimiento.descripcion,
                'TIPO_INTERVENCION': procedimiento.tipo_intervencion,
                'FUERZA_INTERVINIENTE': procedimiento.fuerza_interviniente,
                'UNIDAD_INTERVINIENTE': procedimiento.unidad_interviniente or procedimiento.fuerza_interviniente,
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO O PARTIDO': procedimiento.departamento_o_partido,
                
                # Campos específicos de VehiculosPersonasControladas
                'vehiculos_controlados': controlado.vehiculos_controlados,
                'personas_controladas': controlado.personas_controladas,
                'cant_averiguaciones_secuestro': controlado.cant_averiguaciones_secuestro,
                'cant_embarcaciones_controladas': controlado.cant_embarcaciones_controladas,
                'cant_solicitudes_antecedentes': controlado.cant_solicitudes_antecedentes,
                
                # Metadatos
                'FECHA_IMPORTACION': procedimiento.fecha_importacion.isoformat() if procedimiento.fecha_importacion else None,
                'ARCHIVO_ORIGINAL': procedimiento.archivo_original,
                'HOJA': procedimiento.hoja
            }
            
            unified_data.append(unified_record)
        
        return Response(unified_data)


@extend_schema(
    tags=['Datos Filtrados'],
    summary='Obtener afectados filtrados',
    description='Obtener solo registros de afectados con cantidad de personal mayor a 0',
    responses={
        200: FilteredAfectadosSerializer(many=True)
    }
)
class FilteredAfectadosView(APIView):
    """
    Get filtered afectados (only records with personnel count > 0)
    Devuelve datos unificados: tabla maestra + datos específicos de afectados
    """
    
    def get(self, request):
        # GET afectados with JOIN to procedimiento (tabla maestra)
        afectados = PersonalElementosAfectados.objects.select_related('procedimiento').all()
        
        # Crear estructura unificada combinando ambas tablas
        unified_data = []
        for afectado in afectados:
            procedimiento = afectado.procedimiento
            
            # Combinar datos de tabla maestra + datos específicos de afectados
            unified_record = {
                # Campos de tabla maestra (GeografiaProcedimiento)
                'ID_OPERATIVO': procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': procedimiento.id_procedimiento,
                'PROVINCIA': procedimiento.provincia,
                'FECHA': procedimiento.fecha,
                'FECHA_ISO': procedimiento.fecha_iso.isoformat() if procedimiento.fecha_iso else None,
                'HORA': procedimiento.hora,
                'LATITUD': float(procedimiento.latitud) if procedimiento.latitud else None,
                'LONGITUD': float(procedimiento.longitud) if procedimiento.longitud else None,
                'DESCRIPCIÓN': procedimiento.descripcion,
                'TIPO_INTERVENCION': procedimiento.tipo_intervencion,
                'FUERZA_INTERVINIENTE': procedimiento.fuerza_interviniente,
                'UNIDAD_INTERVINIENTE': procedimiento.unidad_interviniente or procedimiento.fuerza_interviniente,
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO O PARTIDO': procedimiento.departamento_o_partido,
                
                # Campos específicos de PersonalElementosAfectados
                'CANT_EFECTIVOS': afectado.cant_efectivos,
                'CANT_AUTOS_CAMIONETAS': afectado.cant_autos_camionetas,
                'CANT_MOTOS': afectado.cant_motos,
                'CANT_SCANNERS': afectado.cant_scanners,
                'CANT_CABALLOS': afectado.cant_caballos,
                'CANT_CANES': afectado.cant_canes,
                'CANT_EMBARCACIONES': afectado.cant_embarcaciones,
                'CANT_MORPHRAPID': afectado.cant_morphrapid,
                'CANT_LPR': afectado.cant_lpr,
                'cant_efectivos': afectado.cant_efectivos,  # Duplicado para compatibilidad
                'cant_autos_camionetas': afectado.cant_autos_camionetas,
                'cant_motocicletas': afectado.cant_motos,  # Compatibilidad
                
                # Metadatos
                'FECHA_IMPORTACION': procedimiento.fecha_importacion.isoformat() if procedimiento.fecha_importacion else None,
                'ARCHIVO_ORIGINAL': procedimiento.archivo_original,
                'HOJA': procedimiento.hoja
            }
            
            unified_data.append(unified_record)
        
        return Response(unified_data)
from .upload_views import DataUploadView



@extend_schema(
    tags=['Gestión de Datos'],
    summary='Limpiar todos los datos',
    description='Eliminar todos los datos operacionales de todas las tablas. Solo administradores.',
    responses={
        200: {
            'description': 'Datos eliminados exitosamente',
            'example': {
                'success': True,
                'message': 'Todos los datos han sido eliminados (nueva estructura)'
            }
        },
        403: {
            'description': 'Permisos insuficientes',
            'example': {'error': 'Permisos insuficientes'}
        },
        500: {
            'description': 'Error al limpiar datos',
            'example': {'error': 'Error al limpiar datos'}
        }
    }
)
class DataClearView(APIView):
    """
    Clear all data (equivalent to Node.js '/api/data/clear')
    Admin only
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        # Check if user is admin
        if request.user.role != 'admin':
            return Response({
                'error': 'Permisos insuficientes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            with transaction.atomic():
                VehiculosPersonasControladas.objects.all().delete()
                PersonalElementosAfectados.objects.all().delete()
                DetenidosAprehendidos.objects.all().delete()
                Incautaciones.objects.all().delete()
                TrataTraficPersonas.objects.all().delete()
                OtrosDelitos.objects.all().delete()
                OtrosEventos.objects.all().delete()
                Fallecidos.objects.all().delete()
                Abatidos.objects.all().delete()
                CodigoOperativo.objects.all().delete()
                GeografiaProcedimiento.objects.all().delete()
            
            return Response({
                'success': True,
                'message': 'Todos los datos han sido eliminados (nueva estructura)'
            })
        except Exception as e:
            logger.exception("Error al limpiar datos: %s", e)
            return Response({
                'error': 'Error al limpiar datos'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# NUEVAS VIEWS PARA LA ESTRUCTURA ESPECIALIZADA
# ============================================================================

@extend_schema(
    tags=['Datos Especializados'],
    summary='Obtener lista de detenidos',
    description='Obtener todos los registros de detenidos/aprehendidos con información geográfica',
    responses={
        200: {
            'description': 'Lista de detenidos',
            'example': [{
                'ID_OPERATIVO': '3747',
                'ID_PROCEDIMIENTO': 'RL-7-AER-2025',
                'PROVINCIA': 'CIUDAD AUTONOMA DE BUENOS AIRES',
                'FECHA': '02/01/2025',
                'EDAD': 32,
                'SEXO': 'MASCULINO',
                'NACIONALIDAD': 'ARGENTINA',
                'UNIDAD_INTERVINIENTE': 'AER',
                'SITUACION_PROCESAL': 'LIBERADO',
                'DELITO_IMPUTADO': 'CAPTURA',
                'LATITUD': -34.5580305,
                'LONGITUD': -58.4191975
            }]
        }
    }
)
class DetenidosListView(APIView):
    """
    Obtener solo datos de detenidos/aprehendidos
    """
    
    def get(self, request):
        detenidos = DetenidosAprehendidos.objects.select_related('procedimiento').all()
        data = []
        
        for detenido in detenidos:
            data.append({
                'ID_OPERATIVO': detenido.procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': detenido.procedimiento.id_procedimiento,
                'PROVINCIA': detenido.procedimiento.provincia,
                'FECHA': detenido.procedimiento.fecha,
                'EDAD': detenido.edad,
                'SEXO': detenido.sexo,
                'NACIONALIDAD': detenido.nacionalidad,
                'SITUACION_PROCESAL': detenido.situacion_procesal,
                'DELITO_IMPUTADO': detenido.delito_imputado,
                'JUZGADO_INTERVINIENTE': detenido.juzgado_interviniente,
                # Agregar información geográfica para visualización en mapas
                'LATITUD': float(detenido.procedimiento.latitud) if detenido.procedimiento.latitud else None,
                'LONGITUD': float(detenido.procedimiento.longitud) if detenido.procedimiento.longitud else None,
                'DESCRIPCIÓN': detenido.procedimiento.descripcion,
                'LOCALIDAD': detenido.procedimiento.localidad,
                'DIRECCION': detenido.procedimiento.direccion,
                'DEPARTAMENTO O PARTIDO': detenido.procedimiento.departamento_o_partido,
                'FECHA_IMPORTACION': detenido.fecha_importacion
            })
        
        return Response(data)


@extend_schema(
    tags=['Datos Especializados'],
    summary='Obtener lista de incautaciones',
    description='Obtener todos los registros de incautaciones con información geográfica y detalles',
    responses={
        200: {
            'description': 'Lista de incautaciones',
            'example': [{
                'ID_OPERATIVO': 'PS-0013-EZE/25',
                'ID_PROCEDIMIENTO': 'PS-111-EZE-2025',
                'PROVINCIA': 'BUENOS AIRES',
                'FECHA': '09/01/2025',
                'TIPO': 'PISTOLA',
                'INCAUTACIONES': 'ARMAS',
                'CANTIDAD': '1',
                'MEDIDAS': 'UNIDADES',
                'UNIDAD_INTERVINIENTE': 'EZE',
                'LATITUD': -34.8150044,
                'LONGITUD': -58.5370171
            }]
        }
    }
)
class IncautacionesListView(APIView):
    """
    Obtener solo datos de incautaciones
    Devuelve datos unificados: tabla maestra + datos específicos de incautaciones
    """
    
    def get(self, request):
        incautaciones = Incautaciones.objects.select_related('procedimiento').all()
        data = []
        
        for incautacion in incautaciones:
            procedimiento = incautacion.procedimiento
            data.append({
                # Campos de tabla maestra (GeografiaProcedimiento)
                'ID_OPERATIVO': procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': procedimiento.id_procedimiento,
                'PROVINCIA': procedimiento.provincia,
                'FECHA': procedimiento.fecha,
                'FECHA_ISO': procedimiento.fecha_iso.isoformat() if procedimiento.fecha_iso else None,
                'HORA': procedimiento.hora,
                'LATITUD': float(procedimiento.latitud) if procedimiento.latitud else None,
                'LONGITUD': float(procedimiento.longitud) if procedimiento.longitud else None,
                'DESCRIPCIÓN': procedimiento.descripcion,
                'TIPO_INTERVENCION': procedimiento.tipo_intervencion,
                'FUERZA_INTERVINIENTE': procedimiento.fuerza_interviniente,
                'UNIDAD_INTERVINIENTE': procedimiento.unidad_interviniente or procedimiento.fuerza_interviniente,
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO O PARTIDO': procedimiento.departamento_o_partido,
                
                # Campos específicos de Incautaciones
                'INCAUTACIONES': incautacion.incautaciones,
                'TIPO': incautacion.tipo,
                'SUBTIPO': incautacion.subtipo,
                'CANTIDAD': incautacion.cantidad,
                'MEDIDAS': incautacion.medidas,
                'AFORO': incautacion.aforo,
                'TIPO_DELITO': incautacion.tipo_delito,
                'OBSERVACIONES_INCAUTACION': incautacion.observaciones,
                
                # Metadatos
                'FECHA_IMPORTACION': procedimiento.fecha_importacion.isoformat() if procedimiento.fecha_importacion else None,
                'ARCHIVO_ORIGINAL': procedimiento.archivo_original,
                'HOJA': procedimiento.hoja
            })
        
        return Response(data)


@extend_schema(
    tags=['Datos Especializados'],
    summary='Obtener lista de trata de personas',
    description='Obtener todos los registros de trata y tráfico de personas con información de víctimas',
    responses={
        200: {
            'description': 'Lista de casos de trata',
            'example': [{
                'ID_OPERATIVO': 'AP-0008-AER/25',
                'PROVINCIA': 'CIUDAD AUTONOMA DE BUENOS AIRES',
                'TIPO_DELITO': 'TRATA DE PERSONAS SIMPLE',
                'SEXO_VICTIMA': 'FEMENINO',
                'EDAD_VICTIMA': 20,
                'NACIONALIDAD': 'ARGENTINA',
                'UNIDAD_INTERVINIENTE': 'AER',
                'LATITUD': -34.5580305,
                'LONGITUD': -58.4191975
            }]
        }
    }
)
class TrataListView(APIView):
    """
    Obtener solo datos de trata y tráfico de personas
    """
    
    def get(self, request):
        trata = TrataTraficPersonas.objects.select_related('procedimiento').all()
        data = []
        
        for caso in trata:
            data.append({
                'ID_OPERATIVO': caso.procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': caso.procedimiento.id_procedimiento,
                'PROVINCIA': caso.procedimiento.provincia,
                'FECHA': caso.procedimiento.fecha,
                'FECHA_ISO': caso.procedimiento.fecha_iso.isoformat() if caso.procedimiento.fecha_iso else None,
                'HORA': caso.procedimiento.hora,
                'TIPO_DELITO': caso.tipo_delito,
                'SEXO_VICTIMA': caso.sexo_victima,
                'GENERO_VICTIMA': caso.genero_victima,
                'EDAD_VICTIMA': caso.edad_victima,
                'NACIONALIDAD': caso.nacionalidad,
                # CAMPOS CORREGIDOS: Agregar campos faltantes
                'FUERZA_INTERVINIENTE': caso.procedimiento.fuerza_interviniente,
                'UNIDAD_INTERVINIENTE': caso.procedimiento.unidad_interviniente or caso.procedimiento.fuerza_interviniente,
                'DESCRIPCIÓN': caso.procedimiento.descripcion,
                'TIPO_INTERVENCION': caso.procedimiento.tipo_intervencion,
                # Agregar información geográfica para visualización en mapas
                'LATITUD': float(caso.procedimiento.latitud) if caso.procedimiento.latitud else None,
                'LONGITUD': float(caso.procedimiento.longitud) if caso.procedimiento.longitud else None,
                'LOCALIDAD': caso.procedimiento.localidad,
                'DIRECCION': caso.procedimiento.direccion,
                'DEPARTAMENTO O PARTIDO': caso.procedimiento.departamento_o_partido,
                'FECHA_IMPORTACION': caso.fecha_importacion
            })
        
        return Response(data)


@extend_schema(
    tags=['Datos Especializados'],
    summary='Obtener lista de fallecidos',
    description='Obtener todos los registros de personal fallecido en servicio',
    responses={
        200: {
            'description': 'Lista de fallecidos',
            'example': [{
                'ID_OPERATIVO': 'OP001',
                'SERVICIO': 'Patrullaje',
                'FUERZA_DE_SEGURIDAD': 'Policía Federal',
                'CANT_FALLECIDOS': 1,
                'PROVINCIA_EVENTO': 'Buenos Aires',
                'FECHA_EVENTO': '2025-01-15'
            }]
        }
    }
)
class FallecidosListView(APIView):
    """
    Obtener solo datos de fallecidos
    """
    
    def get(self, request):
        fallecidos = Fallecidos.objects.select_related('procedimiento').all()
        data = []
        
        for caso in fallecidos:
            data.append({
                'ID_OPERATIVO': caso.procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': caso.procedimiento.id_procedimiento,
                'SERVICIO': caso.servicio,
                'FUERZA_DE_SEGURIDAD': caso.fuerza_de_seguridad,
                'CANT_FALLECIDOS': caso.cant_fallecidos,
                'CANT_LESIONADOS': caso.cant_lesionados,
                'PROVINCIA_EVENTO': caso.provincia_evento,
                'FECHA_EVENTO': caso.fecha_evento,
                'FECHA_IMPORTACION': caso.fecha_importacion
            })
        
        return Response(data)


@extend_schema(
    tags=['Datos Especializados'],
    summary='Obtener lista de abatidos',
    description='Obtener todos los registros de personas abatidas en operativos',
    responses={
        200: {
            'description': 'Lista de abatidos',
            'example': [{
                'ID_OPERATIVO': 'OP001',
                'SERVICIO': 'Operativo antidrogas',
                'FUERZA_DE_SEGURIDAD': 'Gendarmería',
                'EDAD': 28,
                'SEXO': 'M',
                'NACIONALIDAD': 'Argentina',
                'PROVINCIA_EVENTO': 'Buenos Aires',
                'FECHA_EVENTO': '2025-01-15'
            }]
        }
    }
)
class AbatidosListView(APIView):
    """
    Obtener solo datos de abatidos
    """
    
    def get(self, request):
        abatidos = Abatidos.objects.select_related('procedimiento').all()
        data = []
        
        for caso in abatidos:
            data.append({
                'ID_OPERATIVO': caso.procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': caso.procedimiento.id_procedimiento,
                'SERVICIO': caso.servicio,
                'FUERZA_DE_SEGURIDAD': caso.fuerza_de_seguridad,
                'EDAD': caso.edad,
                'SEXO': caso.sexo,
                'NACIONALIDAD': caso.nacionalidad,
                'PROVINCIA_EVENTO': caso.provincia_evento,
                'FECHA_EVENTO': caso.fecha_evento,
                'FECHA_IMPORTACION': caso.fecha_importacion
            })
        
        return Response(data)