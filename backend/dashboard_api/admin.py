from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OperationalData


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


@admin.register(OperationalData)
class OperationalDataAdmin(admin.ModelAdmin):
    """
    Admin configuration for OperationalData model
    """
    list_display = (
        'id_operativo', 
        'id_procedimiento', 
        'descripcion_short', 
        'provincia', 
        'fecha', 
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
                'fecha_importacion',
                'extra_data'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def descripcion_short(self, obj):
        """Show short description"""
        if obj.descripcion:
            return obj.descripcion[:50] + '...' if len(obj.descripcion) > 50 else obj.descripcion
        return '-'
    descripcion_short.short_description = 'Descripción'
    
    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related()