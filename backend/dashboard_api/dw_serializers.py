from rest_framework import serializers

class AnalisisTemporalSerializer(serializers.Serializer):
    """Serializer para análisis temporal"""
    año_mes = serializers.CharField()
    provincia_nombre = serializers.CharField()
    provincia_key = serializers.CharField()
    total_procedimientos = serializers.IntegerField()
    total_detenidos = serializers.IntegerField()
    total_incautaciones = serializers.IntegerField()
    total_vehiculos_controlados = serializers.IntegerField()
    mes_nombre = serializers.CharField()
    mes = serializers.IntegerField(required=False)
    año = serializers.IntegerField(required=False)
    
    # Campos adicionales para análisis trimestral
    trimestre = serializers.IntegerField(required=False)
    año_trimestre = serializers.CharField(required=False)
    
    # Campos calculados opcionales
    promedio_mensual_procedimientos = serializers.FloatField(required=False)

class AnalisisGeograficoSerializer(serializers.Serializer):
    """Serializer para análisis geográfico"""
    # Campos para nivel provincia
    provincia_key = serializers.CharField(required=False)
    provincia_nombre = serializers.CharField()
    
    # Campos para nivel departamento
    departamento_nombre = serializers.CharField(required=False)
    provincia_departamento_key = serializers.CharField(required=False)
    
    # Métricas
    total_procedimientos = serializers.IntegerField()
    total_detenidos = serializers.IntegerField()
    total_incautaciones = serializers.IntegerField()
    total_vehiculos_controlados = serializers.IntegerField()
    
    # Campos de contexto temporal
    año_mes = serializers.CharField(required=False)
    mes_nombre = serializers.CharField(required=False)
    
    # Campos calculados opcionales
    densidad_procedimientos = serializers.FloatField(required=False)
    ranking_posicion = serializers.IntegerField(required=False)

class ComparisonAnalysisSerializer(serializers.Serializer):
    """Serializer para análisis comparativo entre provincias"""
    # Identificación
    provincia_key = serializers.CharField()
    provincia_nombre = serializers.CharField()
    
    # Para comparación temporal
    año_mes = serializers.CharField(required=False)
    mes_nombre = serializers.CharField(required=False)
    mes = serializers.IntegerField(required=False)
    
    # Métricas base
    total_procedimientos = serializers.IntegerField()
    total_detenidos = serializers.IntegerField()
    total_incautaciones = serializers.IntegerField(required=False)
    total_vehiculos_controlados = serializers.IntegerField(required=False)
    
    # Métricas calculadas para comparación summary
    promedio_mensual_procedimientos = serializers.FloatField(required=False)
    
    # Campos de comparación relativa
    porcentaje_del_total = serializers.FloatField(required=False)
    variacion_vs_promedio = serializers.FloatField(required=False)

class DWStatusSerializer(serializers.Serializer):
    """Serializer para estado del Data Warehouse"""
    
    class TablaStatusSerializer(serializers.Serializer):
        dim_tiempo = serializers.IntegerField()
        dim_geografia = serializers.IntegerField()
        fact_procedimientos = serializers.IntegerField()
        agg_mensual_provincia = serializers.IntegerField()
        agg_mensual_departamento = serializers.IntegerField()
    
    class RangoFechasSerializer(serializers.Serializer):
        fecha_minima = serializers.DateField()
        fecha_maxima = serializers.DateField()
    
    class ProvinciaDisponibleSerializer(serializers.Serializer):
        provincia = serializers.CharField()
        provincia_key = serializers.CharField()
    
    tablas = TablaStatusSerializer()
    rango_fechas = RangoFechasSerializer()
    ultima_agregacion = serializers.DateTimeField(allow_null=True)
    provincias_disponibles = serializers.ListField(
        child=serializers.ListField(child=serializers.CharField())
    )
    status = serializers.CharField()

class ETLResultSerializer(serializers.Serializer):
    """Serializer para resultados de ETL"""
    status = serializers.CharField()
    message = serializers.CharField(required=False)
    
    # Detalles de ejecución exitosa
    tiempo_records = serializers.IntegerField(required=False)
    geografia_records = serializers.IntegerField(required=False)
    facts_created = serializers.IntegerField(required=False)
    facts_updated = serializers.IntegerField(required=False)
    provincial_aggs = serializers.IntegerField(required=False)
    departmental_aggs = serializers.IntegerField(required=False)
    
    # Metadatos
    execution_time = serializers.FloatField(required=False)
    timestamp = serializers.DateTimeField(required=False)

class ProvinciasListSerializer(serializers.Serializer):
    """Serializer para lista de provincias disponibles"""
    provincia = serializers.CharField()
    provincia_key = serializers.CharField()

class DepartamentosListSerializer(serializers.Serializer):
    """Serializer para lista de departamentos por provincia"""
    departamento_nombre = serializers.CharField()
    departamento_key = serializers.CharField()
    provincia_nombre = serializers.CharField()
    provincia_key = serializers.CharField()
    provincia_departamento_key = serializers.CharField()

class MetricasTotalesSerializer(serializers.Serializer):
    """Serializer para métricas totales agregadas"""
    total_procedimientos = serializers.IntegerField()
    total_detenidos = serializers.IntegerField()
    total_incautaciones = serializers.IntegerField()
    total_vehiculos_controlados = serializers.IntegerField()
    
    # Métricas calculadas
    promedio_procedimientos_por_mes = serializers.FloatField()
    promedio_detenidos_por_procedimiento = serializers.FloatField()
    
    # Contexto temporal
    periodo_inicio = serializers.DateField()
    periodo_fin = serializers.DateField()
    meses_analizados = serializers.IntegerField()

class TendenciaTemporalSerializer(serializers.Serializer):
    """Serializer para análisis de tendencias temporales"""
    periodo = serializers.CharField()
    valor = serializers.IntegerField()
    valor_anterior = serializers.IntegerField(required=False)
    variacion_absoluta = serializers.IntegerField(required=False)
    variacion_porcentual = serializers.FloatField(required=False)
    tendencia = serializers.CharField(required=False)  # 'ascendente', 'descendente', 'estable'

class RankingGeograficoSerializer(serializers.Serializer):
    """Serializer para rankings geográficos"""
    posicion = serializers.IntegerField()
    provincia_nombre = serializers.CharField()
    provincia_key = serializers.CharField()
    departamento_nombre = serializers.CharField(required=False)
    valor = serializers.IntegerField()
    porcentaje_del_total = serializers.FloatField()
    
    # Contexto adicional
    nivel = serializers.CharField()  # 'provincia', 'departamento'
    metrica = serializers.CharField()  # 'procedimientos', 'detenidos', etc.