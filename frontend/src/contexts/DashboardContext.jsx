/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import apiService from '../services/apiService';
import { analysisService } from '../services/analysisService';
import { loadData, getCategorizedData } from '../services/dataService';

const DashboardContext = createContext();

// Helper functions para reutilizar lógica de filtrado
const parseDateToISO = (dateStr) => {
  if (!dateStr) return null;
  
  // Asegurar que dateStr sea un string
  const str = String(dateStr).trim();
  if (!str || str === '-') return null;
  
  // Si ya está en formato ISO, retornar la parte de fecha
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  
  // Formato dd/mm/yyyy (más común en los datos)
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const dd = dmy[1].padStart(2, '0');
    const mm = dmy[2].padStart(2, '0');
    const yyyy = dmy[3];
    const isoDate = `${yyyy}-${mm}-${dd}`;
    
    // Validar que la fecha sea válida
    const testDate = new Date(isoDate);
    if (!isNaN(testDate.getTime()) && 
        testDate.getFullYear() == yyyy && 
        testDate.getMonth() + 1 == parseInt(mm) && 
        testDate.getDate() == parseInt(dd)) {
      return isoDate;
    }
  }
  
  // Formato mm/dd/yyyy (menos común pero posible)
  const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const mm = mdy[1].padStart(2, '0');
    const dd = mdy[2].padStart(2, '0');
    const yyyy = mdy[3];
    const isoDate = `${yyyy}-${mm}-${dd}`;
    
    // Solo usar si la fecha es válida y el mes <= 12
    const testDate = new Date(isoDate);
    if (!isNaN(testDate.getTime()) && parseInt(mm) <= 12) {
      return isoDate;
    }
  }
  
  // Último intento: parseo directo
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch (e) {
    console.warn(`⚠️ No se pudo parsear fecha: "${str}"`, e);
  }
  
  return null;
};

