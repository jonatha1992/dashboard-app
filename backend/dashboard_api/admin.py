from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
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


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin configuration for custom User model
    """
    list_display = ('username', 'email', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff', 'created_at')
    search_fields = ('username', 'email')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Dashboard Info', {'fields': ('role', 'created_at')}),
    )
    readonly_fields = ('created_at',)


# Inline classes para mostrar datos relacionados
class VehiculosPersonasControladasInline(admin.TabularInline):
    model = VehiculosPersonasControladas
    extra = 0
    max_num = 1


class PersonalElementosAfectadosInline(admin.TabularInline):
    model = PersonalElementosAfectados
    extra = 0
    max_num = 1


class DetenidosAprehendidosInline(admin.TabularInline):
    model = DetenidosAprehendidos
    extra = 0
    fields = ('edad', 'sexo', 'nacionalidad', 'situacion_procesal', 'delito_imputado')


class IncautacionesInline(admin.TabularInline):
    model = Incautaciones
    extra = 0
    fields = ('tipo', 'cantidad', 'medidas', 'aforo')


class CodigoOperativoInline(admin.StackedInline):
    model = CodigoOperativo
    extra = 0
    max_num = 1


@admin.register(GeografiaProcedimiento)
class GeografiaProcedimientoAdmin(admin.ModelAdmin):
    """
    Admin configuration for GeografiaProcedimiento (tabla maestra)
    """
    list_display = (
        'id_operativo', 
        'id_procedimiento', 
        'descripcion_short', 
        'provincia', 
        'fecha_iso', 
        'hoja',
        'fecha_importacion'
    )
    
    list_filter = (
        'hoja', 
        'provincia', 
        'tipo_intervencion',
        'fecha_iso',
        'fecha_importacion'
    )
    
    search_fields = (
        'id_operativo', 
        'id_procedimiento', 
        'descripcion',
        'provincia',
        'departamento_o_partido'
    )
    
    ordering = ('-fecha_importacion', '-fecha_iso')
    
    readonly_fields = (
        'provincia_key', 
        'fecha_iso', 
        'fecha_importacion', 
        'record_key'
    )
    
    fieldsets = (
        ('Identificación', {
            'fields': ('id_operativo', 'id_procedimiento', 'record_key')
        }),
        ('Operación', {
            'fields': (
                'fuerza_interviniente', 
                'unidad_interviniente', 
                'descripcion', 
                'tipo_intervencion'
            )
        }),
        ('Ubicación', {
            'fields': (
                'provincia', 
                'provincia_key',
                'departamento_o_partido', 
                'localidad', 
                'direccion',
                'latitud',
                'longitud'
            )
        }),
        ('Fecha y Hora', {
            'fields': ('fecha', 'fecha_iso', 'hora')
        }),
        ('Fronteras', {
            'fields': ('zona_seguridad_fronteras', 'paso_fronterizo'),
            'classes': ('collapse',)
        }),
        ('Información Adicional', {
            'fields': ('otras_agencias_intervinientes', 'observaciones'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'hoja', 
                'archivo_original', 
                'fecha_importacion'
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Inlines para mostrar datos relacionados
    inlines = [
        CodigoOperativoInline,
        VehiculosPersonasControladasInline,
        PersonalElementosAfectadosInline,
        DetenidosAprehendidosInline,
        IncautacionesInline,
    ]
    
    def descripcion_short(self, obj):
        """Show short description"""
        if obj.descripcion:
            return obj.descripcion[:50] + '...' if len(obj.descripcion) > 50 else obj.descripcion
        return '-'
    descripcion_short.short_description = 'Descripción'
    
    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related()


@admin.register(DetenidosAprehendidos)
class DetenidosAprehendidosAdmin(admin.ModelAdmin):
    """
    Admin para visualizar solo detenidos/aprehendidos
    """
    list_display = (
        'procedimiento_id_operativo',
        'edad',
        'sexo',
        'nacionalidad',
        'situacion_procesal',
        'delito_imputado_short',
        'fecha_importacion'
    )
    
    list_filter = (
        'sexo',
        'nacionalidad',
        'situacion_procesal',
        'fecha_importacion'
    )
    
    search_fields = (
        'procedimiento__id_operativo',
        'procedimiento__descripcion',
        'delito_imputado',
        'nacionalidad'
    )
    
    ordering = ('-fecha_importacion',)
    
    def procedimiento_id_operativo(self, obj):
        return obj.procedimiento.id_operativo
    procedimiento_id_operativo.short_description = 'ID Operativo'
    
    def delito_imputado_short(self, obj):
        if obj.delito_imputado:
            return obj.delito_imputado[:30] + '...' if len(obj.delito_imputado) > 30 else obj.delito_imputado
        return '-'
    delito_imputado_short.short_description = 'Delito'


@admin.register(Incautaciones)
class IncautacionesAdmin(admin.ModelAdmin):
    """
    Admin para visualizar solo incautaciones
    """
    list_display = (
        'procedimiento_id_operativo',
        'tipo',
        'cantidad',
        'medidas',
        'aforo',
        'tipo_delito',
        'fecha_importacion'
    )
    
    list_filter = (
        'tipo',
        'tipo_delito',
        'fecha_importacion'
    )
    
    search_fields = (
        'procedimiento__id_operativo',
        'tipo',
        'subtipo',
        'incautaciones'
    )
    
    ordering = ('-fecha_importacion',)
    
    def procedimiento_id_operativo(self, obj):
        return obj.procedimiento.id_operativo
    procedimiento_id_operativo.short_description = 'ID Operativo'


@admin.register(TrataTraficPersonas)
class TrataTraficPersonasAdmin(admin.ModelAdmin):
    """
    Admin para casos de trata y tráfico de personas
    """
    list_display = (
        'procedimiento_id_operativo',
        'tipo_delito',
        'sexo_victima',
        'edad_victima',
        'nacionalidad',
        'fecha_importacion'
    )
    
    list_filter = (
        'tipo_delito',
        'sexo_victima',
        'genero_victima',
        'fecha_importacion'
    )
    
    search_fields = (
        'procedimiento__id_operativo',
        'tipo_delito',
        'observaciones'
    )
    
    def procedimiento_id_operativo(self, obj):
        return obj.procedimiento.id_operativo
    procedimiento_id_operativo.short_description = 'ID Operativo'


@admin.register(Fallecidos)
class FallecidosAdmin(admin.ModelAdmin):
    """
    Admin para casos de fallecidos
    """
    list_display = (
        'procedimiento_id_operativo',
        'servicio',
        'fuerza_de_seguridad',
        'cant_fallecidos',
        'cant_lesionados',
        'provincia_evento',
        'fecha_evento'
    )
    
    list_filter = (
        'servicio',
        'fuerza_de_seguridad',
        'provincia_evento',
        'fecha_importacion'
    )
    
    search_fields = (
        'procedimiento__id_operativo',
        'servicio',
        'provincia_evento'
    )
    
    def procedimiento_id_operativo(self, obj):
        return obj.procedimiento.id_operativo
    procedimiento_id_operativo.short_description = 'ID Operativo'


@admin.register(Abatidos)
class AbatidosAdmin(admin.ModelAdmin):
    """
    Admin para casos de abatidos
    """
    list_display = (
        'procedimiento_id_operativo',
        'servicio',
        'fuerza_de_seguridad',
        'edad',
        'sexo',
        'nacionalidad',
        'provincia_evento',
        'fecha_evento'
    )
    
    list_filter = (
        'servicio',
        'fuerza_de_seguridad',
        'sexo',
        'nacionalidad',
        'provincia_evento',
        'fecha_importacion'
    )
    
    search_fields = (
        'procedimiento__id_operativo',
        'servicio',
        'nacionalidad'
    )
    
    def procedimiento_id_operativo(self, obj):
        return obj.procedimiento.id_operativo
    procedimiento_id_operativo.short_description = 'ID Operativo'


# Registrar los modelos restantes con admin básico
@admin.register(VehiculosPersonasControladas)
class VehiculosPersonasControladasAdmin(admin.ModelAdmin):
    list_display = ('procedimiento', 'vehiculos_controlados', 'personas_controladas', 'fecha_importacion')
    list_filter = ('fecha_importacion',)


@admin.register(PersonalElementosAfectados)  
class PersonalElementosAfectadosAdmin(admin.ModelAdmin):
    list_display = ('procedimiento', 'cant_efectivos', 'cant_autos_camionetas', 'fecha_importacion')
    list_filter = ('fecha_importacion',)


@admin.register(OtrosDelitos)
class OtrosDelitosAdmin(admin.ModelAdmin):
    list_display = ('procedimiento', 'tipo_otro_delito', 'sexo_victima', 'edad_victima', 'fecha_importacion')
    list_filter = ('tipo_otro_delito', 'sexo_victima', 'fecha_importacion')


@admin.register(OtrosEventos)
class OtrosEventosAdmin(admin.ModelAdmin):
    list_display = ('procedimiento', 'tipo_siniestro', 'cant_ilesos', 'cant_lesionados', 'cant_muertos', 'fecha_importacion')
    list_filter = ('tipo_siniestro', 'fecha_importacion')


@admin.register(CodigoOperativo)
class CodigoOperativoAdmin(admin.ModelAdmin):
    list_display = ('procedimiento', 'codigo_operativo', 'fecha_importacion')
    list_filter = ('fecha_importacion',)