/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getCategorizedData } from '../services/dataService';
import apiService from '../services/apiService';
import { analysisService } from '../services/analysisService';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {

  // Estado global de datos y navegación
  const [data, setData] = useState([]);
  const [dataStats, setDataStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [activeCategory, setActiveCategory] = useState('general');
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
        
        // INTENTAR cargar datos desde el backend si el usuario está autenticado
        try {
          if (apiService.isAuthenticated()) {
            const result = await apiService.getData();
            if (result && result.length > 0) {
              setData(result);
              
              // Cargar estadísticas del backend (incluyendo rango de fechas)
              try {
                const stats = await apiService.getDataStats();
                setDataStats(stats);

                // Inicializar filtros con el rango de fechas real del backend
                if (stats.dateRange && stats.dateRange.earliest && stats.dateRange.latest) {
                  setFilters(prev => ({
                    fromDate: prev.fromDate || stats.dateRange.earliest,
                    toDate: prev.toDate || stats.dateRange.latest,
                    province: prev.province || ''
                  }));
                }
              } catch {
                setDataStats(null);
              }
            } else {
              // Sin datos en el backend - modo Import File
              setData([]);
            }
          } else {
            // Usuario no autenticado - se manejará por las rutas protegidas
            setData([]);
          }
        } catch {
          // Error cargando datos - no es crítico, puede ser que no haya datos aún
          setData([]);
        }
        
        // Siempre establecer filtros base (sin depender de datos)
        const today = new Date().toISOString().slice(0, 10);
        setFilters(prev => ({
          fromDate: prev.fromDate || '2025-01-01', // Fecha base razonable
          toDate: prev.toDate || today,
          province: prev.province || ''
        }));
        
      } catch (err) {
        console.error('Error inicializando dashboard:', err);
        // NO setear error - la aplicación funciona sin datos iniciales
        setData([]);
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
    // Helper para convertir FECHA a ISO yyyy-mm-dd (compatible con input date)
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

    let filtered = data.filter(item => {
      // Convertir la fecha del item a ISO; si no es válida, excluirlo de los filtros por fecha
      const itemISO = parseDateToISO(item.FECHA);
      if (!itemISO) return true; // si no hay fecha, permitirlo aquí y dejar otras reglas decidir
      if (filters.fromDate && itemISO < filters.fromDate) return false;
      if (filters.toDate && itemISO > filters.toDate) return false;
      return true;
    });

    // Comparación robusta: si los items contienen PROVINCIA_KEY (sin tildes, lower)
    // usar esa clave para comparar; si no, caer al método simple normalizado.
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

    if (filters.province) {
      const filterKey = makeKey(filters.province);
      filtered = filtered.filter(item => {
        if (item.PROVINCIA_KEY) return item.PROVINCIA_KEY === filterKey;
        return makeKey(item.PROVINCIA) === filterKey;
      });
    }

    return filtered;
  }, [data, filters]);

  // Datos categorizados filtrados
  const filteredCategorizedData = useMemo(() => {
    return getCategorizedData(filteredData);
  }, [filteredData]);

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Actualizar categoría activa
  const updateActiveCategory = (category) => {
    setActiveCategory(category);
  };

  // Exponer todo el estado y funciones necesarias
  const contextValue = {
    // Estado tradicional del dashboard
    data,
    setData,
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