// Función para formatear fechas de manera consistente para display
const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  
  const isoDate = parseDateToISO(dateStr);
  if (!isoDate) return dateStr; // Retornar original si no se puede parsear
  
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch {
    return dateStr; // Fallback al string original
  }
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

  // Estado para forzar re-render cuando sea necesario
  const [forceRender, setForceRender] = useState(0);

  // Effect para forzar re-render cuando cambian los filtros
  useEffect(() => {
    console.log('🔄 Filtros cambiaron, forzando re-render:', filters);
    setForceRender(prev => prev + 1);
  }, [filters]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar datos desde API del backend (endpoints unificados)
        try {
          console.log('Cargando datos desde API del backend (endpoints unificados)...');
          
          // Cargar datos categorizados unificados desde endpoints del backend
          const allCategorizedData = await apiService.getCategorizedData();
          
          if (allCategorizedData && Object.keys(allCategorizedData).length > 0) {
            // Usar datos RAW como base general (tabla maestra completa)
            const rawData = allCategorizedData.general || [];
            setData(rawData);
            setCategorizedData(allCategorizedData);
            
            console.log(`✅ Datos cargados desde endpoints backend unificados`);
            console.log('Categorías disponibles:', Object.keys(allCategorizedData));
            
            // Cargar estadísticas desde API  
            const stats = await apiService.getDataStats();
            setDataStats(stats);
            
            // Inicializar sin filtros automáticos para mostrar todos los datos
            console.log('📊 Inicializando sin filtros automáticos - mostrando todos los datos:', {
              totalRecords: stats.totalRecords || rawData.length,
              dateRange: stats.dateRange
            });
            
            setFilters({ fromDate: '', toDate: '', province: '' });
            
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
            
            // Usar categorización local mejorada también para datos locales
            console.log(`🔄 Aplicando categorización local a datos locales (${localData.length} registros)`);
            const categorizedDataLocal = getCategorizedData(localData);
            setCategorizedData(categorizedDataLocal);
            
            console.log(`✅ Datos cargados y categorizados desde archivos locales`);
            console.log(`Total registros: ${localData.length}`, categorizedDataLocal);
            
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
            
            // CAMBIO: Inicializar SIN filtros automáticos para mostrar todos los datos locales
            console.log('📊 Datos locales cargados - inicializando sin filtros automáticos:', {
              totalRecords: basicStats.totalRecords,
              dateRange: basicStats.dateRange
            });
            
            // Solo establecer filtros vacíos inicialmente
            setFilters({ fromDate: '', toDate: '', province: '' });
            
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
    console.log('🔄 Recalculando filteredCategorizedData:', {
      hasCategorizdData: !!categorizedData,
      categoriesCount: Object.keys(categorizedData || {}).length,
      filters: filters
    });

    if (!categorizedData || Object.keys(categorizedData).length === 0) {
      console.log('❌ No hay categorizedData disponible');
      return {};
    }

    const filterDataArray = (dataArray, categoryName) => {
      if (!dataArray || !Array.isArray(dataArray)) {
        console.log(`❌ ${categoryName}: dataArray inválido`);
        return [];
      }
      
      const originalCount = dataArray.length;
      
      const filtered = dataArray.filter(item => {
        // Aplicar filtros de fecha
        const itemISO = parseDateToISO(item.FECHA);
        if (!itemISO) return true; // si no hay fecha, permitirlo
        if (filters.fromDate && itemISO < filters.fromDate) return false;
        if (filters.toDate && itemISO > filters.toDate) return false;
        
        // Aplicar filtro de provincia
        if (filters.province) {
          const filterKey = makeKey(filters.province);
          const itemProvKey = getProvinceKeyFromItem(item);
          const matches = itemProvKey === filterKey;
          
          // Debug específico para problemas de provincia
          if (!matches && Math.random() < 0.01) { // Solo log 1% para no saturar
            console.log(`🔍 ${categoryName} - Provincia no match:`, {
              filterKey,
              itemProvKey,
              originalProvince: item.PROVINCIA,
              item: item
            });
          }
          
          return matches;
        }
        
        return true;
      });
      
      const filteredCount = filtered.length;
      if (originalCount !== filteredCount) {
        console.log(`📊 ${categoryName}: ${originalCount} → ${filteredCount} (filtrado)`);
      }
      
      return filtered;
    };

    // Aplicar filtros a cada categoría
    const filtered = {};
    for (const [category, dataArray] of Object.entries(categorizedData)) {
      filtered[category] = filterDataArray(dataArray, category);
    }

    console.log('✅ filteredCategorizedData actualizado:', Object.keys(filtered).reduce((acc, key) => {
      acc[key] = filtered[key].length;
      return acc;
    }, {}));

    return filtered;
  }, [categorizedData, filters]);

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    console.log('🎯 Actualizando filtros:', {
      current: filters,
      new: newFilters,
      merged: { ...filters, ...newFilters }
    });
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
      console.log('🔄 Iniciando refresh de datos...');
      
      // Intentar cargar datos desde API del backend (endpoints unificados)
      try {
        console.log('Refrescando datos desde API del backend (endpoints unificados)...');
        
        // Cargar datos categorizados unificados desde endpoints del backend
        const allCategorizedData = await apiService.getCategorizedData();
        
        if (allCategorizedData && Object.keys(allCategorizedData).length > 0) {
          const rawData = allCategorizedData.general || [];
          setData(rawData);
          setCategorizedData(allCategorizedData);
          
          console.log(`✅ Datos refrescados desde endpoints backend unificados`);
          
          const stats = await apiService.getDataStats();
          setDataStats(stats);
          
          // Forzar re-evaluación de filtros
          console.log('🔄 Forzando re-evaluación de filtros después de refresh...');
          setForceRender(prev => prev + 1);
          
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
          
          // Usar categorización local mejorada en refresh también
          const categorizedDataLocal = getCategorizedData(localData);
          setCategorizedData(categorizedDataLocal);
          
          console.log(`✅ Datos refrescados y categorizados desde archivos locales`);
          
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
          
          // Forzar re-evaluación de filtros
          console.log('🔄 Forzando re-evaluación de filtros después de refresh...');
          setForceRender(prev => prev + 1);
          
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
    forceRender, // Para debugging y forzar re-renders
    
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
    analysisService,
    
    // Utilidades de fecha
    parseDateToISO,
    formatDateForDisplay
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
