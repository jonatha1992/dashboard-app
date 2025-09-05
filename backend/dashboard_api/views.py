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
    FileUploadSerializer
)
from .authentication import generate_jwt_token

User = get_user_model()


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


class CurrentUserView(APIView):
    """
    Get current user info (equivalent to Node.js '/api/auth/me')
    """
    def get(self, request):
        user_serializer = UserSerializer(request.user)
        return Response({
            'user': user_serializer.data
        })


class DataListView(APIView):
    """
    Get operational data (equivalent to Node.js '/api/data')
    Devuelve datos de la tabla maestra GeografiaProcedimiento
    """
    def get(self, request):
        data = GeografiaProcedimiento.objects.all()
        serializer = GeografiaProcedimientoSerializer(data, many=True)
        return Response(serializer.data)


class DataStatsView(APIView):
    """
    Get data statistics (equivalent to Node.js '/api/data/stats')
    """
    def get(self, request):
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
            earliest_date = valid_dates.first().fecha_iso  # Usar fecha_iso en formato ISO
            latest_date = valid_dates.last().fecha_iso      # Usar fecha_iso en formato ISO
            date_range = {
                'earliest': earliest_date.isoformat() if earliest_date else None,
                'latest': latest_date.isoformat() if latest_date else None
            }
        
        # Get unique sheets
        sheets = list(all_data.values_list('hoja', flat=True).distinct())
        sheets = [sheet for sheet in sheets if sheet]  # Remove None values
        
        # Get unique provinces
        provinces = list(all_data.values_list('provincia', flat=True).distinct())
        provinces = [prov for prov in provinces if prov and prov != '-']  # Remove None and '-'
        
        stats_data = {
            'totalRecords': all_data.count(),
            'sheets': sheets,
            'dateRange': date_range,
            'provinces': provinces
        }
        
        return Response(stats_data)


class DataUploadView(APIView):
    """
    Upload operational data (equivalent to Node.js '/api/data/upload')
    Admin only - CON DISTRIBUCION INTELIGENTE A TABLAS ESPECIALIZADAS
    """
    
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
                
                if not sheet_data:
                    continue
                
                # Process each row with intelligent distribution
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
            
            # Ejecutar ETL automático después de upload exitoso
            etl_result = None
            try:
                logger.info("Ejecutando ETL automático post-upload")
                from .etl_dimensions import DimensionETLProcessor
                etl_processor = DimensionETLProcessor()
                etl_result = etl_processor.run_full_etl_auto()
                logger.info(f"ETL automático completado: {etl_result.get('status')}")
            except Exception as e:
                logger.error(f"Error en ETL automático: {str(e)}")
                # No falla el upload, solo logea el error
                etl_result = {
                    'status': 'error', 
                    'message': str(e), 
                    'auto_executed': True
                }
            
            return Response({
                'success': True,
                'message': 'Datos cargados exitosamente con nueva estructura',
                'stats': stats,
                'etl_result': etl_result
            })
            
        except Exception as e:
            return Response({
                'error': f'Error al procesar archivo: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _process_sheet_data_to_specialized_tables(self, sheet_data, sheet_name, original_filename, global_stats):
        """
        Procesar datos de una hoja y distribuir inteligentemente a tablas especializadas
        """
        sheet_stats = {'added': 0, 'skipped': 0}
        
        for row_data in sheet_data:
            try:
                # 1. Crear/actualizar registro en tabla maestra
                procedimiento = self._create_or_update_geografia_procedimiento(
                    row_data, sheet_name, original_filename
                )
                
                if procedimiento is None:
                    sheet_stats['skipped'] += 1
                    continue
                
                # 2. Distribuir a tabla especializada según tipo de hoja
                specialized_created = self._distribute_to_specialized_table(
                    procedimiento, row_data, sheet_name, global_stats
                )
                
                if specialized_created:
                    sheet_stats['added'] += 1
                else:
                    sheet_stats['skipped'] += 1
                    
            except Exception as e:
                print(f"Error procesando fila: {e}")
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
        """Crear registro en VehiculosPersonasControladas"""
        VehiculosPersonasControladas.objects.create(
            procedimiento=procedimiento,
            vehiculos_controlados=self._safe_int(row_data.get('VEHICULOS_CONTROLADOS')),
            personas_controladas=self._safe_int(row_data.get('PERSONAS_CONTROLADAS')),
            cant_averiguaciones_secuestro=self._safe_int(row_data.get('CANT_AVERIGUACIONES_SECUESTRO')),
            cant_solicitudes_antecedentes=self._safe_int(row_data.get('CANT_SOLICITUDES_ANTECEDENTES')),
            cant_embarcaciones_controladas=self._safe_int(row_data.get('CANT_EMBARCACIONES_CONTROLADAS'))
        )
        global_stats['specialized_tables']['vehiculos_controladas'] += 1
        return True
    
    def _create_personal_elementos_afectados(self, procedimiento, row_data, global_stats):
        """Crear registro en PersonalElementosAfectados"""
        PersonalElementosAfectados.objects.create(
            procedimiento=procedimiento,
            cant_efectivos=self._safe_int(row_data.get('CANT_EFECTIVOS')),
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
    
    def _create_detenidos_aprehendidos(self, procedimiento, row_data, global_stats):
        """Crear registro en DetenidosAprehendidos"""
        DetenidosAprehendidos.objects.create(
            procedimiento=procedimiento,
            edad=self._safe_int(row_data.get('EDAD')),
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
    
    def _create_incautaciones(self, procedimiento, row_data, global_stats):
        """Crear registro en Incautaciones"""
        Incautaciones.objects.create(
            procedimiento=procedimiento,
            incautaciones=self._safe_str(row_data.get('INCAUTACIONES')),
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


class DataClearView(APIView):
    """
    Clear all data (equivalent to Node.js '/api/data/clear')
    Admin only
    """
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
                'FECHA_IMPORTACION': detenido.fecha_importacion
            })
        
        return Response(data)


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
                'FECHA_IMPORTACION': incautacion.fecha_importacion
            })
        
        return Response(data)


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
                'FECHA_IMPORTACION': caso.fecha_importacion
            })
        
        return Response(data)


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