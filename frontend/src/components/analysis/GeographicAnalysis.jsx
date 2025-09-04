import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { analysisService } from '../../services/analysisService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const GeographicAnalysis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
  const [availableYears, setAvailableYears] = useState([2025]);
  
  const [filters, setFilters] = useState({
    periodo: '2025-01', // año-mes
    nivel: 'provincia', // provincia o departamento
    top: 0, // 0 = todos, >0 = top N
    provincia_filtro: '' // para filtrar departamentos por provincia
  });
  
  const [viewConfig, setViewConfig] = useState({
    metrica: 'total_procedimientos',
    chartType: 'bar', // bar, doughnut, table
    sortOrder: 'desc' // asc, desc
  });

  // Opciones de métricas disponibles
  const metricas = [
    { key: 'total_procedimientos', label: 'Procedimientos', color: '#3B82F6' },
    { key: 'total_detenidos', label: 'Detenidos', color: '#EF4444' },
    { key: 'total_incautaciones', label: 'Incautaciones', color: '#10B981' },
    { key: 'total_vehiculos_controlados', label: 'Vehículos Controlados', color: '#F59E0B' }
  ];

  // Opciones para top N
  const topOptions = [
    { value: 0, label: 'Todos' },
    { value: 5, label: 'Top 5' },
    { value: 10, label: 'Top 10' },
    { value: 20, label: 'Top 20' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recargar datos cuando cambian los filtros
  useEffect(() => {
    if (provinciasDisponibles.length > 0) {
      fetchData();
    }
  }, [filters, provinciasDisponibles]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar provincias y años disponibles
      const [provincias, years] = await Promise.all([
        analysisService.getProvinciasDisponibles(),
        analysisService.getAvailableYears()
      ]);
      
      setProvinciasDisponibles(provincias);
      setAvailableYears(years);
      
      // Establecer período por defecto si hay años disponibles
      if (years.length > 0) {
        const defaultYear = Math.max(...years);
        setFilters(prev => ({ ...prev, periodo: `${defaultYear}-01` }));
      }
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error cargando configuración inicial');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!filters.periodo) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await analysisService.getAnalisisGeografico(filters);
      
      if (result.status === 'success') {
        setData(result.data || []);
      } else {
        throw new Error(result.message || 'Error en la respuesta');
      }
      
    } catch (error) {
      console.error('Error fetching geographic analysis:', error);
      setError(error.message || 'Error cargando análisis geográfico');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos para visualización
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let processed = analysisService.formatGeograficDataForMap(data, viewConfig.metrica);
    
    // Ordenar datos
    processed.sort((a, b) => {
      const comparison = b.valor - a.valor;
      return viewConfig.sortOrder === 'desc' ? comparison : -comparison;
    });

    return processed;
  }, [data, viewConfig]);

  // Preparar datos para gráfico de barras
  const barChartData = useMemo(() => {
    if (processedData.length === 0) return { labels: [], datasets: [] };

    const labels = processedData.map(item => 
      filters.nivel === 'provincia' ? item.provincia : 
      `${item.departamento || 'Sin departamento'}`
    );
    
    const metricaInfo = metricas.find(m => m.key === viewConfig.metrica);
    
    return {
      labels,
      datasets: [{
        label: metricaInfo?.label || 'Valor',
        data: processedData.map(item => item.valor),
        backgroundColor: metricaInfo?.color + '80',
        borderColor: metricaInfo?.color,
        borderWidth: 1
      }]
    };
  }, [processedData, viewConfig.metrica, filters.nivel, metricas]);

  // Preparar datos para gráfico de donut
  const doughnutData = useMemo(() => {
    if (processedData.length === 0) return { labels: [], datasets: [] };

    // Tomar solo los primeros 10 para el donut
    const topData = processedData.slice(0, 10);
    
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
    ];

    return {
      labels: topData.map(item => 
        filters.nivel === 'provincia' ? item.provincia : item.departamento
      ),
      datasets: [{
        data: topData.map(item => item.valor),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [processedData, filters.nivel]);

  // Configuración para gráfico de barras
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: processedData.length > 10 ? 'y' : 'x',
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `${metricas.find(m => m.key === viewConfig.metrica)?.label} por ${
          filters.nivel === 'provincia' ? 'Provincia' : 'Departamento'
        } - ${filters.periodo}`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y || context.parsed.x}: ${context.parsed.x || context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: processedData.length > 10 ? (filters.nivel === 'provincia' ? 'Provincia' : 'Departamento') : 'Cantidad'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: processedData.length > 10 ? 'Cantidad' : (filters.nivel === 'provincia' ? 'Provincia' : 'Departamento')
        }
      }
    }
  };

  // Configuración para gráfico donut
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            if (datasets.length > 0) {
              return chart.data.labels.map((label, i) => ({
                text: `${label}: ${datasets[0].data[i]}`,
                fillStyle: datasets[0].backgroundColor[i],
                index: i
              }));
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: `Distribución de ${metricas.find(m => m.key === viewConfig.metrica)?.label} (Top 10)`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (processedData.length === 0) return null;
    
    const total = processedData.reduce((sum, item) => sum + item.valor, 0);
    const promedio = total / processedData.length;
    const maximo = Math.max(...processedData.map(item => item.valor));
    const minimo = Math.min(...processedData.map(item => item.valor));
    
    return { total, promedio, maximo, minimo, count: processedData.length };
  }, [processedData]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewConfigChange = (field, value) => {
    setViewConfig(prev => ({ ...prev, [field]: value }));
  };

  const generatePeriodOptions = () => {
    const periods = [];
    const currentYear = availableYears[availableYears.length - 1] || 2025;
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const monthName = new Date(currentYear, month - 1).toLocaleString('es-ES', { month: 'long' });
      periods.push({
        value: `${currentYear}-${monthStr}`,
        label: `${monthName} ${currentYear}`
      });
    }
    
    return periods;
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando análisis geográfico...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🗺️ Análisis Geográfico
        </h2>
        
        {/* Controles de filtro */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select 
              value={filters.periodo} 
              onChange={(e) => handleFilterChange('periodo', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {generatePeriodOptions().map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel
            </label>
            <select 
              value={filters.nivel} 
              onChange={(e) => handleFilterChange('nivel', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="provincia">Provincia</option>
              <option value="departamento">Departamento</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mostrar
            </label>
            <select 
              value={filters.top} 
              onChange={(e) => handleFilterChange('top', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {topOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {filters.nivel === 'departamento' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar Provincia
              </label>
              <select 
                value={filters.provincia_filtro} 
                onChange={(e) => handleFilterChange('provincia_filtro', e.target.value)}
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
          )}
        </div>

        {/* Controles de visualización */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Métrica:</label>
            <select 
              value={viewConfig.metrica} 
              onChange={(e) => handleViewConfigChange('metrica', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              disabled={loading}
            >
              {metricas.map(metrica => (
                <option key={metrica.key} value={metrica.key}>
                  {metrica.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Vista:</label>
            <select 
              value={viewConfig.chartType} 
              onChange={(e) => handleViewConfigChange('chartType', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              disabled={loading}
            >
              <option value="bar">📊 Barras</option>
              <option value="doughnut">🍩 Donut</option>
              <option value="table">📋 Tabla</option>
            </select>
          </div>
          
          <button
            onClick={() => handleViewConfigChange('sortOrder', viewConfig.sortOrder === 'desc' ? 'asc' : 'desc')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewConfig.sortOrder === 'desc' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
            disabled={loading}
          >
            {viewConfig.sortOrder === 'desc' ? '⬇️ Mayor a Menor' : '⬆️ Menor a Mayor'}
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
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(stats.promedio).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Promedio</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.maximo.toLocaleString()}
            </div>
            <div className="text-sm text-orange-600">Máximo</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.count}
            </div>
            <div className="text-sm text-purple-600">
              {filters.nivel === 'provincia' ? 'Provincias' : 'Departamentos'}
            </div>
          </div>
        </div>
      )}

      {/* Visualización principal */}
      <div className="h-96 mb-4">
        {processedData.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <div>No hay datos geográficos para mostrar</div>
              <div className="text-sm mt-1">
                Intenta cambiar el período o ejecutar el ETL
              </div>
            </div>
          </div>
        ) : (
          <>
            {viewConfig.chartType === 'bar' && (
              <Bar data={barChartData} options={barChartOptions} />
            )}
            
            {viewConfig.chartType === 'doughnut' && (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
            
            {viewConfig.chartType === 'table' && (
              <div className="overflow-auto h-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ranking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {filters.nivel === 'provincia' ? 'Provincia' : 'Departamento'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {metricas.find(m => m.key === viewConfig.metrica)?.label}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % del Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedData.map((item, index) => {
                      const percentage = stats ? ((item.valor / stats.total) * 100).toFixed(1) : 0;
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {filters.nivel === 'provincia' ? item.provincia : 
                              `${item.departamento} (${item.provincia})`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.valor.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
      {processedData.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>
            📍 Mostrando {processedData.length} {filters.nivel === 'provincia' ? 'provincias' : 'departamentos'} | 
            📅 Período: {filters.periodo} | 
            📊 Métrica: {metricas.find(m => m.key === viewConfig.metrica)?.label} |
            ⏱️ Actualizado: {new Date().toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default GeographicAnalysis;