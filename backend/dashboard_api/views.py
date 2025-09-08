import openpyxl
from django.contrib.auth import get_user_model
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
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO_O_PARTIDO': procedimiento.departamento_o_partido,
                
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
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO_O_PARTIDO': procedimiento.departamento_o_partido,
                
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
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO_O_PARTIDO': procedimiento.departamento_o_partido,
                
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
                'LOCALIDAD': procedimiento.localidad,
                'DIRECCION': procedimiento.direccion,
                'DEPARTAMENTO_O_PARTIDO': procedimiento.departamento_o_partido,
                
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


@extend_schema(
    tags=['Gestión de Datos'],
    summary='Subir datos operacionales',
    description='Subir archivo Excel con datos operacionales. Solo administradores. '
                'Procesa automáticamente y distribuye a tablas especializadas.',
    request=FileUploadSerializer,
    responses={
        200: UploadResultSerializer,
        400: {
            'description': 'Archivo requerido o inválido',
            'example': {'error': 'Archivo requerido'}
        },
        403: {
            'description': 'Permisos insuficientes',
            'example': {'error': 'Permisos insuficientes'}
        },
        500: {
            'description': 'Error procesando archivo',
            'example': {'error': 'Error al procesar archivo: [detalle]'}
        }
    }
)
class DataUploadView(APIView):
    """
    Upload operational data (equivalent to Node.js '/api/data/upload')
    Admin only - CON DISTRIBUCION INTELIGENTE A TABLAS ESPECIALIZADAS
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Check if user is admin
        if request.user.role != 'admin':
            return Response({
                'error': 'Permisos insuficientes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = FileUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Archivo requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        file = serializer.validated_data['file']
        
        try:
            # Load Excel workbook
            workbook = openpyxl.load_workbook(file, data_only=True)
            
            # Estadísticas de procesamiento
            stats = {
                'totalAdded': 0,
                'duplicatesSkipped': 0,
                'sheetsProcessed': [],
                'specialized_tables': {
                    'geografia_procedimientos': 0,
                    'vehiculos_controladas': 0,
                    'personal_afectados': 0,
                    'detenidos': 0,
                    'incautaciones': 0,
                    'trata_personas': 0,
                    'otros_delitos': 0,
                    'otros_eventos': 0,
                    'fallecidos': 0,
                    'abatidos': 0,
                    'codigos_operativos': 0
                }
            }
            
            # PASO 1: Procesar primero la tabla maestra GEOG. PROCEDIMIENTO
            master_table_processed = False
            master_sheet_data = {}
            
            # Recopilar todos los datos de las hojas primero
            for sheet_name in workbook.sheetnames:
                sheet = workbook[sheet_name]
                
                # Convert sheet to list of dictionaries
                headers = []
                sheet_data = []
                
                for row_num, row in enumerate(sheet.iter_rows(values_only=True), 1):
                    if row_num == 1:
                        # First row contains headers
                        headers = [str(cell) if cell is not None else f'Column_{i}' for i, cell in enumerate(row)]
                        continue
                    
                    # Skip empty rows
                    if all(cell in (None, '') for cell in row):
                        continue
                    
                    # Create row dictionary
                    row_dict = {}
                    for i, cell in enumerate(row):
                        if i < len(headers):
                            row_dict[headers[i]] = str(cell) if cell is not None else ''
                    
                    sheet_data.append(row_dict)
                
                if sheet_data:
                    master_sheet_data[sheet_name] = sheet_data
            
            # PASO 2: Procesar tabla maestra primero
            for sheet_name, sheet_data in master_sheet_data.items():
                if 'GEOG' in sheet_name.upper() and 'PROCEDIMIENTO' in sheet_name.upper():
                    logger.info(f"Procesando tabla maestra: {sheet_name}")
                    sheet_stats = self._process_sheet_data_to_specialized_tables(
                        sheet_data, sheet_name, file.name, stats
                    )
                    
                    stats['sheetsProcessed'].append({
                        'name': sheet_name,
                        'totalRows': len(sheet_data),
                        'added': sheet_stats['added'],
                        'skipped': sheet_stats['skipped']
                    })
                    
                    stats['totalAdded'] += sheet_stats['added']
                    stats['duplicatesSkipped'] += sheet_stats['skipped']
                    master_table_processed = True
                    break
            
            if not master_table_processed:
                logger.warning("No se encontró la hoja GEOG. PROCEDIMIENTO - procesando sin tabla maestra")
            
            # PASO 3: Procesar hojas especializadas
            for sheet_name, sheet_data in master_sheet_data.items():
                # Skip si ya procesamos la tabla maestra
                if 'GEOG' in sheet_name.upper() and 'PROCEDIMIENTO' in sheet_name.upper():
                    continue
                
                logger.info(f"Procesando hoja especializada: {sheet_name}")
                sheet_stats = self._process_sheet_data_to_specialized_tables(
                    sheet_data, sheet_name, file.name, stats
                )
                
                stats['sheetsProcessed'].append({
                    'name': sheet_name,
                    'totalRows': len(sheet_data),
                    'added': sheet_stats['added'],
                    'skipped': sheet_stats['skipped']
                })
                
                stats['totalAdded'] += sheet_stats['added']
                stats['duplicatesSkipped'] += sheet_stats['skipped']
            
            # ETL automático removido - archivo eliminado
            etl_result = {
                'status': 'disabled', 
                'message': 'ETL system removed', 
                'auto_executed': False
            }
            
            # Generate detailed filtering statistics
            filtering_details = self._generate_filtering_statistics(stats)
            
            return Response({
                'success': True,
                'message': 'Datos cargados exitosamente con nueva estructura',
                'stats': stats,
                'filtering_details': filtering_details,
                'total_records_processed': stats.get('totalAdded', 0),
                'total_records_created': sum(stats.get('specialized_tables', {}).values()),
                'etl_result': etl_result
            })
            
        except Exception as e:
            return Response({
                'error': f'Error al procesar archivo: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _process_sheet_data_to_specialized_tables(self, sheet_data, sheet_name, original_filename, global_stats):
        """
        Procesar datos de una hoja y distribuir inteligentemente a tablas especializadas
        CORREGIDO: Solo crear registros maestros desde hoja GEOG. PROCEDIMIENTO
        Las hojas especializadas solo referencian procedimientos existentes
        """
        sheet_stats = {'added': 0, 'skipped': 0}
        sheet_upper = sheet_name.upper()
        
        # Identificar si es la hoja maestra
        is_master_sheet = 'GEOG' in sheet_upper and 'PROCEDIMIENTO' in sheet_upper
        
        for row_data in sheet_data:
            try:
                procedimiento = None
                
                if is_master_sheet:
                    # TABLA MAESTRA: Crear nuevos registros de GeografiaProcedimiento
                    procedimiento = self._create_or_update_geografia_procedimiento(
                        row_data, sheet_name, original_filename
                    )
                    
                    if procedimiento:
                        sheet_stats['added'] += 1
                        global_stats['specialized_tables']['geografia_procedimientos'] += 1
                    else:
                        sheet_stats['skipped'] += 1
                        continue
                else:
                    # HOJA ESPECIALIZADA: Buscar procedimiento existente, NO crear nuevo
                    id_operativo = self._safe_str(row_data.get('ID_OPERATIVO'))
                    id_procedimiento = self._safe_str(row_data.get('ID_PROCEDIMIENTO'))
                    
                    if not id_operativo or not id_procedimiento:
                        logger.warning(f"Registro en {sheet_name} sin ID_OPERATIVO/ID_PROCEDIMIENTO válido - omitiendo")
                        sheet_stats['skipped'] += 1
                        continue
                    
                    # Buscar procedimiento existente en tabla maestra
                    procedimiento = GeografiaProcedimiento.objects.filter(
                        id_operativo=id_operativo,
                        id_procedimiento=id_procedimiento
                    ).first()
                    
                    if not procedimiento:
                        logger.warning(f"No se encontró procedimiento maestro para {id_operativo}_{id_procedimiento} en {sheet_name} - omitiendo")
                        sheet_stats['skipped'] += 1
                        continue
                    
                    # Crear registro en tabla especializada
                    specialized_created = self._distribute_to_specialized_table(
                        procedimiento, row_data, sheet_name, global_stats
                    )
                    
                    if specialized_created:
                        sheet_stats['added'] += 1
                    else:
                        sheet_stats['skipped'] += 1
                        
            except Exception as e:
                logger.error(f"Error procesando fila en {sheet_name}: {e}")
                sheet_stats['skipped'] += 1
        
        return sheet_stats
    
    def _create_or_update_geografia_procedimiento(self, row_data, sheet_name, original_filename):
        """
        Crear o actualizar registro en tabla maestra GeografiaProcedimiento
        """
        # Mapeo de campos comunes
        field_mapping = {
            'FUERZA_INTERVINIENTE': 'fuerza_interviniente',
            'ID_OPERATIVO': 'id_operativo',
            'ID_PROCEDIMIENTO': 'id_procedimiento',
            'UNIDAD_INTERVINIENTE': 'unidad_interviniente',
            'DESCRIPCIÓN': 'descripcion',
            'TIPO_INTERVENCION': 'tipo_intervencion',
            'PROVINCIA': 'provincia',
            'DEPARTAMENTO O PARTIDO': 'departamento_o_partido',
            'LOCALIDAD': 'localidad',
            'DIRECCION': 'direccion',
            'ZONA_SEGURIDAD_FRONTERAS': 'zona_seguridad_fronteras',
            'PASO_FRONTERIZO': 'paso_fronterizo',
            'LATITUD': 'latitud',
            'LONGITUD': 'longitud',
            'FECHA': 'fecha',
            'HORA': 'hora',
            'OTRAS AGENCIAS INTERVINIENTES': 'otras_agencias_intervinientes',
            'Observaciones - Detalles': 'observaciones',
        }
        
        # Extraer datos
        id_operativo = self._safe_str(row_data.get('ID_OPERATIVO'))
        id_procedimiento = self._safe_str(row_data.get('ID_PROCEDIMIENTO'))
        
        if not id_operativo or not id_procedimiento:
            return None
        
        # Buscar registro existente
        record_key = f"{id_operativo}_{id_procedimiento}_{sheet_name}"
        existing = GeografiaProcedimiento.objects.filter(record_key=record_key).first()
        
        if existing:
            return existing  # Ya existe, retornar sin crear duplicado
        
        # Crear nuevo registro
        procedimiento_data = {
            'hoja': sheet_name,
            'archivo_original': original_filename,
            'record_key': record_key
        }
        
        # Mapear campos
        for excel_field, model_field in field_mapping.items():
            if excel_field in row_data:
                value = row_data[excel_field]
                if value and value != '-':
                    procedimiento_data[model_field] = self._safe_str(value)
        
        # Procesar coordenadas
        if 'LATITUD' in row_data:
            procedimiento_data['latitud'] = self._safe_decimal(row_data['LATITUD'])
        if 'LONGITUD' in row_data:
            procedimiento_data['longitud'] = self._safe_decimal(row_data['LONGITUD'])
        
        # Crear instancia
        procedimiento = GeografiaProcedimiento.objects.create(**procedimiento_data)
        return procedimiento
    
    def _distribute_to_specialized_table(self, procedimiento, row_data, sheet_name, global_stats):
        """
        Distribuir datos a tabla especializada según tipo de hoja
        """
        sheet_upper = sheet_name.upper()
        
        try:
            if 'VEHI' in sheet_upper and 'PERSO' in sheet_upper and 'CONTROLADAS' in sheet_upper:
                return self._create_vehiculos_personas_controladas(procedimiento, row_data, global_stats)
            
            elif 'PERSONAL' in sheet_upper and 'ELEMENTOS' in sheet_upper and 'AFECTADOS' in sheet_upper:
                return self._create_personal_elementos_afectados(procedimiento, row_data, global_stats)
            
            elif 'DETENIDOS' in sheet_upper or 'APREHENDIDOS' in sheet_upper:
                return self._create_detenidos_aprehendidos(procedimiento, row_data, global_stats)
            
            elif 'INCAUTACIONES' in sheet_upper:
                return self._create_incautaciones(procedimiento, row_data, global_stats)
            
            elif 'TRATA' in sheet_upper or 'TRAFIC' in sheet_upper:
                return self._create_trata_trafico_personas(procedimiento, row_data, global_stats)
            
            elif 'OTROS DELITOS' in sheet_upper:
                return self._create_otros_delitos(procedimiento, row_data, global_stats)
            
            elif 'OTROS EVENTOS' in sheet_upper:
                return self._create_otros_eventos(procedimiento, row_data, global_stats)
            
            elif 'FALLECIDOS' in sheet_upper:
                return self._create_fallecidos(procedimiento, row_data, global_stats)
            
            elif 'ABATIDOS' in sheet_upper:
                return self._create_abatidos(procedimiento, row_data, global_stats)
            
            elif 'CODIGO' in sheet_upper and 'OPERATIVO' in sheet_upper:
                return self._create_codigo_operativo(procedimiento, row_data, global_stats)
            
            # Si no coincide con ningún patrón, solo contar como geografía
            global_stats['specialized_tables']['geografia_procedimientos'] += 1
            return True
            
        except Exception as e:
            print(f"Error creando datos especializados: {e}")
            return False
    
    def _create_vehiculos_personas_controladas(self, procedimiento, row_data, global_stats):
        """Crear registro en VehiculosPersonasControladas solo si hay datos reales"""
        # Validar que al menos una de las columnas clave no sea "-" 
        vehiculos_controlados = row_data.get('VEHICULOS_CONTROLADOS')
        personas_controladas = row_data.get('PERSONAS_CONTROLADAS')
        
        # Solo crear registro si hay datos reales (no "-")
        if (vehiculos_controlados and str(vehiculos_controlados).strip() != '-' and str(vehiculos_controlados).strip() != '') or \
           (personas_controladas and str(personas_controladas).strip() != '-' and str(personas_controladas).strip() != ''):
            
            VehiculosPersonasControladas.objects.create(
                procedimiento=procedimiento,
                vehiculos_controlados=self._safe_int(vehiculos_controlados),
                personas_controladas=self._safe_int(personas_controladas),
                cant_averiguaciones_secuestro=self._safe_int(row_data.get('CANT_AVERIGUACIONES_SECUESTRO')),
                cant_solicitudes_antecedentes=self._safe_int(row_data.get('CANT_SOLICITUDES_ANTECEDENTES')),
                cant_embarcaciones_controladas=self._safe_int(row_data.get('CANT_EMBARCACIONES_CONTROLADAS'))
            )
            global_stats['specialized_tables']['vehiculos_controladas'] += 1
            return True
        
        # No se creó el registro - datos son "-" (sin datos reales)
        return False
    
    def _create_personal_elementos_afectados(self, procedimiento, row_data, global_stats):
        """Crear registro en PersonalElementosAfectados solo si CANT_EFECTIVOS > 0"""
        # Validar que CANT_EFECTIVOS sea mayor a 0
        cant_efectivos = self._safe_int(row_data.get('CANT_EFECTIVOS'))
        
        # Solo crear registro si hay efectivos reales (> 0)
        if cant_efectivos and cant_efectivos > 0:
            PersonalElementosAfectados.objects.create(
                procedimiento=procedimiento,
                cant_efectivos=cant_efectivos,
                cant_autos_camionetas=self._safe_int(row_data.get('CANT_AUTOS_CAMIONETAS')),
                cant_scanners=self._safe_int(row_data.get('CANT_SCANNERS')),
                cant_embarcaciones=self._safe_int(row_data.get('CANT_EMBARCACIONES')),
                cant_motos=self._safe_int(row_data.get('CANT_MOTOS')),
                cant_caballos=self._safe_int(row_data.get('CANT_CABALLOS')),
                cant_canes=self._safe_int(row_data.get('CANT_CANES')),
                cant_morphrapid=self._safe_int(row_data.get('CANT_MORPHRAPID')),
                cant_lpr=self._safe_int(row_data.get('CANT_LPR'))
            )
            global_stats['specialized_tables']['personal_afectados'] += 1
            return True
        
        # No se creó el registro - sin efectivos (0 efectivos)
        return False
    
    def _create_detenidos_aprehendidos(self, procedimiento, row_data, global_stats):
        """Crear registro en DetenidosAprehendidos solo si EDAD != '-'"""
        # Validar que EDAD no sea "-" (indica que hay persona física detenida)
        edad_raw = row_data.get('EDAD')
        
        # Solo crear registro si hay datos reales de persona detenida (EDAD != "-")
        if edad_raw and str(edad_raw).strip() != '-' and str(edad_raw).strip() != '':
            DetenidosAprehendidos.objects.create(
                procedimiento=procedimiento,
                edad=self._safe_int(edad_raw),
                sexo=self._safe_str(row_data.get('SEXO')),
                nacionalidad=self._safe_str(row_data.get('NACIONALIDAD')),
                situacion_procesal=self._safe_str(row_data.get('SITUACION_PROCESAL')),
                delito_imputado=self._safe_str(row_data.get('DELITO_IMPUTADO')),
                juzgado_interviniente=self._safe_str(row_data.get('JUZGADO_INTERVINIENTE')),
                caratula_causa=self._safe_str(row_data.get('CARATULA_CAUSA')),
                num_causa=self._safe_str(row_data.get('NUM_CAUSA'))
            )
            global_stats['specialized_tables']['detenidos'] += 1
            return True
        
        # No se creó el registro - solo información administrativa, no persona física
        return False
    
    def _create_incautaciones(self, procedimiento, row_data, global_stats):
        """Crear registro en Incautaciones solo si INCAUTACIONES != '-'"""
        # Validar que INCAUTACIONES no sea "-" (indica que hay incautación real)
        incautaciones_raw = row_data.get('INCAUTACIONES')
        
        # Solo crear registro si hay datos reales de incautación (INCAUTACIONES != "-")
        if incautaciones_raw and str(incautaciones_raw).strip() != '-' and str(incautaciones_raw).strip() != '':
            Incautaciones.objects.create(
                procedimiento=procedimiento,
                incautaciones=self._safe_str(incautaciones_raw),
                tipo=self._safe_str(row_data.get('TIPO')),
                subtipo=self._safe_str(row_data.get('SUBTIPO')),
                cantidad=self._safe_str(row_data.get('CANTIDAD')),
                medidas=self._safe_str(row_data.get('MEDIDAS')),
                aforo=self._safe_decimal(row_data.get('AFORO')),
                observaciones=self._safe_str(row_data.get('OBSERVACIONES')),
                tipo_delito=self._safe_str(row_data.get('TIPO_DELITO')),
                juzgado_interviniente=self._safe_str(row_data.get('JUZGADO_INTERVINIENTE')),
                caratula_causa=self._safe_str(row_data.get('CARATULA_CAUSA')),
                num_causa=self._safe_str(row_data.get('NUM_CAUSA'))
            )
            global_stats['specialized_tables']['incautaciones'] += 1
            return True
        
        # No se creó el registro - no hay incautación real ("-")
        return False
    
    def _create_trata_trafico_personas(self, procedimiento, row_data, global_stats):
        """Crear registro en TrataTraficPersonas"""
        TrataTraficPersonas.objects.create(
            procedimiento=procedimiento,
            tipo_delito=self._safe_str(row_data.get('TIPO_DELITO')),
            sexo_victima=self._safe_str(row_data.get('SEXO_VICTIMA')),
            genero_victima=self._safe_str(row_data.get('GENERO_VICTIMA')),
            edad_victima=self._safe_int(row_data.get('EDAD_VICTIMA')),
            nacionalidad=self._safe_str(row_data.get('NACIONALIDAD')),
            juzgado_interviniente=self._safe_str(row_data.get('JUZGADO_INTERVINIENTE')),
            caratula_causa=self._safe_str(row_data.get('CARATULA_CAUSA')),
            num_causa=self._safe_str(row_data.get('NUM_CAUSA')),
            observaciones=self._safe_str(row_data.get('OBSERVACIONES'))
        )
        global_stats['specialized_tables']['trata_personas'] += 1
        return True
    
    def _create_otros_delitos(self, procedimiento, row_data, global_stats):
        """Crear registro en OtrosDelitos"""
        OtrosDelitos.objects.create(
            procedimiento=procedimiento,
            tipo_otro_delito=self._safe_str(row_data.get('TIPO_OTRO_DELITO')),
            sexo_victima=self._safe_str(row_data.get('SEXO_VICTIMA') or row_data.get('SEXO')),
            genero_victima=self._safe_str(row_data.get('GENERO_VICTIMA')),
            edad_victima=self._safe_int(row_data.get('EDAD_VICTIMA')),
            nacionalidad=self._safe_str(row_data.get('NACIONALIDAD')),
            observaciones=self._safe_str(row_data.get('OBSERVACIONES')),
            juzgado_interviniente=self._safe_str(row_data.get('JUZGADO_INTERVINIENTE')),
            caratula_causa=self._safe_str(row_data.get('CARATULA_CAUSA')),
            num_causa=self._safe_str(row_data.get('NUM_CAUSA'))
        )
        global_stats['specialized_tables']['otros_delitos'] += 1
        return True
    
    def _create_otros_eventos(self, procedimiento, row_data, global_stats):
        """Crear registro en OtrosEventos"""
        OtrosEventos.objects.create(
            procedimiento=procedimiento,
            tipo_siniestro=self._safe_str(row_data.get('TIPO_SINIESTRO')),
            cant_ilesos=self._safe_int(row_data.get('CANT_ILESOS')),
            cant_lesionados=self._safe_int(row_data.get('CANT_LESIONADOS')),
            cant_muertos=self._safe_int(row_data.get('CANT_MUERTOS')),
            observaciones=self._safe_str(row_data.get('OBSERVACIONES')),
            juzgado_interviniente=self._safe_str(row_data.get('JUZGADO_INTERVINIENTE')),
            caratula_causa=self._safe_str(row_data.get('CARATULA_CAUSA')),
            num_causa=self._safe_str(row_data.get('NUM_CAUSA'))
        )
        global_stats['specialized_tables']['otros_eventos'] += 1
        return True
    
    def _create_fallecidos(self, procedimiento, row_data, global_stats):
        """Crear registro en Fallecidos"""
        Fallecidos.objects.create(
            procedimiento=procedimiento,
            servicio=self._safe_str(row_data.get('SERVICIO')),
            fuerza_de_seguridad=self._safe_str(row_data.get('FUERZA DE SEGURIDAD')),
            cant_lesionados=self._safe_int(row_data.get('CANT_LESIONADOS')),
            cant_fallecidos=self._safe_int(row_data.get('CANT_FALLECIDOS')),
            provincia_evento=self._safe_str(row_data.get('PROVINCIA')),
            departamento_evento=self._safe_str(row_data.get('DEPARTAMENTO O PARTIDO')),
            localidad_evento=self._safe_str(row_data.get('LOCALIDAD')),
            latitud_evento=self._safe_decimal(row_data.get('LATITUD')),
            longitud_evento=self._safe_decimal(row_data.get('LONGITUD')),
            fecha_evento=self._safe_str(row_data.get('FECHA')),
            hora_evento=self._safe_str(row_data.get('HORA'))
        )
        global_stats['specialized_tables']['fallecidos'] += 1
        return True
    
    def _create_abatidos(self, procedimiento, row_data, global_stats):
        """Crear registro en Abatidos"""
        Abatidos.objects.create(
            procedimiento=procedimiento,
            servicio=self._safe_str(row_data.get('SERVICIO')),
            fuerza_de_seguridad=self._safe_str(row_data.get('FUERZA DE SEGURIDAD')),
            edad=self._safe_int(row_data.get('EDAD')),
            sexo=self._safe_str(row_data.get('SEXO')),
            nacionalidad=self._safe_str(row_data.get('NACIONALIDAD')),
            terceros_damnificados=self._safe_str(row_data.get('TERCEROS DAMNIFICADOS')),
            provincia_evento=self._safe_str(row_data.get('PROVINCIA')),
            departamento_evento=self._safe_str(row_data.get('DEPARTAMENTO O PARTIDO')),
            localidad_evento=self._safe_str(row_data.get('LOCALIDAD')),
            latitud_evento=self._safe_decimal(row_data.get('LATITUD')),
            longitud_evento=self._safe_decimal(row_data.get('LONGITUD')),
            fecha_evento=self._safe_str(row_data.get('FECHA')),
            hora_evento=self._safe_str(row_data.get('HORA'))
        )
        global_stats['specialized_tables']['abatidos'] += 1
        return True
    
    def _create_codigo_operativo(self, procedimiento, row_data, global_stats):
        """Crear registro en CodigoOperativo"""
        # Verificar que no existe ya (OneToOne relationship)
        if not hasattr(procedimiento, 'codigo_operativo'):
            CodigoOperativo.objects.create(
                procedimiento=procedimiento,
                codigo_operativo=self._safe_str(row_data.get('CODIGO_OPERATIVO'))
            )
            global_stats['specialized_tables']['codigos_operativos'] += 1
        return True
    
    def _safe_str(self, value):
        """Convertir valor a string de forma segura"""
        if value is None or str(value).strip() in ['None', 'null', '-', '']:
            return None
        return str(value).strip()

    def _safe_int(self, value):
        """Convertir valor a int de forma segura"""
        if not value or str(value).strip() in ['-', '', 'None', 'null']:
            return None
        try:
            return int(float(str(value)))
        except (ValueError, TypeError):
            return None

    def _safe_decimal(self, value):
        """Convertir valor a Decimal de forma segura"""
        if not value or str(value).strip() in ['-', '', 'None', 'null']:
            return None
        try:
            clean_value = str(value).replace(',', '.').strip()
            return Decimal(clean_value)
        except (InvalidOperation, ValueError):
            return None
    
    def _process_master_table(self, sheet_data, sheet_name, original_filename, global_stats):
        """
        Procesar la hoja GEOG. PROCEDIMIENTO como tabla maestra
        Crea TODOS los procedimientos base
        """
        sheet_stats = {'added': 0, 'skipped': 0}
        
        for row_data in sheet_data:
            try:
                # Crear registro en tabla maestra
                procedimiento = self._create_or_update_geografia_procedimiento(
                    row_data, sheet_name, original_filename
                )
                
                if procedimiento:
                    sheet_stats['added'] += 1
                    global_stats['specialized_tables']['geografia_procedimientos'] += 1
                else:
                    sheet_stats['skipped'] += 1
                    
            except Exception as e:
                print(f"Error procesando tabla maestra: {e}")
                sheet_stats['skipped'] += 1
        
        return sheet_stats
    
    def _get_or_cache_master_procedure(self, id_operativo, id_procedimiento, cache):
        """
        Buscar procedimiento en tabla maestra usando cache para optimizar
        """
        cache_key = f"{id_operativo}_{id_procedimiento}"
        
        if cache_key not in cache:
            try:
                procedimiento = GeografiaProcedimiento.objects.filter(
                    id_operativo=id_operativo,
                    id_procedimiento=id_procedimiento
                ).first()
                cache[cache_key] = procedimiento
            except Exception:
                cache[cache_key] = None
        
        return cache[cache_key]
    
    def _has_meaningful_data(self, row_data, sheet_name):
        """
        Verificar si una fila tiene datos significativos para crear registro especializado
        No crear registros vacíos o solo con valores "-", null, etc.
        """
        sheet_upper = sheet_name.upper()
        
        # Definir campos relevantes por tipo de hoja
        meaningful_fields = {
            'DETENIDOS': ['EDAD', 'SEXO', 'NACIONALIDAD', 'SITUACION_PROCESAL', 'DELITO_IMPUTADO'],
            'INCAUTACIONES': ['INCAUTACIONES', 'TIPO', 'CANTIDAD', 'OBSERVACIONES'],
            'TRATA': ['TIPO_DELITO', 'SEXO_VICTIMA', 'EDAD_VICTIMA'],
            'OTROS DELITOS': ['TIPO_OTRO_DELITO', 'SEXO_VICTIMA', 'EDAD_VICTIMA'],
            'OTROS EVENTOS': ['TIPO_SINIESTRO', 'CANT_ILESOS', 'CANT_LESIONADOS', 'CANT_MUERTOS'],
            'FALLECIDOS': ['CANT_FALLECIDOS', 'CANT_LESIONADOS', 'FUERZA DE SEGURIDAD'],
            'ABATIDOS': ['EDAD', 'SEXO', 'NACIONALIDAD', 'FUERZA DE SEGURIDAD'],
            'VEHICULOS': ['VEHICULOS_CONTROLADOS', 'PERSONAS_CONTROLADAS'],
            'PERSONAL': ['CANT_EFECTIVOS', 'CANT_AUTOS_CAMIONETAS'],
            'CODIGO': ['CODIGO_OPERATIVO']
        }
        
        # Determinar qué campos verificar según el tipo de hoja
        fields_to_check = []
        for key, fields in meaningful_fields.items():
            if key in sheet_upper:
                fields_to_check = fields
                break
        
        if not fields_to_check:
            return True  # Si no sabemos qué verificar, asumimos que tiene datos
        
        # Verificar si al menos un campo tiene datos reales
        for field in fields_to_check:
            value = row_data.get(field)
            if value and str(value).strip() not in ['-', '', 'None', 'null']:
                return True
        
        return False
    
    def _generate_filtering_statistics(self, stats):
        """
        Generate detailed filtering statistics showing before/after counts
        """
        specialized_tables = stats.get('specialized_tables', {})
        total_geografia = specialized_tables.get('geografia_procedimientos', 0)
        
        # Define filtering criteria for each table
        criterios = {
            'incautaciones': 'INCAUTACIONES ≠ "-"',
            'detenidos': 'EDAD ≠ "-"', 
            'controlados': 'VEHICULOS_CONTROLADOS ≠ "-" OR PERSONAS_CONTROLADAS ≠ "-"',
            'afectados': 'CANT_EFECTIVOS > 0',
            'trata_personas': 'Todos los registros (sin filtrado)',
            'otros_delitos': 'Todos los registros (sin filtrado)',
            'otros_eventos': 'Todos los registros (sin filtrado)',
            'fallecidos': 'Todos los registros (sin filtrado)',
            'abatidos': 'Todos los registros (sin filtrado)',
            'codigos_operativos': 'Todos los registros (sin filtrado)'
        }
        
        filtering_details = []
        
        # Tables that should be filtered (have reduction from master table)
        filtered_tables = ['incautaciones', 'vehiculos_controladas', 'personal_afectados', 'detenidos']
        
        for table_key, count in specialized_tables.items():
            if table_key == 'geografia_procedimientos':
                continue  # Skip master table
                
            # Map internal table names to display names
            table_display_names = {
                'vehiculos_controladas': 'controlados',
                'personal_afectados': 'afectados',
                'detenidos': 'detenidos',
                'incautaciones': 'incautaciones',
                'trata_personas': 'trata_personas',
                'otros_delitos': 'otros_delitos',
                'otros_eventos': 'otros_eventos',
                'fallecidos': 'fallecidos',
                'abatidos': 'abatidos',
                'codigos_operativos': 'codigos_operativos'
            }
            
            display_name = table_display_names.get(table_key, table_key)
            
            # Calculate statistics
            if table_key in filtered_tables:
                registros_omitidos = max(0, total_geografia - count)
                porcentaje_reduccion = (registros_omitidos / total_geografia * 100) if total_geografia > 0 else 0
            else:
                registros_omitidos = 0
                porcentaje_reduccion = 0
            
            filtering_details.append({
                'tabla': display_name.replace('_', ' ').title(),
                'registros_total': total_geografia,
                'registros_filtrados': count,
                'registros_omitidos': registros_omitidos,
                'porcentaje_reduccion': round(porcentaje_reduccion, 2),
                'criterio_filtrado': criterios.get(display_name, 'Sin criterio especificado')
            })
        
        return filtering_details


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
            # Clear all related data first (due to foreign key constraints)
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
            
            # Clear master table
            GeografiaProcedimiento.objects.all().delete()
            
            return Response({
                'success': True,
                'message': 'Todos los datos han sido eliminados (nueva estructura)'
            })
        except Exception as e:
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
                'ID_OPERATIVO': 'OP001',
                'ID_PROCEDIMIENTO': 'PROC001',
                'PROVINCIA': 'Buenos Aires',
                'FECHA': '2025-01-15',
                'EDAD': 25,
                'SEXO': 'M',
                'NACIONALIDAD': 'Argentina',
                'LATITUD': -34.6037,
                'LONGITUD': -58.3816
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
                'ID_OPERATIVO': 'OP001',
                'ID_PROCEDIMIENTO': 'PROC001',
                'PROVINCIA': 'Buenos Aires',
                'FECHA': '2025-01-15',
                'TIPO': 'Drogas',
                'CANTIDAD': '5kg',
                'LATITUD': -34.6037,
                'LONGITUD': -58.3816
            }]
        }
    }
)
class IncautacionesListView(APIView):
    """
    Obtener solo datos de incautaciones
    """
    
    def get(self, request):
        incautaciones = Incautaciones.objects.select_related('procedimiento').all()
        data = []
        
        for incautacion in incautaciones:
            data.append({
                'ID_OPERATIVO': incautacion.procedimiento.id_operativo,
                'ID_PROCEDIMIENTO': incautacion.procedimiento.id_procedimiento,
                'PROVINCIA': incautacion.procedimiento.provincia,
                'FECHA': incautacion.procedimiento.fecha,
                'TIPO': incautacion.tipo,
                'SUBTIPO': incautacion.subtipo,
                'CANTIDAD': incautacion.cantidad,
                'MEDIDAS': incautacion.medidas,
                'AFORO': float(incautacion.aforo) if incautacion.aforo else None,
                'TIPO_DELITO': incautacion.tipo_delito,
                # Agregar información geográfica para visualización en mapas
                'LATITUD': float(incautacion.procedimiento.latitud) if incautacion.procedimiento.latitud else None,
                'LONGITUD': float(incautacion.procedimiento.longitud) if incautacion.procedimiento.longitud else None,
                'DESCRIPCIÓN': incautacion.procedimiento.descripcion,
                'LOCALIDAD': incautacion.procedimiento.localidad,
                'DIRECCION': incautacion.procedimiento.direccion,
                'DEPARTAMENTO O PARTIDO': incautacion.procedimiento.departamento_o_partido,
                'FECHA_IMPORTACION': incautacion.fecha_importacion
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
                'ID_OPERATIVO': 'OP001',
                'PROVINCIA': 'Buenos Aires',
                'TIPO_DELITO': 'Trata de personas',
                'SEXO_VICTIMA': 'F',
                'EDAD_VICTIMA': 22,
                'LATITUD': -34.6037,
                'LONGITUD': -58.3816
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
                'TIPO_DELITO': caso.tipo_delito,
                'SEXO_VICTIMA': caso.sexo_victima,
                'GENERO_VICTIMA': caso.genero_victima,
                'EDAD_VICTIMA': caso.edad_victima,
                'NACIONALIDAD': caso.nacionalidad,
                # Agregar información geográfica para visualización en mapas
                'LATITUD': float(caso.procedimiento.latitud) if caso.procedimiento.latitud else None,
                'LONGITUD': float(caso.procedimiento.longitud) if caso.procedimiento.longitud else None,
                'DESCRIPCIÓN': caso.procedimiento.descripcion,
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