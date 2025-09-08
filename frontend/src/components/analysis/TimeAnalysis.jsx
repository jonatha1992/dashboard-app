import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { analysisService } from '../../services/analysisService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TimeAnalysis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
  const [availableYears, setAvailableYears] = useState([2025]);
  
  const [filters, setFilters] = useState({
    provincia: '',
    year: '2025',
    grain: 'monthly'
  });
  
  const [chartConfig, setChartConfig] = useState({
    metrica: 'total_procedimientos',
    chartType: 'line',
    showComparison: false
  });

  // Opciones de métricas disponibles (memoizado para dependencias estables)
  const metricas = useMemo(() => ([
    { key: 'total_procedimientos', label: 'Procedimientos', color: 'rgb(75, 192, 192)' },
    { key: 'total_detenidos', label: 'Detenidos', color: 'rgb(255, 99, 132)' },
    { key: 'total_incautaciones', label: 'Incautaciones', color: 'rgb(54, 162, 235)' },
    { key: 'total_vehiculos_controlados', label: 'Vehículos Controlados', color: 'rgb(255, 205, 86)' }
  ]), []);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Nota: Se deshabilita el auto-fetch al cambiar filtros.
  // Solo carga inicial y mediante botón "Actualizar".


  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar provincias y años disponibles en paralelo
      const [provincias, years] = await Promise.all([
        analysisService.getProvinciasDisponibles(),
        analysisService.getAvailableYears()
      ]);
      
      setProvinciasDisponibles(provincias);
      setAvailableYears(years);
      // Carga inicial de datos una vez que hay configuración
      await fetchData();
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error cargando configuración inicial');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    if (!analysisService.validateFilters(filters, ['year'])) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await analysisService.getAnalisisTemporal(filters);
      
      if (result.status === 'success') {
        setData(result.data || []);
      } else {
        throw new Error(result.message || 'Error en la respuesta');
      }
      
    } catch (error) {
      console.error('Error fetching temporal analysis:', error);
      setError(error.message || 'Error cargando análisis temporal');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    if (chartConfig.showComparison) {
      // Mostrar múltiples métricas
      const labels = data.map(item => item.mes_nombre || item.año_trimestre);
      const datasets = metricas.map(metrica => ({
        label: metrica.label,
        data: data.map(item => item[metrica.key] || 0),
        borderColor: metrica.color,
        backgroundColor: metrica.color + '20',
        tension: 0.1,
        fill: false
      }));
      
      return { labels, datasets };
    } else {
      // Mostrar solo métrica seleccionada
      return analysisService.formatTemporalDataForChart(data, chartConfig.metrica);
    }
  }, [data, chartConfig, metricas]);

  // Configuración del gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Análisis Temporal - ${filters.provincia ? 
          provinciasDisponibles.find(p => p.provincia_key === filters.provincia)?.provincia || filters.provincia
          : 'Todas las Provincias'} (${filters.year})`
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            return `${label}: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: filters.grain === 'monthly' ? 'Mes' : 'Trimestre'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Cantidad'
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Calcular estadísticas resumidas
  const summaryStats = useMemo(() => {
    return analysisService.calculateSummaryStats(data, chartConfig.metrica);
  }, [data, chartConfig.metrica]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMetricChange = (metrica) => {
    setChartConfig(prev => ({ ...prev, metrica }));
  };

  const toggleComparison = () => {
    setChartConfig(prev => ({ ...prev, showComparison: !prev.showComparison }));
  };

  const toggleChartType = () => {
    setChartConfig(prev => ({ 
      ...prev, 
      chartType: prev.chartType === 'line' ? 'bar' : 'line' 
    }));
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando análisis temporal...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📊 Análisis Temporal
        </h2>
        
        {/* Controles de filtro */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia
            </label>
            <select 
              value={filters.provincia} 
              onChange={(e) => handleFilterChange('provincia', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Todas las provincias</option>
              {provinciasDisponibles.map(p => (
                <option key={p.provincia_key} value={p.provincia_key}>
                  {p.provincia}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <select 
              value={filters.year} 
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {availableYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Granularidad
            </label>
            <select 
              value={filters.grain} 
              onChange={(e) => handleFilterChange('grain', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Métrica Principal
            </label>
            <select 
              value={chartConfig.metrica} 
              onChange={(e) => handleMetricChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || chartConfig.showComparison}
            >
              {metricas.map(metrica => (
                <option key={metrica.key} value={metrica.key}>
                  {metrica.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Controles de visualización */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={toggleChartType}
            className={`px-3 py-1 rounded text-sm font-medium ${
              chartConfig.chartType === 'line' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
            disabled={loading}
          >
            {chartConfig.chartType === 'line' ? '📈 Líneas' : '📊 Barras'}
          </button>
          
          <button
            onClick={toggleComparison}
            className={`px-3 py-1 rounded text-sm font-medium ${
              chartConfig.showComparison 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
            disabled={loading}
          >
            {chartConfig.showComparison ? '✅ Comparar Métricas' : '🔄 Comparar Métricas'}
          </button>
          
          <button
            onClick={fetchData}
            className="px-3 py-1 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ⚠️ {error}
        </div>
      )}

      {/* Estadísticas resumidas */}
      {!chartConfig.showComparison && data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {summaryStats.total.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(summaryStats.promedio).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Promedio</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {summaryStats.maximo.toLocaleString()}
            </div>
            <div className="text-sm text-orange-600">Máximo</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {summaryStats.minimo.toLocaleString()}
            </div>
            <div className="text-sm text-red-600">Mínimo</div>
          </div>
        </div>
      )}

      {/* Gráfico principal */}
      <div className="h-96 mb-4">
        {data.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>No hay datos para mostrar</div>
              <div className="text-sm mt-1">
                Intenta ajustar los filtros o ejecutar el ETL
              </div>
            </div>
          </div>
        ) : (
          <>
            {chartConfig.chartType === 'line' ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Información adicional */}
      {data.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>
            📅 Mostrando {data.length} períodos | 
            🏛️ {filters.provincia ? '1 provincia' : `${provinciasDisponibles.length} provincias disponibles`} |
            ⏱️ Última actualización: {new Date().toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeAnalysis;