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

from .models import OperationalData
from .serializers import (
    LoginSerializer, 
    UserSerializer, 
    OperationalDataSerializer, 
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
            'message': 'Dashboard Django API',
            'version': '1.0.0',
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
    """
    def get(self, request):
        data = OperationalData.objects.all()
        serializer = OperationalDataSerializer(data, many=True)
        return Response(serializer.data)


class DataStatsView(APIView):
    """
    Get data statistics (equivalent to Node.js '/api/data/stats')
    """
    def get(self, request):
        # Get all data
        all_data = OperationalData.objects.all()
        
        # Get GEOG. PROCEDIMIENTO data specifically for date range
        geog_data = all_data.filter(hoja='GEOG. PROCEDIMIENTO')
        
        # Calculate date range from GEOG. PROCEDIMIENTO only
        date_range = {'earliest': None, 'latest': None}
        
        valid_dates = geog_data.filter(
            fecha_iso__isnull=False
        ).exclude(
            fecha__in=['-', '', None]
        ).order_by('fecha_iso')
        
        if valid_dates.exists():
            earliest_date = valid_dates.first().fecha
            latest_date = valid_dates.last().fecha
            date_range = {
                'earliest': earliest_date,
                'latest': latest_date
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
    Admin only
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
            
            total_added = 0
            duplicates_skipped = 0
            sheets_processed = []
            
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
                
                # Process each row
                sheet_added = 0
                sheet_skipped = 0
                
                for row_data in sheet_data:
                    # Create operational data instance
                    operational_data = self._create_operational_data(row_data, sheet_name, file.name)
                    
                    # Check for duplicates
                    if OperationalData.objects.filter(record_key=operational_data.record_key).exists():
                        sheet_skipped += 1
                        duplicates_skipped += 1
                        continue
                    
                    # Save new record
                    operational_data.save()
                    sheet_added += 1
                    total_added += 1
                
                sheets_processed.append({
                    'name': sheet_name,
                    'totalRows': len(sheet_data),
                    'added': sheet_added,
                    'skipped': sheet_skipped
                })
            
            return Response({
                'success': True,
                'message': 'Datos cargados exitosamente',
                'stats': {
                    'totalAdded': total_added,
                    'duplicatesSkipped': duplicates_skipped,
                    'totalRecords': OperationalData.objects.count(),
                    'sheetsProcessed': sheets_processed
                }
            })
            
        except Exception as e:
            return Response({
                'error': f'Error al procesar archivo: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_operational_data(self, row_data, sheet_name, original_filename):
        """
        Create OperationalData instance from row data
        """
        # Map Excel columns to model fields (flexible mapping)
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
        
        # Create instance
        data_instance = OperationalData()
        
        # Set mapped fields
        for excel_field, model_field in field_mapping.items():
            if excel_field in row_data:
                value = row_data[excel_field]
                if value and value != '-':
                    setattr(data_instance, model_field, value)
        
        # Handle coordinate fields (convert to Decimal)
        if 'LATITUD' in row_data and row_data['LATITUD'] != '-':
            try:
                data_instance.latitud = float(row_data['LATITUD'].replace(',', '.'))
            except (ValueError, AttributeError):
                pass
                
        if 'LONGITUD' in row_data and row_data['LONGITUD'] != '-':
            try:
                data_instance.longitud = float(row_data['LONGITUD'].replace(',', '.'))
            except (ValueError, AttributeError):
                pass
        
        # Set metadata
        data_instance.hoja = sheet_name
        data_instance.archivo_original = original_filename
        
        # Store any extra fields
        extra_data = {}
        for key, value in row_data.items():
            if key not in field_mapping and value and value != '-':
                extra_data[key] = value
        data_instance.extra_data = extra_data
        
        # Generate record key (will be set in save method if not provided)
        data_instance.record_key = f"{data_instance.id_operativo or 'N/A'}_{data_instance.id_procedimiento or 'N/A'}_{sheet_name}"
        
        return data_instance


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
            OperationalData.objects.all().delete()
            return Response({
                'success': True,
                'message': 'Todos los datos han sido eliminados'
            })
        except Exception as e:
            return Response({
                'error': 'Error al limpiar datos'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)