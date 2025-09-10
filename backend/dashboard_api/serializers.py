from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, 
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


class GeografiaProcedimientoSerializer(serializers.ModelSerializer):
    """
    Serializer for GeografiaProcedimiento model (tabla maestra)
    """
    # Convert Decimal fields to float for JSON compatibility
    LATITUD = serializers.SerializerMethodField()
    LONGITUD = serializers.SerializerMethodField()
    
    class Meta:
        model = GeografiaProcedimiento
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
        Convert the model fields to match the frontend format
        """
        data = super().to_representation(instance)
        
        # Map Django model fields to frontend format
        mapped_data = {
            'FUERZA_INTERVINIENTE': data.get('fuerza_interviniente'),
            'ID_OPERATIVO': data.get('id_operativo'),
            'ID_PROCEDIMIENTO': data.get('id_procedimiento'),
            'UNIDAD_INTERVINIENTE': data.get('unidad_interviniente') or data.get('fuerza_interviniente'),
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
            
        return mapped_data


class VehiculosPersonasControladasSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiculosPersonasControladas
        fields = '__all__'


class PersonalElementosAfectadosSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalElementosAfectados
        fields = '__all__'


class DetenidosAprehendidosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetenidosAprehendidos
        fields = '__all__'


class IncautacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incautaciones
        fields = '__all__'


class TrataTraficPersonasSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrataTraficPersonas
        fields = '__all__'


class OtrosDelitosSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtrosDelitos
        fields = '__all__'


class OtrosEventosSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtrosEventos
        fields = '__all__'


class FallecidosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fallecidos
        fields = '__all__'


class AbatidosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abatidos
        fields = '__all__'


class CodigoOperativoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodigoOperativo
        fields = '__all__'


class DataStatsSerializer(serializers.Serializer):
    """
    Serializer for data statistics
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


class FilteringStatsSerializer(serializers.Serializer):
    """
    Serializer for filtering statistics showing before/after record counts
    """
    tabla = serializers.CharField()
    registros_total = serializers.IntegerField()
    registros_filtrados = serializers.IntegerField()
    registros_omitidos = serializers.IntegerField()
    porcentaje_reduccion = serializers.FloatField()
    criterio_filtrado = serializers.CharField()


class UploadResultSerializer(serializers.Serializer):
    """
    Enhanced serializer for upload results with detailed filtering statistics
    """
    stats = serializers.DictField()
    filtering_details = FilteringStatsSerializer(many=True)
    total_records_processed = serializers.IntegerField()
    total_records_created = serializers.IntegerField()
    etl_result = serializers.DictField(required=False)


class SpecializedTableStatsSerializer(serializers.Serializer):
    """
    Serializer for specialized table statistics
    """
    incautaciones_count = serializers.IntegerField()
    detenidos_count = serializers.IntegerField()
    controlados_count = serializers.IntegerField()
    afectados_count = serializers.IntegerField()
    trata_count = serializers.IntegerField()
    otros_delitos_count = serializers.IntegerField()
    otros_eventos_count = serializers.IntegerField()
    fallecidos_count = serializers.IntegerField()
    abatidos_count = serializers.IntegerField()
    codigos_count = serializers.IntegerField()
    total_specialized_records = serializers.IntegerField()


class FilteredIncautacionesSerializer(serializers.ModelSerializer):
    """
    Serializer for filtered incautaciones (only real seizures)
    """
    procedimiento_info = GeografiaProcedimientoSerializer(source='procedimiento', read_only=True)
    
    class Meta:
        model = Incautaciones
        fields = '__all__'


class FilteredDetenidosSerializer(serializers.ModelSerializer):
    """
    Serializer for filtered detenidos (only real detained persons)
    """
    procedimiento_info = GeografiaProcedimientoSerializer(source='procedimiento', read_only=True)
    
    class Meta:
        model = DetenidosAprehendidos
        fields = '__all__'


class FilteredControladosSerializer(serializers.ModelSerializer):
    """
    Serializer for filtered controlados (only real controls)
    """
    procedimiento_info = GeografiaProcedimientoSerializer(source='procedimiento', read_only=True)
    
    class Meta:
        model = VehiculosPersonasControladas
        fields = '__all__'


class FilteredAfectadosSerializer(serializers.ModelSerializer):
    """
    Serializer for filtered afectados (only real affected personnel)
    """
    procedimiento_info = GeografiaProcedimientoSerializer(source='procedimiento', read_only=True)
    
    class Meta:
        model = PersonalElementosAfectados
        fields = '__all__'