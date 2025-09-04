from django.db import models
from django.utils import timezone

class DimTiempo(models.Model):
    """Dimensión temporal con jerarquía completa"""
    tiempo_key = models.AutoField(primary_key=True)
    fecha_completa = models.DateField(unique=True, db_index=True)
    
    # Jerarquía temporal
    año = models.IntegerField(db_index=True)
    mes = models.IntegerField(db_index=True)
    dia = models.IntegerField()
    trimestre = models.IntegerField(db_index=True)
    semestre = models.IntegerField(db_index=True)
    
    # Campos descriptivos
    nombre_mes = models.CharField(max_length=20)
    dia_semana = models.IntegerField()
    nombre_dia_semana = models.CharField(max_length=20)
    es_fin_semana = models.BooleanField()
    es_feriado = models.BooleanField(default=False)
    
    # Campos de análisis
    año_mes = models.CharField(max_length=7, db_index=True)  # "2025-01"
    año_trimestre = models.CharField(max_length=7, db_index=True)  # "2025-Q1"
    año_semestre = models.CharField(max_length=7, db_index=True)  # "2025-S1"
    
    class Meta:
        db_table = 'dw_dim_tiempo'
        indexes = [
            models.Index(fields=['año', 'mes']),
            models.Index(fields=['año', 'trimestre']),
        ]
    
    def __str__(self):
        return f"{self.fecha_completa} ({self.año_mes})"

class DimGeografia(models.Model):
    """Dimensión geográfica provincia/departamento"""
    geografia_key = models.AutoField(primary_key=True)
    
    # Jerarquía geográfica
    provincia = models.CharField(max_length=100)
    provincia_key = models.CharField(max_length=100, db_index=True)
    departamento_o_partido = models.CharField(max_length=100)
    departamento_key = models.CharField(max_length=100, db_index=True)
    localidad = models.CharField(max_length=100, null=True, blank=True)
    
    # Información adicional
    region = models.CharField(max_length=50, null=True, blank=True)
    es_zona_fronteriza = models.BooleanField(default=False)
    zona_seguridad_fronteras = models.CharField(max_length=100, null=True, blank=True)
    
    # Coordenadas promedio
    latitud_promedio = models.DecimalField(max_digits=10, decimal_places=8, null=True)
    longitud_promedio = models.DecimalField(max_digits=11, decimal_places=8, null=True)
    
    # Clave compuesta
    provincia_departamento_key = models.CharField(max_length=200, unique=True, db_index=True)
    
    class Meta:
        db_table = 'dw_dim_geografia'
        indexes = [
            models.Index(fields=['provincia_key']),
            models.Index(fields=['departamento_key']),
            models.Index(fields=['provincia_departamento_key']),
        ]
    
    def __str__(self):
        return f"{self.provincia} - {self.departamento_o_partido}"

class FactProcedimientos(models.Model):
    """Tabla de hechos principal"""
    fact_key = models.AutoField(primary_key=True)
    
    # Foreign Keys a dimensiones
    dim_tiempo = models.ForeignKey(DimTiempo, on_delete=models.CASCADE)
    dim_geografia = models.ForeignKey(DimGeografia, on_delete=models.CASCADE)
    
    # Métricas
    cantidad_procedimientos = models.IntegerField(default=1)
    cantidad_detenidos = models.IntegerField(default=0)
    cantidad_incautaciones = models.IntegerField(default=0)
    cantidad_vehiculos_controlados = models.IntegerField(default=0)
    
    # Campos de trazabilidad
    id_operativo = models.CharField(max_length=100)
    id_procedimiento = models.CharField(max_length=100)
    record_key = models.CharField(max_length=200, unique=True, db_index=True)
    
    # Metadatos
    fecha_carga = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dw_fact_procedimientos'
        indexes = [
            models.Index(fields=['dim_tiempo', 'dim_geografia']),
            models.Index(fields=['id_operativo']),
            models.Index(fields=['record_key']),
        ]
    
    def __str__(self):
        return f"Fact: {self.id_operativo} - {self.dim_tiempo.fecha_completa} - {self.dim_geografia.provincia}"

class AggMensualProvincia(models.Model):
    """Agregación mensual por provincia"""
    año_mes = models.CharField(max_length=7, db_index=True)
    provincia_key = models.CharField(max_length=100, db_index=True)
    provincia_nombre = models.CharField(max_length=100)
    
    # Métricas agregadas
    total_procedimientos = models.IntegerField()
    total_detenidos = models.IntegerField()
    total_incautaciones = models.IntegerField()
    total_vehiculos_controlados = models.IntegerField()
    
    # Metadatos
    año = models.IntegerField()
    mes = models.IntegerField()
    mes_nombre = models.CharField(max_length=20)
    fecha_calculo = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dw_agg_mensual_provincia'
        unique_together = ['año_mes', 'provincia_key']
        indexes = [
            models.Index(fields=['año_mes']),
            models.Index(fields=['provincia_key']),
        ]
    
    def __str__(self):
        return f"{self.provincia_nombre} - {self.año_mes}: {self.total_procedimientos} proc."

class AggMensualDepartamento(models.Model):
    """Agregación mensual por departamento"""
    año_mes = models.CharField(max_length=7, db_index=True)
    provincia_departamento_key = models.CharField(max_length=200, db_index=True)
    provincia_key = models.CharField(max_length=100, db_index=True)
    departamento_key = models.CharField(max_length=100)
    
    provincia_nombre = models.CharField(max_length=100)
    departamento_nombre = models.CharField(max_length=100)
    
    # Métricas agregadas (igual que provincia)
    total_procedimientos = models.IntegerField()
    total_detenidos = models.IntegerField()
    total_incautaciones = models.IntegerField()
    total_vehiculos_controlados = models.IntegerField()
    
    # Metadatos
    año = models.IntegerField()
    mes = models.IntegerField()
    mes_nombre = models.CharField(max_length=20)
    fecha_calculo = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dw_agg_mensual_departamento'
        unique_together = ['año_mes', 'provincia_departamento_key']
        indexes = [
            models.Index(fields=['año_mes']),
            models.Index(fields=['provincia_departamento_key']),
            models.Index(fields=['provincia_key']),
        ]
    
    def __str__(self):
        return f"{self.provincia_nombre} - {self.departamento_nombre} - {self.año_mes}: {self.total_procedimientos} proc."