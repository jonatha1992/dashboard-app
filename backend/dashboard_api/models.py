from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import json


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('viewer', 'Viewer'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='viewer')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Fix reverse accessor conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='dashboard_users',
        related_query_name='dashboard_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='dashboard_users',
        related_query_name='dashboard_user',
    )
    
    class Meta:
        db_table = 'user'
    
    def __str__(self):
        return f"{self.username} ({self.role})"


# =============================================================================
# NUEVA ESTRUCTURA: TABLA POR HOJA DEL EXCEL
# =============================================================================

class GeografiaProcedimiento(models.Model):
    """
    TABLA MAESTRA - Hoja: GEOG. PROCEDIMIENTO
    Contiene información geográfica y temporal básica de cada procedimiento
    """
    # Claves primarias
    id_operativo = models.CharField(max_length=100, db_index=True)
    id_procedimiento = models.CharField(max_length=100, db_index=True)
    
    # Información operativa
    fuerza_interviniente = models.CharField(max_length=100, null=True, blank=True)
    unidad_interviniente = models.CharField(max_length=100, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    tipo_intervencion = models.CharField(max_length=200, null=True, blank=True)
    
    # Información geográfica
    provincia = models.CharField(max_length=100, null=True, blank=True)
    provincia_key = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    departamento_o_partido = models.CharField(max_length=100, null=True, blank=True)
    localidad = models.CharField(max_length=100, null=True, blank=True)
    direccion = models.TextField(null=True, blank=True)
    
    # Información fronteriza
    zona_seguridad_fronteras = models.CharField(max_length=100, null=True, blank=True)
    paso_fronterizo = models.CharField(max_length=100, null=True, blank=True)
    
    # Coordenadas
    latitud = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitud = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Fecha y hora
    fecha = models.CharField(max_length=50, null=True, blank=True)  # Original
    fecha_iso = models.DateField(null=True, blank=True, db_index=True)  # Normalizada
    hora = models.CharField(max_length=20, null=True, blank=True)
    
    # Información adicional
    otras_agencias_intervinientes = models.TextField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    
    # Metadatos
    hoja = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    archivo_original = models.CharField(max_length=200, null=True, blank=True)
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    record_key = models.CharField(max_length=200, unique=True, db_index=True)
    
    class Meta:
        db_table = 'geografia_procedimiento'
        unique_together = [['id_operativo', 'id_procedimiento', 'hoja']]
        indexes = [
            models.Index(fields=['id_operativo']),
            models.Index(fields=['id_procedimiento']), 
            models.Index(fields=['fecha_iso']),
            models.Index(fields=['provincia_key']),
        ]
    
    def __str__(self):
        return f"{self.id_operativo} - {self.descripcion[:50] if self.descripcion else 'N/A'}"
    
    def save(self, *args, **kwargs):
        # Generar provincia_key
        if self.provincia:
            self.provincia_key = self.normalize_provincia(self.provincia)
        
        # Parsear fecha a fecha_iso
        if self.fecha and not self.fecha_iso:
            self.fecha_iso = self.parse_fecha(self.fecha)
        
        # Generar record_key
        if not self.record_key:
            self.record_key = f"{self.id_operativo or 'N/A'}_{self.id_procedimiento or 'N/A'}_{self.hoja or 'GEOG'}"
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def normalize_provincia(provincia_name):
        """Normalizar nombre de provincia"""
        if not provincia_name:
            return ''
        
        import unicodedata
        s = str(provincia_name).strip().replace(r'\s+', ' ')
        s = unicodedata.normalize('NFD', s)
        s = ''.join(char for char in s if unicodedata.category(char) != 'Mn')
        s = s.lower()
        
        if s == 'caba' or 'ciudad autonoma' in s:
            return 'ciudad autonoma de buenos aires'
        
        return s
    
    @staticmethod
    def parse_fecha(fecha_str):
        """Parsear fecha string a date object"""
        if not fecha_str or fecha_str.strip() in ['-', '']:
            return None
        
        try:
            # Formato dd/mm/yyyy
            if '/' in fecha_str:
                day, month, year = fecha_str.split('/')
                return timezone.datetime(int(year), int(month), int(day)).date()
            
            # Formato ISO
            if '-' in fecha_str:
                parts = fecha_str.split('T')[0].split('-')
                if len(parts) == 3:
                    year, month, day = parts
                    return timezone.datetime(int(year), int(month), int(day)).date()
        except (ValueError, IndexError):
            pass
        
        return None


class VehiculosPersonasControladas(models.Model):
    """
    Hoja: VEHI. Y PERSO. CONTROLADAS
    Información sobre vehículos y personas controladas
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento, 
        on_delete=models.CASCADE,
        related_name='vehiculos_controlados'
    )
    
    # Campos específicos de esta hoja
    vehiculos_controlados = models.IntegerField(null=True, blank=True)
    personas_controladas = models.IntegerField(null=True, blank=True)
    cant_averiguaciones_secuestro = models.IntegerField(null=True, blank=True)
    cant_solicitudes_antecedentes = models.IntegerField(null=True, blank=True)
    cant_embarcaciones_controladas = models.IntegerField(null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vehiculos_personas_controladas'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Controlados: V:{self.vehiculos_controlados} P:{self.personas_controladas}"


class PersonalElementosAfectados(models.Model):
    """
    Hoja: PERSONAL Y ELEMENTOS AFECTADOS
    Recursos humanos y materiales empleados en el operativo
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='personal_afectado'
    )
    
    # Campos específicos de esta hoja
    cant_efectivos = models.IntegerField(null=True, blank=True)
    cant_autos_camionetas = models.IntegerField(null=True, blank=True)
    cant_scanners = models.IntegerField(null=True, blank=True)
    cant_embarcaciones = models.IntegerField(null=True, blank=True)
    cant_motos = models.IntegerField(null=True, blank=True)
    cant_caballos = models.IntegerField(null=True, blank=True)
    cant_canes = models.IntegerField(null=True, blank=True)
    cant_morphrapid = models.IntegerField(null=True, blank=True)
    cant_lpr = models.IntegerField(null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'personal_elementos_afectados'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Efectivos: {self.cant_efectivos}"


class DetenidosAprehendidos(models.Model):
    """
    Hoja: DETENIDOS Y APREHENDIDOS
    Información de personas detenidas o aprehendidas
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='detenidos'
    )
    
    # Campos específicos de esta hoja
    edad = models.IntegerField(null=True, blank=True)
    sexo = models.CharField(max_length=20, null=True, blank=True)
    nacionalidad = models.CharField(max_length=100, null=True, blank=True)
    situacion_procesal = models.CharField(max_length=200, null=True, blank=True)
    delito_imputado = models.TextField(null=True, blank=True)
    juzgado_interviniente = models.CharField(max_length=200, null=True, blank=True)
    caratula_causa = models.TextField(null=True, blank=True)
    num_causa = models.CharField(max_length=100, null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'detenidos_aprehendidos'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Detenido: {self.sexo} {self.edad}años - {self.delito_imputado[:30] if self.delito_imputado else 'N/A'}"


class Incautaciones(models.Model):
    """
    Hoja: INCAUTACIONES
    Material y elementos incautados durante el operativo
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='incautaciones'
    )
    
    # Campos específicos de esta hoja
    incautaciones = models.TextField(null=True, blank=True)  # Descripción general
    tipo = models.CharField(max_length=200, null=True, blank=True)
    subtipo = models.CharField(max_length=200, null=True, blank=True)
    cantidad = models.CharField(max_length=100, null=True, blank=True)  # Puede ser texto con unidades
    medidas = models.CharField(max_length=100, null=True, blank=True)
    aforo = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)  # Valor monetario
    observaciones = models.TextField(null=True, blank=True)
    tipo_delito = models.CharField(max_length=200, null=True, blank=True)
    juzgado_interviniente = models.CharField(max_length=200, null=True, blank=True)
    caratula_causa = models.TextField(null=True, blank=True)
    num_causa = models.CharField(max_length=100, null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'incautaciones'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - {self.tipo}: {self.cantidad} {self.medidas}"


class TrataTraficPersonas(models.Model):
    """
    Hoja: TRATA O TRAFIC PERSONAS
    Casos relacionados con trata y tráfico de personas
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='trata_trafico'
    )
    
    # Campos específicos de esta hoja
    tipo_delito = models.CharField(max_length=200, null=True, blank=True)
    sexo_victima = models.CharField(max_length=20, null=True, blank=True)
    genero_victima = models.CharField(max_length=50, null=True, blank=True)
    edad_victima = models.IntegerField(null=True, blank=True)
    nacionalidad = models.CharField(max_length=100, null=True, blank=True)
    juzgado_interviniente = models.CharField(max_length=200, null=True, blank=True)
    caratula_causa = models.TextField(null=True, blank=True)
    num_causa = models.CharField(max_length=100, null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'trata_trafic_personas'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Trata: {self.tipo_delito}"


class OtrosDelitos(models.Model):
    """
    Hoja: OTROS DELITOS
    Delitos diversos no categorizados en otras secciones
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='otros_delitos'
    )
    
    # Campos específicos de esta hoja
    tipo_otro_delito = models.CharField(max_length=200, null=True, blank=True)
    sexo_victima = models.CharField(max_length=20, null=True, blank=True)
    genero_victima = models.CharField(max_length=50, null=True, blank=True)
    edad_victima = models.IntegerField(null=True, blank=True)
    nacionalidad = models.CharField(max_length=100, null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    juzgado_interviniente = models.CharField(max_length=200, null=True, blank=True)
    caratula_causa = models.TextField(null=True, blank=True)
    num_causa = models.CharField(max_length=100, null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'otros_delitos'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Delito: {self.tipo_otro_delito}"


class OtrosEventos(models.Model):
    """
    Hoja: OTROS EVENTOS
    Siniestros y eventos diversos durante operativos
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='otros_eventos'
    )
    
    # Campos específicos de esta hoja
    tipo_siniestro = models.CharField(max_length=200, null=True, blank=True)
    cant_ilesos = models.IntegerField(null=True, blank=True)
    cant_lesionados = models.IntegerField(null=True, blank=True)
    cant_muertos = models.IntegerField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    juzgado_interviniente = models.CharField(max_length=200, null=True, blank=True)
    caratula_causa = models.TextField(null=True, blank=True)
    num_causa = models.CharField(max_length=100, null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'otros_eventos'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Evento: {self.tipo_siniestro}"


class Fallecidos(models.Model):
    """
    Hoja: FALLECIDOS
    Registro de personas fallecidas durante operativos
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='fallecidos'
    )
    
    # Campos específicos de esta hoja
    servicio = models.CharField(max_length=100, null=True, blank=True)
    fuerza_de_seguridad = models.CharField(max_length=100, null=True, blank=True)
    cant_lesionados = models.IntegerField(null=True, blank=True)
    cant_fallecidos = models.IntegerField(null=True, blank=True)
    
    # Información geográfica específica (puede diferir de la tabla maestra)
    provincia_evento = models.CharField(max_length=100, null=True, blank=True)
    departamento_evento = models.CharField(max_length=100, null=True, blank=True)
    localidad_evento = models.CharField(max_length=100, null=True, blank=True)
    latitud_evento = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitud_evento = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    fecha_evento = models.CharField(max_length=50, null=True, blank=True)
    hora_evento = models.CharField(max_length=20, null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fallecidos'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Fallecidos: {self.cant_fallecidos}"


class Abatidos(models.Model):
    """
    Hoja: ABATIDOS
    Registro de personas abatidas durante operativos
    """
    # Relación con tabla maestra
    procedimiento = models.ForeignKey(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='abatidos'
    )
    
    # Campos específicos de esta hoja
    servicio = models.CharField(max_length=100, null=True, blank=True)
    fuerza_de_seguridad = models.CharField(max_length=100, null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)
    sexo = models.CharField(max_length=20, null=True, blank=True)
    nacionalidad = models.CharField(max_length=100, null=True, blank=True)
    terceros_damnificados = models.CharField(max_length=200, null=True, blank=True)
    
    # Información geográfica específica
    provincia_evento = models.CharField(max_length=100, null=True, blank=True)
    departamento_evento = models.CharField(max_length=100, null=True, blank=True)
    localidad_evento = models.CharField(max_length=100, null=True, blank=True)
    latitud_evento = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitud_evento = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    fecha_evento = models.CharField(max_length=50, null=True, blank=True)
    hora_evento = models.CharField(max_length=20, null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'abatidos'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Abatido: {self.sexo} {self.edad}años"


class CodigoOperativo(models.Model):
    """
    Hoja: CODIGO OPERATIVO
    Códigos internos asignados a cada operativo
    """
    # Relación con tabla maestra (1:1)
    procedimiento = models.OneToOneField(
        GeografiaProcedimiento,
        on_delete=models.CASCADE,
        related_name='codigo_operativo'
    )
    
    # Campo específico de esta hoja
    codigo_operativo = models.CharField(max_length=100, null=True, blank=True)
    
    # Metadatos
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'codigo_operativo'
    
    def __str__(self):
        return f"{self.procedimiento.id_operativo} - Código: {self.codigo_operativo}"


# DW models import removed - files deleted