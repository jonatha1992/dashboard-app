/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import apiService from '../services/apiService';
import { analysisService } from '../services/analysisService';
import { loadData } from '../services/dataService';

const DashboardContext = createContext();

// Helper functions para reutilizar lógica de filtrado
const parseDateToISO = (dateStr) => {
  if (!dateStr) return null;
  
  // Asegurar que dateStr sea un string
  const str = String(dateStr).trim();
  if (!str || str === '-') return null;
  
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const dd = dmy[1].padStart(2, '0');
    const mm = dmy[2].padStart(2, '0');
    const yyyy = dmy[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch {
    // Si hay error en el parsing, retornar null
  }
  
  return null;
};

const makeKey = (s) => {
  if (!s && s !== 0) return '';
  try {
    const str = String(s).trim().replace(/\s+/g, ' ');
    // remover tildes
    const normalized = str.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    if (normalized === 'caba' || normalized.includes('ciudad autonoma')) return 'ciudad autonoma de buenos aires';
    return normalized;
  } catch {
    return String(s).toLowerCase();
  }
};

// Obtiene una clave de provincia robusta desde distintos posibles campos
const getProvinceKeyFromItem = (item) => {
  if (!item || typeof item !== 'object') return '';
  // prioridad a una clave ya normalizada
  if (item.PROVINCIA_KEY) return item.PROVINCIA_KEY;
  // posibles variantes de campo de provincia
  const candidateKeys = [
    'PROVINCIA',
    'provincia',
    'PROVINCIA_EVENTO',
    'PROVINCIA_HECHO',
    'PROVINCIA_ORIGEN',
    'PROVINCIA_DESTINO'
  ];
  for (const k of candidateKeys) {
    if (k in item && item[k]) return makeKey(item[k]);
  }
  return '';
};

export const DashboardProvider = ({ children }) => {

  // Estado global de datos y navegación
  const [data, setData] = useState([]);
  const [categorizedData, setCategorizedData] = useState({});
  const [dataStats, setDataStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [activeCategory, setActiveCategory] = useState('procedimientos');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    province: ''
  });

  // Estado del Data Warehouse
  const [dwStatus, setDwStatus] = useState(null);
  const [dwLoading, setDwLoading] = useState(false);
  const [dwError, setDwError] = useState(null);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableYears, setAvailableYears] = useState([2025]);
  
  // Estado de análisis dimensional
  const [analysisView, setAnalysisView] = useState('temporal'); // temporal, geographic, comparison
  const [analysisData, setAnalysisData] = useState({
    temporal: null,
    geographic: null,
    comparison: null
  });
  
  // Configuración de análisis
  const [analysisConfig, setAnalysisConfig] = useState({
    selectedProvinces: [],
    selectedYear: '2025',
    selectedPeriod: '2025-01',
    selectedMetrics: ['total_procedimientos'],
    viewType: 'chart' // chart, table, hybrid
  });


  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar datos desde API del backend
        try {
          console.log('Cargando datos desde API del backend...');
          
          // Cargar datos categorizados desde API
          const allCategorizedData = await apiService.getCategorizedData();
          
          if (allCategorizedData && Object.keys(allCategorizedData).length > 0) {
            // Establecer datos generales (procedimientos es la tabla maestra)
            setData(allCategorizedData.procedimientos || []);
            setCategorizedData(allCategorizedData);
            
            console.log(`✅ Datos cargados correctamente desde API`);
            console.log('Categorías disponibles:', Object.keys(allCategorizedData));
            
            // Cargar estadísticas desde API
            const stats = await apiService.getDataStats();
            setDataStats(stats);
            
            // Establecer filtros base al ÚLTIMO MES disponible
            if (stats && stats.dateRange && stats.dateRange.latest) {
              try {
                const latest = new Date(stats.dateRange.latest);
                if (!isNaN(latest.getTime())) {
                  const start = new Date(latest.getFullYear(), latest.getMonth(), 1).toISOString().slice(0,10);
                  const end = new Date(latest.getFullYear(), latest.getMonth() + 1, 0).toISOString().slice(0,10);
                  setFilters({ fromDate: start, toDate: end, province: '' });
                }
              } catch {
                // Fallback a earliest/latest si no se puede parsear
                if (stats.dateRange.earliest && stats.dateRange.latest) {
                  setFilters(prev => ({
                    fromDate: prev.fromDate || stats.dateRange.earliest,
                    toDate: prev.toDate || stats.dateRange.latest,
                    province: prev.province || ''
                  }));
                }
              }
            }
            
            return; // Exit early if API works
          }
        } catch (error) {
          console.error('❌ Error cargando datos desde API:', error);
        }
        
        // Fallback: cargar datos desde archivos locales
        try {
          console.log('⚠️ API no disponible, cargando desde archivos locales...');
          
          const localData = await loadData();
          
          if (localData && localData.length > 0) {
            setData(localData);
            
            // Crear datos categorizados básicos
            setCategorizedData({
              procedimientos: localData
            });
            
            console.log(`✅ Datos cargados correctamente desde archivos locales`);
            console.log(`Total registros: ${localData.length}`);
            
            // Crear estadísticas básicas
            const dates = localData
              .map(item => parseDateToISO(item.FECHA))
              .filter(date => date)
              .sort();
              
            const provinces = [...new Set(localData
              .map(item => item.PROVINCIA)
              .filter(prov => prov && prov !== '-')
            )];
            
            const basicStats = {
              totalRecords: localData.length,
              dateRange: {
                earliest: dates.length > 0 ? dates[0] : null,
                latest: dates.length > 0 ? dates[dates.length - 1] : null
              },
              provinces: provinces
            };
            
            setDataStats(basicStats);
            
            // Establecer filtros base al ÚLTIMO MES disponible (datos locales)
            if (basicStats.dateRange.latest) {
              try {
                const latest = new Date(basicStats.dateRange.latest);
                if (!isNaN(latest.getTime())) {
                  const start = new Date(latest.getFullYear(), latest.getMonth(), 1).toISOString().slice(0,10);
                  const end = new Date(latest.getFullYear(), latest.getMonth() + 1, 0).toISOString().slice(0,10);
                  setFilters({ fromDate: start, toDate: end, province: '' });
                }
              } catch {
                if (basicStats.dateRange.earliest && basicStats.dateRange.latest) {
                  setFilters(prev => ({
                    fromDate: prev.fromDate || basicStats.dateRange.earliest,
                    toDate: prev.toDate || basicStats.dateRange.latest,
                    province: prev.province || ''
                  }));
                }
              }
            }
            
          } else {
            console.warn('⚠️ No se encontraron datos locales');
            setData([]);
            setCategorizedData({});
          }
        } catch (localError) {
          console.error('❌ Error cargando datos locales:', localError);
          setData([]);
          setCategorizedData({});
        }
        
      } catch (err) {
        console.error('❌ Error inicializando dashboard:', err);
        setData([]);
        setCategorizedData({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cargar estado del Data Warehouse
  useEffect(() => {
    const loadDWStatus = async () => {
      try {
        setDwLoading(true);
        setDwError(null);
        
        // Cargar estado DW y provincias disponibles en paralelo
        const [status, provincias, years] = await Promise.all([
          analysisService.getDWStatus(),
          analysisService.getProvinciasDisponibles(),
          analysisService.getAvailableYears()
        ]);
        
        setDwStatus(status);
        setAvailableProvinces(provincias);
        setAvailableYears(years);
        
        // Actualizar configuración de análisis con datos reales
        setAnalysisConfig(prev => ({
          ...prev,
          selectedYear: years.length > 0 ? Math.max(...years).toString() : '2025',
          selectedPeriod: years.length > 0 ? `${Math.max(...years)}-01` : '2025-01'
        }));
        
      } catch (error) {
        console.error('Error cargando estado DW:', error);
        setDwError('Error cargando Data Warehouse');
      } finally {
        setDwLoading(false);
      }
    };
    
    // Solo cargar si el usuario está autenticado
    if (apiService.isAuthenticated()) {
      loadDWStatus();
    }
  }, []);

  // Funciones para manejo del Data Warehouse
  const runETL = async () => {
    try {
      setDwLoading(true);
      setDwError(null);
      
      const result = await analysisService.runETL();
      
      if (result.status === 'success') {
        // Recargar estado después del ETL
        const [status, provincias, years] = await Promise.all([
          analysisService.getDWStatus(),
          analysisService.getProvinciasDisponibles(),
          analysisService.getAvailableYears()
        ]);
        
        setDwStatus(status);
        setAvailableProvinces(provincias);
        setAvailableYears(years);
        
        return { success: true, message: 'ETL ejecutado correctamente' };
      } else {
        throw new Error(result.message || 'Error en ETL');
      }
      
    } catch (error) {
      console.error('Error ejecutando ETL:', error);
      setDwError(error.message);
      return { success: false, message: error.message };
    } finally {
      setDwLoading(false);
    }
  };

  const loadAnalysisData = async (analysisType, filters) => {
    try {
      setDwLoading(true);
      setDwError(null);
      
      let result;
      
      switch (analysisType) {
        case 'temporal':
          result = await analysisService.getAnalisisTemporal(filters);
          break;
        case 'geographic':
          result = await analysisService.getAnalisisGeografico(filters);
          break;
        case 'comparison':
          result = await analysisService.getComparisonAnalysis(filters);
          break;
        default:
          throw new Error(`Tipo de análisis no válido: ${analysisType}`);
      }
      
      if (result.status === 'success') {
        setAnalysisData(prev => ({
          ...prev,
          [analysisType]: result.data
        }));
        return result.data;
      } else {
        throw new Error(result.message || 'Error cargando análisis');
      }
      
    } catch (error) {
      console.error(`Error cargando análisis ${analysisType}:`, error);
      setDwError(error.message);
      return null;
    } finally {
      setDwLoading(false);
    }
  };

  const updateAnalysisConfig = (newConfig) => {
    setAnalysisConfig(prev => ({ ...prev, ...newConfig }));
  };

  const clearAnalysisData = (analysisType) => {
    if (analysisType) {
      setAnalysisData(prev => ({ ...prev, [analysisType]: null }));
    } else {
      setAnalysisData({ temporal: null, geographic: null, comparison: null });
    }
  };

  // Filtrar datos según filtros
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
      // Convertir la fecha del item a ISO; si no es válida, excluirlo de los filtros por fecha
      const itemISO = parseDateToISO(item.FECHA);
      if (!itemISO) return true; // si no hay fecha, permitirlo aquí y dejar otras reglas decidir
      if (filters.fromDate && itemISO < filters.fromDate) return false;
      if (filters.toDate && itemISO > filters.toDate) return false;
      return true;
    });

    if (filters.province) {
      const filterKey = makeKey(filters.province);
      filtered = filtered.filter(item => {
        const itemProvKey = getProvinceKeyFromItem(item);
        return itemProvKey === filterKey;
      });
    }

    return filtered;
  }, [data, filters]);

  // Datos categorizados filtrados (aplicar filtros a cada categoría)
  const filteredCategorizedData = useMemo(() => {
    if (!categorizedData || Object.keys(categorizedData).length === 0) {
      return {};
    }

    const filterDataArray = (dataArray) => {
      if (!dataArray || !Array.isArray(dataArray)) return [];
      
      return dataArray.filter(item => {
        // Aplicar filtros de fecha
        const itemISO = parseDateToISO(item.FECHA);
        if (!itemISO) return true; // si no hay fecha, permitirlo
        if (filters.fromDate && itemISO < filters.fromDate) return false;
        if (filters.toDate && itemISO > filters.toDate) return false;
        
        // Aplicar filtro de provincia
        if (filters.province) {
          const filterKey = makeKey(filters.province);
          const itemProvKey = getProvinceKeyFromItem(item);
          return itemProvKey === filterKey;
        }
        
        return true;
      });
    };

    // Aplicar filtros a cada categoría
    const filtered = {};
    for (const [category, dataArray] of Object.entries(categorizedData)) {
      filtered[category] = filterDataArray(dataArray);
    }

    return filtered;
  }, [categorizedData, filters]);

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Actualizar categoría activa
  const updateActiveCategory = (category) => {
    setActiveCategory(category);
  };

  // Función para refrescar datos manualmente
  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Intentar cargar datos desde API del backend primero
      try {
        console.log('Refrescando datos desde API del backend...');
        
        const allCategorizedData = await apiService.getCategorizedData();
        
        if (allCategorizedData && Object.keys(allCategorizedData).length > 0) {
          setData(allCategorizedData.procedimientos || []);
          setCategorizedData(allCategorizedData);
          
          console.log(`✅ Datos refrescados desde API`);
          
          const stats = await apiService.getDataStats();
          setDataStats(stats);
          
          return { success: true, source: 'api', data: allCategorizedData };
        }
      } catch (error) {
        console.error('❌ Error refrescando desde API:', error);
      }
      
      // Fallback: cargar datos desde archivos locales
      try {
        console.log('⚠️ API no disponible, refrescando desde archivos locales...');
        
        const localData = await loadData();
        
        if (localData && localData.length > 0) {
          setData(localData);
          setCategorizedData({ procedimientos: localData });
          
          console.log(`✅ Datos refrescados desde archivos locales`);
          
          // Crear estadísticas básicas
          const dates = localData
            .map(item => parseDateToISO(item.FECHA))
            .filter(date => date)
            .sort();
            
          const provinces = [...new Set(localData
            .map(item => item.PROVINCIA)
            .filter(prov => prov && prov !== '-')
          )];
          
          const basicStats = {
            totalRecords: localData.length,
            dateRange: {
              earliest: dates.length > 0 ? dates[0] : null,
              latest: dates.length > 0 ? dates[dates.length - 1] : null
            },
            provinces: provinces
          };
          
          setDataStats(basicStats);
          
          return { success: true, source: 'local', data: localData };
        }
      } catch (localError) {
        console.error('❌ Error refrescando datos locales:', localError);
      }
      
      return { success: false, error: 'No se pudieron cargar datos' };
    } catch (error) {
      console.error('❌ Error refrescando datos:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Exponer todo el estado y funciones necesarias
  const contextValue = {
    // Estado tradicional del dashboard
    data,
    setData,
    categorizedData,
    setCategorizedData,
    dataStats,
    setDataStats,
    loading,
    error,
    activeCategory,
    setActiveCategory: updateActiveCategory,
    filters,
    setFilters: updateFilters,
    filteredData,
    filteredCategorizedData,
    
    // Funciones de datos
    refreshData,
    
    // Estado del Data Warehouse
    dwStatus,
    dwLoading,
    dwError,
    availableProvinces,
    availableYears,
    
    // Estado de análisis dimensional
    analysisView,
    setAnalysisView,
    analysisData,
    analysisConfig,
    
    // Funciones del Data Warehouse
    runETL,
    loadAnalysisData,
    updateAnalysisConfig,
    clearAnalysisData,
    
    // Utilidades de análisis
    analysisService
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe usarse dentro de un DashboardProvider');
  }
  return context;
};
