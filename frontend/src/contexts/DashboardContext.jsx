/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import apiService from '../services/apiService';
import { analysisService } from '../services/analysisService';
import { loadData, getCategorizedData } from '../services/dataService';

const DashboardContext = createContext();

// Helper functions para reutilizar lógica de filtrado - EXPORTADA para otros módulos
export const parseDateToISO = (dateStr) => {
  if (!dateStr) return null;
  
  // Asegurar que dateStr sea un string
  const str = String(dateStr).trim();
  if (!str || str === '-') return null;
  
  // Si ya está en formato ISO, retornar la parte de fecha
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  
  // Formato dd/MM/yyyy (día/mes/año - formato argentino estándar)
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const dd = dmy[1].padStart(2, '0');
    const mm = dmy[2].padStart(2, '0');
    const yyyy = dmy[3];
    const isoDate = `${yyyy}-${mm}-${dd}`;
    
    // Validación más permisiva - Solo verificar que sea una fecha válida básica
    const testDate = new Date(isoDate);
    if (!isNaN(testDate.getTime()) && parseInt(yyyy) > 1900 && parseInt(yyyy) < 2100) {
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

// Función para formatear fechas de manera consistente para display - EXPORTADA
export const formatDateForDisplay = (dateStr) => {
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

// Función unificada para normalizar claves de provincias - EXPORTADA para usar en otros módulos
export const normalizeProvinceKey = (s) => {
  if (!s && s !== 0) return '';
  try {
    const str = String(s).trim().replace(/\s+/g, ' ');
    
    // Función helper para remover diacríticos (tildes, etc.)
    const removeDiacritics = (text) => {
      try {
        return text.normalize('NFD').replace(/\p{M}/gu, '');
      } catch {
        // Fallback para entornos que no soporten \p{M}
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
    };
    
    // Normalizar: remover tildes y convertir a minúsculas
    const normalized = removeDiacritics(str).toLowerCase();
    
    // Mapear variantes comunes de CABA a clave canónica
    if (normalized === 'caba' || 
        normalized.includes('ciudad autonoma') || 
        normalized.includes('ciudad autonoma de buenos aires') || 
        normalized.includes('ciudad autonoma buenos aires') ||
        normalized.includes('cap fed') ||
        normalized.includes('capital federal')) {
      return 'ciudad autonoma de buenos aires';
    }
    
    return normalized;
  } catch (error) {
    console.warn('⚠️ Error normalizando provincia:', s, error);
    return String(s).toLowerCase();
  }
};

// Mantener alias para compatibilidad interna
const makeKey = normalizeProvinceKey;

// Función centralizada para extraer coordenadas de un item - EXPORTADA
export const getCoordinatesFromItem = (item) => {
  if (!item || typeof item !== 'object') return { lat: null, lng: null };
  
  // Lista de campos candidatos para latitud (ordenados por prioridad)
  const latitudeCandidates = [
    'LATITUD',           // Campo estándar
    'latitud',           // Minúscula
    'latitud_decimal',   // Con underscore
    'Latitud Decimal',   // Con espacio (Excel)
    'Latitud',           // Title case
    'lat',               // Abreviación
    'latitude',          // Inglés
    'LAT_DECIMAL',       // Variante mayúscula
    'coordenada_lat'     // Alternativa
  ];
  
  // Lista de campos candidatos para longitud (ordenados por prioridad)
  const longitudeCandidates = [
    'LONGITUD',          // Campo estándar
    'longitud',          // Minúscula
    'longitud_decimal',  // Con underscore
    'Longitud Decimal',  // Con espacio (Excel)
    'Longitud',          // Title case
    'lng',               // Abreviación común
    'longitude',         // Inglés
    'LON_DECIMAL',       // Variante mayúscula
    'coordenada_lng'     // Alternativa
  ];
  
  // Buscar latitud válida
  let lat = null;
  for (const field of latitudeCandidates) {
    if (field in item && item[field] !== null && item[field] !== undefined) {
      const val = parseFloat(item[field]);
      if (!isNaN(val) && val >= -90 && val <= 90) {
        lat = val;
        break;
      }
    }
  }
  
  // Buscar longitud válida
  let lng = null;
  for (const field of longitudeCandidates) {
    if (field in item && item[field] !== null && item[field] !== undefined) {
      const val = parseFloat(item[field]);
      if (!isNaN(val) && val >= -180 && val <= 180) {
        lng = val;
        break;
      }
    }
  }
  
  // Validaciones adicionales
  if (lat !== null && lng !== null) {
    // Filtrar coordenadas (0,0) que suelen ser inválidas
    if (lat === 0 && lng === 0) {
      return { lat: null, lng: null };
    }
    
    // Debug logging ocasional (1% de los casos)
    if (Math.random() < 0.01) {
      console.log(`🌍 Coordenadas válidas encontradas:`, { lat, lng, item: item.ID_OPERATIVO || 'Sin ID' });
    }
    
    return { lat, lng };
  }
  
  // Log ocasional para debugging de coordenadas faltantes (0.5%)
  if (Math.random() < 0.005) {
    console.log('⚠️ Sin coordenadas válidas:', {
      id: item.ID_OPERATIVO || 'Sin ID',
      latFound: lat !== null,
      lngFound: lng !== null,
      availableFields: Object.keys(item).filter(k => k.toLowerCase().includes('lat') || k.toLowerCase().includes('lng') || k.toLowerCase().includes('coord'))
    });
  }
  
  return { lat: null, lng: null };
};

// Función mejorada para obtener clave de provincia desde distintos campos - EXPORTADA
export const getProvinceKeyFromItem = (item) => {
  if (!item || typeof item !== 'object') return '';
  
  // Prioridad a una clave ya normalizada
  if (item.PROVINCIA_KEY) return item.PROVINCIA_KEY;
  
  // Posibles variantes de campo de provincia (ordenados por prioridad)
  const candidateKeys = [
    'PROVINCIA',           // Campo estándar
    'provincia',           // Minúscula
    'PROVINCIA_EVENTO',    // Eventos específicos
    'PROVINCIA_HECHO',     // Hechos específicos
    'PROVINCIA_ORIGEN',    // Origen del procedimiento
    'PROVINCIA_DESTINO',   // Destino del procedimiento
    'PROVINCIA_LUGAR',     // Lugar del hecho
    'PROV',               // Abreviación común
    'Province',           // Inglés
    'province_name'       // Alternativa con underscore
  ];
  
  for (const k of candidateKeys) {
    if (k in item && item[k] && String(item[k]).trim() !== '' && String(item[k]).trim() !== '-') {
      const normalized = normalizeProvinceKey(item[k]);
      if (normalized) {
        // Debug logging ocasional (1% de los casos para no saturar)
        if (Math.random() < 0.01) {
          console.log(`🗺️ Provincia encontrada en campo ${k}:`, item[k], '→', normalized);
        }
        return normalized;
      }
    }
  }
  
  return '';
};

// Función para obtener departamento desde distintos campos - EXPORTADA
export const getDepartamentoFromItem = (item) => {
  if (!item || typeof item !== 'object') return '';
  
  // Posibles variantes de campo de departamento (ordenados por prioridad)
  const candidateKeys = [
    'DEPARTAMENTO_O_PARTIDO',  // Campo estándar
    'DEPARTAMENTO',            // Variante
    'departamento',            // Minúscula
    'DEPARTAMENTO O PARTIDO',  // Con espacio
    'PARTIDO',                 // Partido (Buenos Aires)
    'partido'                  // partido minúscula
  ];
  
  for (const k of candidateKeys) {
    if (k in item && item[k] && String(item[k]).trim() !== '' && String(item[k]).trim() !== '-') {
      const dept = String(item[k]).trim();
      // Debug logging ocasional
      if (Math.random() < 0.005) {
        console.log(`🏛️ Departamento encontrado en campo ${k}:`, dept);
      }
      return dept;
    }
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
    province: '',
    departamento: ''
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
            
            setFilters({ fromDate: '', toDate: '', province: '', departamento: '' });
            
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
            setFilters({ fromDate: '', toDate: '', province: '', departamento: '' });
            
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

    // Filtro por departamento
    if (filters.departamento) {
      const filterDept = filters.departamento.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const itemDept = (item.DEPARTAMENTO_O_PARTIDO || 
                         item.DEPARTAMENTO || 
                         item.departamento || 
                         item['DEPARTAMENTO O PARTIDO'] || 
                         item.PARTIDO || 
                         item.partido || '').toLowerCase().trim();
        return itemDept === filterDept;
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
          
          if (!matches) return false;
        }
        
        // Aplicar filtro de departamento
        if (filters.departamento) {
          const filterDept = filters.departamento.toLowerCase().trim();
          const itemDept = (item.DEPARTAMENTO_O_PARTIDO || 
                           item.DEPARTAMENTO || 
                           item.departamento || 
                           item['DEPARTAMENTO O PARTIDO'] || 
                           item.PARTIDO || 
                           item.partido || '').toLowerCase().trim();
          const deptMatches = itemDept === filterDept;
          
          if (!deptMatches) return false;
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

    const summary = Object.keys(filtered).reduce((acc, key) => {
      acc[key] = filtered[key].length;
      return acc;
    }, {});
    
    console.log('✅ filteredCategorizedData actualizado:', summary);
    
    // VALIDACIÓN DE CONSISTENCIA: Comparar con filteredData
    const totalCategorized = Object.values(summary).reduce((sum, count) => sum + count, 0);
    const rawFilteredCount = filteredData.length;
    
    if (Math.abs(totalCategorized - rawFilteredCount) > rawFilteredCount * 0.1) { // > 10% diferencia
      console.warn('⚠️ INCONSISTENCIA DETECTADA entre filteredData y filteredCategorizedData:');
      console.warn(`📊 filteredData: ${rawFilteredCount} registros`);
      console.warn(`📊 filteredCategorizedData: ${totalCategorized} registros`);
      console.warn(`📊 Diferencia: ${Math.abs(totalCategorized - rawFilteredCount)} registros`);
    } else {
      console.log('✅ Consistencia OK entre fuentes de datos:', {
        filteredData: rawFilteredCount,
        categorizedTotal: totalCategorized,
        diferencia: Math.abs(totalCategorized - rawFilteredCount)
      });
    }

    return filtered;
  }, [categorizedData, filters]);

  // Actualizar filtros con logging mejorado
  const updateFilters = (newFilters) => {
    console.log('🎯 Actualizando filtros:', {
      current: filters,
      new: newFilters,
      merged: { ...filters, ...newFilters }
    });
    
    // Log específico para filtros de provincia
    if (newFilters.province) {
      const normalizedProvince = normalizeProvinceKey(newFilters.province);
      console.log('🗺️ Filtro de provincia aplicado:', {
        original: newFilters.province,
        normalized: normalizedProvince,
        availableProvinces: [...new Set(data.map(item => item.PROVINCIA).filter(p => p && p !== '-'))]
      });
    }
    
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
    formatDateForDisplay,
    
    // Utilidades centralizadas exportadas para otros módulos
    normalizeProvinceKey,
    getProvinceKeyFromItem,
    getDepartamentoFromItem,
    getCoordinatesFromItem
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
