import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { analysisService } from '../../services/analysisService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ComparisonDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
  const [availableYears, setAvailableYears] = useState([2025]);
  
  const [filters, setFilters] = useState({
    provincias: [], // Array de provincia_key
    year: '2025',
    comparison_type: 'temporal' // temporal, summary
  });
  
  const [viewConfig, setViewConfig] = useState({
    chartType: 'line', // line, bar, radar, table
    showPercentages: false,
    normalizeData: false
  });

  // Colores para las provincias
  const provinceColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
  ];

  // Métricas disponibles
  const metricas = [
    { key: 'total_procedimientos', label: 'Procedimientos' },
    { key: 'total_detenidos', label: 'Detenidos' },
    { key: 'total_incautaciones', label: 'Incautaciones' },
    { key: 'total_vehiculos_controlados', label: 'Vehículos Controlados' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recargar datos cuando cambian los filtros
  useEffect(() => {
    if (filters.provincias.length > 0) {
      fetchData();
    } else {
      setData([]);
    }
  }, [filters]);

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
      
      // Preseleccionar algunas provincias principales
      if (provincias.length > 0) {
        const defaultProvinces = provincias
          .filter(p => ['BUENOS AIRES', 'CORDOBA', 'SANTA FE'].includes(p.provincia.toUpperCase()))
          .map(p => p.provincia_key)
          .slice(0, 3);
          
        if (defaultProvinces.length > 0) {
          setFilters(prev => ({ ...prev, provincias: defaultProvinces }));
        }
      }
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error cargando configuración inicial');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!filters.provincias || filters.provincias.length === 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await analysisService.getComparisonAnalysis(filters);
      
      if (result.status === 'success') {
        setData(result.data || []);
      } else {
        throw new Error(result.message || 'Error en la respuesta');
      }
      
    } catch (error) {
      console.error('Error fetching comparison analysis:', error);
      setError(error.message || 'Error cargando análisis comparativo');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos para visualización temporal
  const temporalChartData = useMemo(() => {
    if (!data || data.length === 0 || filters.comparison_type !== 'temporal') {
      return { labels: [], datasets: [] };
    }

    // Agrupar por provincia
    const groupedData = data.reduce((acc, item) => {
      const provincia = item.provincia_nombre;
      if (!acc[provincia]) {
        acc[provincia] = [];
      }
      acc[provincia].push(item);
      return acc;
    }, {});

    // Obtener labels (meses)
    const labels = data.length > 0 ? 
      [...new Set(data.map(item => item.mes_nombre))].sort((a, b) => {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return months.indexOf(a) - months.indexOf(b);
      }) : [];

    // Crear datasets por provincia
    const datasets = Object.entries(groupedData).map(([provincia, provinciaData], index) => {
      const color = provinceColors[index % provinceColors.length];
      
      // Ordenar datos por mes
      const sortedData = provinciaData.sort((a, b) => a.mes - b.mes);
      
      return {
        label: provincia,
        data: labels.map(label => {
          const item = sortedData.find(d => d.mes_nombre === label);
          return item ? item.total_procedimientos : 0;
        }),
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.1,
        fill: false
      };
    });

    return { labels, datasets };
  }, [data, filters.comparison_type, provinceColors]);

  // Procesar datos para comparación de barras (summary)
  const summaryChartData = useMemo(() => {
    if (!data || data.length === 0 || filters.comparison_type !== 'summary') {
      return { labels: [], datasets: [] };
    }

    const labels = data.map(item => item.provincia_nombre);
    
    const datasets = metricas.map((metrica, index) => ({
      label: metrica.label,
      data: data.map(item => item[metrica.key] || 0),
      backgroundColor: provinceColors[index % provinceColors.length] + '80',
      borderColor: provinceColors[index % provinceColors.length],
      borderWidth: 1
    }));

    return { labels, datasets };
  }, [data, filters.comparison_type, metricas, provinceColors]);

  // Datos para gráfico radar
  const radarChartData = useMemo(() => {
    if (!data || data.length === 0 || filters.comparison_type !== 'summary') {
      return { labels: [], datasets: [] };
    }

    const labels = metricas.map(m => m.label);
    
    const datasets = data.map((item, index) => {
      const color = provinceColors[index % provinceColors.length];
      
      // Normalizar datos para el radar (0-100)
      const maxValues = metricas.map(metrica => 
        Math.max(...data.map(d => d[metrica.key] || 0))
      );
      
      return {
        label: item.provincia_nombre,
        data: metricas.map((metrica, i) => {
          const value = item[metrica.key] || 0;
          return maxValues[i] > 0 ? (value / maxValues[i]) * 100 : 0;
        }),
        borderColor: color,
        backgroundColor: color + '20',
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color
      };
    });

    return { labels, datasets };
  }, [data, filters.comparison_type, metricas, provinceColors]);

  // Configuraciones de gráficos
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    }
  };

  const lineChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: `Comparación Temporal - Procedimientos (${filters.year})`
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mes'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Cantidad de Procedimientos'
        },
        beginAtZero: true
      }
    }
  };

  const barChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: `Comparación de Métricas por Provincia (${filters.year})`
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Provincia'
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
    }
  };

  const radarChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Comparación Multidimensional (Normalizado 0-100)'
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  };

  // Handlers
  const handleProvinceToggle = (provinciaKey) => {
    setFilters(prev => ({
      ...prev,
      provincias: prev.provincias.includes(provinciaKey)
        ? prev.provincias.filter(p => p !== provinciaKey)
        : [...prev.provincias, provinciaKey].slice(0, 6) // Máximo 6 provincias
    }));
  };

  const handleSelectAllProvinces = () => {
    const allKeys = provinciasDisponibles.map(p => p.provincia_key).slice(0, 6);
    setFilters(prev => ({ ...prev, provincias: allKeys }));
  };

  const handleClearProvinces = () => {
    setFilters(prev => ({ ...prev, provincias: [] }));
  };

  // Calcular estadísticas comparativas
  const comparisonStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    if (filters.comparison_type === 'summary') {
      return data.map(item => ({
        provincia: item.provincia_nombre,
        total_procedimientos: item.total_procedimientos || 0,
        total_detenidos: item.total_detenidos || 0,
        promedio_mensual: item.promedio_mensual_procedimientos || 0
      }));
    }

    // Para temporal, calcular totales por provincia
    const provinceTotals = data.reduce((acc, item) => {
      if (!acc[item.provincia_nombre]) {
        acc[item.provincia_nombre] = {
          provincia: item.provincia_nombre,
          total_procedimientos: 0,
          meses_con_datos: 0
        };
      }
      acc[item.provincia_nombre].total_procedimientos += item.total_procedimientos || 0;
      acc[item.provincia_nombre].meses_con_datos += 1;
      return acc;
    }, {});

    return Object.values(provinceTotals).map(item => ({
      ...item,
      promedio_mensual: item.meses_con_datos > 0 ? item.total_procedimientos / item.meses_con_datos : 0
    }));
  }, [data, filters.comparison_type]);

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando análisis comparativo...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ⚖️ Dashboard Comparativo
        </h2>
        
        {/* Selector de provincias */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Provincias a Comparar (máx. 6)
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllProvinces}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={loading}
              >
                Seleccionar principales
              </button>
              <button
                onClick={handleClearProvinces}
                className="text-xs text-red-600 hover:text-red-800"
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded p-2">
            {provinciasDisponibles.map(provincia => (
              <label key={provincia.provincia_key} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.provincias.includes(provincia.provincia_key)}
                  onChange={() => handleProvinceToggle(provincia.provincia_key)}
                  disabled={loading || (
                    !filters.provincias.includes(provincia.provincia_key) && 
                    filters.provincias.length >= 6
                  )}
                  className="mr-2"
                />
                {provincia.provincia}
              </label>
            ))}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {filters.provincias.length} de {provinciasDisponibles.length} provincias seleccionadas
          </div>
        </div>

        {/* Controles de análisis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <select 
              value={filters.year} 
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
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
              Tipo de Comparación
            </label>
            <select 
              value={filters.comparison_type} 
              onChange={(e) => setFilters(prev => ({ ...prev, comparison_type: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="temporal">📈 Evolución Temporal</option>
              <option value="summary">📊 Resumen Anual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Gráfico
            </label>
            <select 
              value={viewConfig.chartType} 
              onChange={(e) => setViewConfig(prev => ({ ...prev, chartType: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {filters.comparison_type === 'temporal' ? (
                <option value="line">📈 Líneas</option>
              ) : (
                <>
                  <option value="bar">📊 Barras</option>
                  <option value="radar">🎯 Radar</option>
                </>
              )}
              <option value="table">📋 Tabla</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ⚠️ {error}
        </div>
      )}

      {filters.provincias.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">⚖️</div>
            <div>Selecciona provincias para comparar</div>
            <div className="text-sm mt-1">
              Elige al menos una provincia de la lista superior
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Estadísticas comparativas */}
          {comparisonStats && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">📈 Estadísticas Comparativas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonStats.slice(0, 6).map((stat, index) => (
                  <div key={stat.provincia} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">{stat.provincia}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Procedimientos:</span>
                        <span className="font-medium">{stat.total_procedimientos?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Promedio Mensual:</span>
                        <span className="font-medium">{Math.round(stat.promedio_mensual || 0).toLocaleString()}</span>
                      </div>
                      {stat.total_detenidos !== undefined && (
                        <div className="flex justify-between">
                          <span>Total Detenidos:</span>
                          <span className="font-medium">{stat.total_detenidos?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visualización principal */}
          <div className="h-96 mb-4 relative">
            {data.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>No hay datos para comparar</div>
                  <div className="text-sm mt-1">
                    Verifica que las provincias tengan datos para el período seleccionado
                  </div>
                </div>
              </div>
            ) : (
              <>
                {viewConfig.chartType === 'line' && filters.comparison_type === 'temporal' && (
                  <Line data={temporalChartData} options={lineChartOptions} />
                )}
                
                {viewConfig.chartType === 'bar' && filters.comparison_type === 'summary' && (
                  <Bar data={summaryChartData} options={barChartOptions} />
                )}
                
                {viewConfig.chartType === 'radar' && filters.comparison_type === 'summary' && (
                  <Radar data={radarChartData} options={radarChartOptions} />
                )}
                
                {viewConfig.chartType === 'table' && (
                  <div className="overflow-auto h-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Provincia
                          </th>
                          {filters.comparison_type === 'temporal' ? (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mes
                            </th>
                          ) : null}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Procedimientos
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Detenidos
                          </th>
                          {filters.comparison_type === 'summary' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Promedio Mensual
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.provincia_nombre}
                            </td>
                            {filters.comparison_type === 'temporal' && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.mes_nombre}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(item.total_procedimientos || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(item.total_detenidos || 0).toLocaleString()}
                            </td>
                            {filters.comparison_type === 'summary' && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Math.round(item.promedio_mensual_procedimientos || 0).toLocaleString()}
                              </td>
                            )}
                          </tr>
                        ))}
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
          {data.length > 0 && (
            <div className="text-sm text-gray-600">
              <p>
                🏛️ Comparando {filters.provincias.length} provincias | 
                📅 Año: {filters.year} | 
                📊 Tipo: {filters.comparison_type === 'temporal' ? 'Evolución temporal' : 'Resumen anual'} |
                ⏱️ Actualizado: {new Date().toLocaleString()}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComparisonDashboard;