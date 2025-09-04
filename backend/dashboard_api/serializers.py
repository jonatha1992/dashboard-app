from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, OperationalData


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include "username" and "password".')
            
        return data


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


class OperationalDataSerializer(serializers.ModelSerializer):
    """
    Serializer for OperationalData model
    """
    # Convert Decimal fields to float for JSON compatibility
    LATITUD = serializers.SerializerMethodField()
    LONGITUD = serializers.SerializerMethodField()
    
    class Meta:
        model = OperationalData
        fields = '__all__'
        
    def get_LATITUD(self, obj):
        """Convert latitud to float or return original value"""
        if obj.latitud is not None:
            return float(obj.latitud)
        return obj.latitud
    
    def get_LONGITUD(self, obj):
        """Convert longitud to float or return original value"""
        if obj.longitud is not None:
            return float(obj.longitud)
        return obj.longitud
    
    def to_representation(self, instance):
        """
        Convert the model fields to match the Node.js backend format
        """
        data = super().to_representation(instance)
        
        # Map Django model fields to Node.js format
        mapped_data = {
            'FUERZA_INTERVINIENTE': data.get('fuerza_interviniente'),
            'ID_OPERATIVO': data.get('id_operativo'),
            'ID_PROCEDIMIENTO': data.get('id_procedimiento'),
            'UNIDAD_INTERVINIENTE': data.get('unidad_interviniente'),
            'DESCRIPCIÓN': data.get('descripcion'),
            'TIPO_INTERVENCION': data.get('tipo_intervencion'),
            'PROVINCIA': data.get('provincia'),
            'PROVINCIA_KEY': data.get('provincia_key'),
            'DEPARTAMENTO O PARTIDO': data.get('departamento_o_partido'),
            'LOCALIDAD': data.get('localidad'),
            'DIRECCION': data.get('direccion'),
            'ZONA_SEGURIDAD_FRONTERAS': data.get('zona_seguridad_fronteras'),
            'PASO_FRONTERIZO': data.get('paso_fronterizo'),
            'LATITUD': data.get('LATITUD'),  # Uses SerializerMethodField
            'LONGITUD': data.get('LONGITUD'),  # Uses SerializerMethodField
            'FECHA': data.get('fecha'),
            'FECHA_ISO': data.get('fecha_iso'),
            'HORA': data.get('hora'),
            'OTRAS AGENCIAS INTERVINIENTES': data.get('otras_agencias_intervinientes'),
            'Observaciones - Detalles': data.get('observaciones'),
            'HOJA': data.get('hoja'),
            'ARCHIVO_ORIGINAL': data.get('archivo_original'),
            'FECHA_IMPORTACION': data.get('fecha_importacion'),
            'record_key': data.get('record_key'),
        }
        
        # Add any extra data
        if data.get('extra_data'):
            mapped_data.update(data['extra_data'])
            
        return mapped_data


class DataStatsSerializer(serializers.Serializer):
    """
    Serializer for data statistics (equivalent to Node.js /api/data/stats)
    """
    totalRecords = serializers.IntegerField()
    sheets = serializers.ListField(child=serializers.CharField())
    dateRange = serializers.DictField()
    provinces = serializers.ListField(child=serializers.CharField())


class FileUploadSerializer(serializers.Serializer):
    """
    Serializer for file upload
    """
    file = serializers.FileField()
    
    def validate_file(self, value):
        """Validate uploaded file"""
        if not value.name.endswith(('.xlsx', '.xls')):
            raise serializers.ValidationError('File must be an Excel file (.xlsx or .xls)')
        return value