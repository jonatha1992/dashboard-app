import apiService from './apiService';

/**
 * Servicio para análisis dimensional del Data Warehouse
 * Maneja todas las llamadas API relacionadas con análisis temporal, geográfico y comparativo
 */
export class AnalysisService {
  
  /**
   * Obtiene análisis temporal por provincia
   * @param {Object} filters - Filtros para el análisis
   * @param {string} filters.provincia - Clave de la provincia (opcional)
   * @param {string} filters.year - Año para análisis (default: 2025)
   * @param {string} filters.grain - Granularidad temporal ('monthly', 'quarterly')
   * @returns {Promise} Datos de análisis temporal
   */
  async getAnalisisTemporal(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.provincia) params.append('provincia', filters.provincia);
      if (filters.year) params.append('year', filters.year);
      if (filters.grain) params.append('grain', filters.grain);
      
      const response = await apiService.get(`/dw/analysis/temporal/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error en análisis temporal:', error);
      throw error;
    }
  }

  /**
   * Obtiene análisis geográfico por período
   * @param {Object} filters - Filtros para el análisis
   * @param {string} filters.periodo - Período en formato YYYY-MM
   * @param {string} filters.nivel - Nivel geográfico ('provincia', 'departamento')
   * @param {number} filters.top - Límite de resultados top (opcional)
   * @param {string} filters.provincia_filtro - Filtro por provincia específica (opcional)
   * @returns {Promise} Datos de análisis geográfico
   */
  async getAnalisisGeografico(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.nivel) params.append('nivel', filters.nivel);
      if (filters.top) params.append('top', filters.top.toString());
      if (filters.provincia_filtro) params.append('provincia_filtro', filters.provincia_filtro);
      
      const response = await apiService.get(`/dw/analysis/geografico/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error en análisis geográfico:', error);
      throw error;
    }
  }

  /**
   * Obtiene análisis comparativo entre provincias
   * @param {Object} filters - Filtros para la comparación
   * @param {Array} filters.provincias - Array de claves de provincias
   * @param {string} filters.year - Año para comparación
   * @param {string} filters.comparison_type - Tipo de comparación ('temporal', 'summary')
   * @returns {Promise} Datos de comparación
   */
  async getComparisonAnalysis(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.provincias && filters.provincias.length > 0) {
        params.append('provincias', filters.provincias.join(','));
      }
      if (filters.year) params.append('year', filters.year);
      if (filters.comparison_type) params.append('comparison_type', filters.comparison_type);
      
      const response = await apiService.get(`/dw/analysis/comparison/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error en análisis comparativo:', error);
      throw error;
    }
  }

  /**
   * Obtiene estado del Data Warehouse
   * @returns {Promise} Estado del DW (tablas, fechas, provincias disponibles)
   */
  async getDWStatus() {
    try {
      const response = await apiService.get('/dw/status/');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estado DW:', error);
      throw error;
    }
  }

  /**
   * Ejecuta el proceso ETL completo
   * @returns {Promise} Resultado de la ejecución ETL
   */
  async runETL() {
    try {
      const response = await apiService.post('/dw/etl/run/');
      return response.data;
    } catch (error) {
      console.error('Error ejecutando ETL:', error);
      throw error;
    }
  }

  /**
   * Obtiene estado del ETL
   * @returns {Promise} Estado actual del ETL
   */
  async getETLStatus() {
    try {
      const response = await apiService.get('/dw/etl/status/');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estado ETL:', error);
      throw error;
    }
  }

  /**
   * Obtiene lista de provincias disponibles
   * @returns {Promise} Lista de provincias con sus claves normalizadas
   */
  async getProvinciasDisponibles() {
    try {
      const response = await apiService.get('/dw/provincias/');
      return response.data.data || [];
    } catch (error) {
      console.error('Error obteniendo provincias:', error);
      return [];
    }
  }

  /**
   * Procesa datos temporales para gráficos
   * @param {Array} rawData - Datos crudos de la API
   * @param {string} metrica - Métrica a visualizar
   * @returns {Object} Datos formateados para Chart.js
   */
  formatTemporalDataForChart(rawData, metrica = 'total_procedimientos') {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Agrupar por provincia si hay múltiples
    const groupedData = rawData.reduce((acc, item) => {
      const provincia = item.provincia_nombre || 'Sin provincia';
      if (!acc[provincia]) {
        acc[provincia] = [];
      }
      acc[provincia].push(item);
      return acc;
    }, {});

    const colors = [
      'rgb(75, 192, 192)',
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)'
    ];

    const labels = rawData.length > 0 ? 
      [...new Set(rawData.map(item => item.mes_nombre || item.año_trimestre))] : [];

    const datasets = Object.entries(groupedData).map(([provincia, data], index) => ({
      label: provincia,
      data: data.map(item => item[metrica] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      tension: 0.1,
      fill: false
    }));

    return {
      labels,
      datasets
    };
  }

  /**
   * Formatea datos geográficos para mapas de calor
   * @param {Array} rawData - Datos crudos de la API
   * @param {string} metrica - Métrica a visualizar
   * @returns {Array} Datos formateados para el mapa
   */
  formatGeograficDataForMap(rawData, metrica = 'total_procedimientos') {
    if (!Array.isArray(rawData)) return [];

    return rawData.map(item => ({
      provincia: item.provincia_nombre,
      provincia_key: item.provincia_key,
      departamento: item.departamento_nombre,
      valor: item[metrica] || 0,
      total_procedimientos: item.total_procedimientos || 0,
      total_detenidos: item.total_detenidos || 0,
      total_incautaciones: item.total_incautaciones || 0,
      total_vehiculos_controlados: item.total_vehiculos_controlados || 0
    }));
  }

  /**
   * Calcula estadísticas resumidas de un dataset
   * @param {Array} data - Array de datos con métricas
   * @param {string} metrica - Métrica a analizar
   * @returns {Object} Estadísticas calculadas
   */
  calculateSummaryStats(data, metrica = 'total_procedimientos') {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        total: 0,
        promedio: 0,
        maximo: 0,
        minimo: 0,
        count: 0
      };
    }

    const values = data.map(item => item[metrica] || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    return {
      total,
      promedio: total / values.length,
      maximo: Math.max(...values),
      minimo: Math.min(...values),
      count: values.length
    };
  }

  /**
   * Genera configuración para gráficos de barras comparativos
   * @param {Array} rawData - Datos de comparación
   * @param {string} metrica - Métrica a comparar
   * @returns {Object} Configuración de Chart.js
   */
  formatComparisonDataForChart(rawData, metrica = 'total_procedimientos') {
    if (!Array.isArray(rawData)) return { labels: [], datasets: [] };

    // Para comparación temporal
    if (rawData[0] && rawData[0].año_mes) {
      return this.formatTemporalDataForChart(rawData, metrica);
    }

    // Para comparación summary
    const labels = rawData.map(item => item.provincia_nombre);
    const data = rawData.map(item => item[metrica] || 0);

    return {
      labels,
      datasets: [{
        label: metrica.replace('total_', '').replace('_', ' ').toUpperCase(),
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  }

  /**
   * Valida filtros antes de hacer llamadas API
   * @param {Object} filters - Filtros a validar
   * @param {Array} requiredFields - Campos requeridos
   * @returns {boolean} True si los filtros son válidos
   */
  validateFilters(filters, requiredFields = []) {
    for (const field of requiredFields) {
      if (!filters[field]) {
        console.warn(`Campo requerido faltante: ${field}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Obtiene rango de años disponibles basado en datos existentes
   * @returns {Promise<Array>} Array de años disponibles
   */
  async getAvailableYears() {
    try {
      const status = await this.getDWStatus();
      const fechaMin = status.data?.rango_fechas?.fecha_minima;
      const fechaMax = status.data?.rango_fechas?.fecha_maxima;
      
      if (!fechaMin || !fechaMax) return [2025];

      const startYear = new Date(fechaMin).getFullYear();
      const endYear = new Date(fechaMax).getFullYear();
      
      const years = [];
      for (let year = startYear; year <= endYear; year++) {
        years.push(year);
      }
      
      return years.length > 0 ? years : [2025];
    } catch (error) {
      console.error('Error obteniendo años disponibles:', error);
      return [2025];
    }
  }
}

// Instancia singleton del servicio
export const analysisService = new AnalysisService();