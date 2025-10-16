/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import apiService from '../services/apiService';
import { analysisService } from '../services/analysisService';
import { loadData, getCategorizedData } from '../services/dataService';
import {
  parseDateToISO,
  formatDateForDisplay,
  normalizeProvinceKey,
  getCoordinatesFromItem,
  getProvinceKeyFromItem,
  getDepartamentoFromItem,
  getOperativoCodeFromItem
} from '../utils/dataUtils';
import { OPERATIVE_CODE_ENTRIES, OPERATIVE_CODE_MAP, DEFAULT_OPERATIVE_CODE } from '../constants/operativeCodes';

// Re-export utility functions for other modules
export {
  parseDateToISO,
  formatDateForDisplay,
  normalizeProvinceKey,
  getCoordinatesFromItem,
  getProvinceKeyFromItem,
  getDepartamentoFromItem,
  getOperativoCodeFromItem
};

// Alias for backward compatibility
const makeKey = normalizeProvinceKey;

// Create context with default values
const DashboardContext = createContext({
  // State
  loading: true,
  error: null,
  data: [],
  filteredData: [],
  filteredCategorizedData: {},
  filters: {},
  availableProvinces: [],
  availableDepartments: [],
  availableUnits: [],
  availableOperativeCodes: [],
  unitsByProvince: {},
  departmentsByProvinceUnit: {},
  dataStats: {},
  activeCategory: null,
  
  // Methods
  setFilters: () => {},
  clearFilters: () => {},
  refreshData: async () => {},
  setActiveCategory: () => {},
  
  // Map related
  mapCenter: { lat: -38.4161, lng: -63.6167 }, // Center of Argentina
  mapZoom: 4,
  setMapView: () => {}
});

export const DashboardProvider = ({ children }) => {
  // State
  const [data, setData] = useState([]);
  const [categorizedData, setCategorizedData] = useState({});
  const [dataStats, setDataStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('procedimientos');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    province: '',
    unidad: '',
    operativoCodigo: ''
  });

  // Data Warehouse state
  const [dwStatus, setDwStatus] = useState(null);
  const [dwLoading, setDwLoading] = useState(false);
  const [dwError, setDwError] = useState(null);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [availableOperativeCodes, setAvailableOperativeCodes] = useState([]);
  const [unitsByProvince, setUnitsByProvince] = useState({});
  const [departmentsByProvinceUnit, setDepartmentsByProvinceUnit] = useState({});
  const [availableYears, setAvailableYears] = useState([2025]);
  const [mapCenter, setMapCenter] = useState({ lat: -38.4161, lng: -63.6167 });
  const [mapZoom, setMapZoom] = useState(4);

  const buildBasicStats = useCallback((items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        totalRecords: 0,
        dateRange: { earliest: null, latest: null },
        provinces: []
      };
    }

    const dates = items
      .map(item => parseDateToISO(item.FECHA))
      .filter(date => date)
      .sort();

    const provinces = Array.from(new Set(
      items
        .map(item => item.PROVINCIA || item.provincia || item.Provincia || item.province)
        .filter(prov => prov && prov !== '-')
        .map(prov => String(prov).trim())
    )).sort((a, b) => a.localeCompare(b, 'es'));

    return {
      totalRecords: items.length,
      dateRange: {
        earliest: dates.length > 0 ? dates[0] : null,
        latest: dates.length > 0 ? dates[dates.length - 1] : null
      },
      provinces
    };
  }, []);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter(item => {
      // Date filtering
      const itemISO = parseDateToISO(item.FECHA);
      if (filters.fromDate && itemISO < filters.fromDate) return false;
      if (filters.toDate && itemISO > filters.toDate) return false;
      
      // Province filtering
      if (filters.province) {
        const filterKey = makeKey(filters.province);
        const itemProvKey = getProvinceKeyFromItem(item);
        if (itemProvKey !== filterKey) return false;
      }
      
      // Unit filtering
      if (filters.unidad) {
        const unit = (item.UNIDAD_INTERVINIENTE || item.unidad_interviniente || '').toLowerCase();
        if (unit !== filters.unidad.toLowerCase()) return false;
      }

      if (filters.operativoCodigo) {
        const code = getOperativoCodeFromItem(item).toLowerCase();
        if (code !== filters.operativoCodigo.toLowerCase()) return false;
      }
      
      return true;
    });
  }, [data, filters]);

  useEffect(() => {
    console.groupCollapsed('DashboardContext: resultado de filtrado');
    console.debug('Filtros activos', filters);
    console.debug('Total registros disponibles', Array.isArray(data) ? data.length : 0);
    console.debug('Total registros filtrados', filteredData.length);
    console.groupEnd();
  }, [filteredData, data, filters]);

  // Filter categorized data
  const filteredCategorizedData = useMemo(() => {
    const result = {};
    
    if (!categorizedData || Object.keys(categorizedData).length === 0) {
      return {};
    }
    
    // Apply filters to each category
    Object.entries(categorizedData).forEach(([category, items]) => {
      if (!Array.isArray(items)) {
        console.warn(`Categoría ${category} no es un array:`, items);
        return;
      }
      
      result[category] = items.filter(item => {
        // Apply the same filters as in filteredData
        const itemISO = parseDateToISO(item.FECHA);
        if (filters.fromDate && itemISO < filters.fromDate) return false;
        if (filters.toDate && itemISO > filters.toDate) return false;
        
        if (filters.province) {
          const filterKey = makeKey(filters.province);
          const itemProvKey = getProvinceKeyFromItem(item);
          if (itemProvKey !== filterKey) return false;
        }
        
        if (filters.unidad) {
          const unit = (item.UNIDAD_INTERVINIENTE || item.unidad_interviniente || '').toLowerCase();
          if (unit !== filters.unidad.toLowerCase()) return false;
        }

        if (filters.operativoCodigo) {
          const code = getOperativoCodeFromItem(item).toLowerCase();
          if (code !== filters.operativoCodigo.toLowerCase()) return false;
        }
        
        return true;
      });
    });
    
    return result;
  }, [categorizedData, filters]);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to load from API first
        try {
          console.log('🔄 DashboardContext: Intentando cargar desde API...');
          const allCategorizedData = await apiService.getCategorizedData();
          
          if (allCategorizedData && Object.keys(allCategorizedData).length > 0) {
            console.log('✅ DashboardContext: API data loaded successfully');
            const rawData = allCategorizedData.general || [];
            setData(rawData);
            setCategorizedData(allCategorizedData);
            
            const stats = await apiService.getDataStats();
            setDataStats(stats);
            return;
          }
        } catch (apiError) {
          console.warn('⚠️ DashboardContext: Error loading from API, falling back to local data:', apiError.message);
          // Fall through to local data loading
        }
        
        // Fallback to local data
        try {
          console.log('🔄 DashboardContext: Cargando datos locales...');
          const localData = await loadData();
          
          console.log('📊 DashboardContext: Local data loaded:', localData ? localData.length : 0, 'records');
          
          if (localData && localData.length > 0) {
            console.log('✅ DashboardContext: Setting local data to state...');
            setData(localData);
            
            const categorizedDataLocal = getCategorizedData(localData);
            console.log('📂 DashboardContext: Categorized data:', Object.keys(categorizedDataLocal).map(k => `${k}: ${categorizedDataLocal[k].length}`).join(', '));
            setCategorizedData(categorizedDataLocal);
            
            setDataStats(buildBasicStats(localData));
          }
        } catch (localError) {
          console.error('Error loading local data:', localError);
          setError('Error al cargar los datos locales');
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [buildBasicStats]);

  // Update available filters catalogues whenever raw data changes
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setAvailableProvinces([]);
      setAvailableDepartments([]);
      setAvailableUnits([]);
      setAvailableOperativeCodes([]);
      setUnitsByProvince({});
      setDepartmentsByProvinceUnit({});
      console.warn('DashboardContext: Dataset vacío, catálogos limpiados');
      return;
    }

    const provinceDisplayByKey = new Map();
    const unitsByProvinceMap = new Map();
    const departmentsHierarchyMap = new Map();
    const departmentSet = new Set();
    const unitSet = new Set();
    const operativeCodeSet = new Set([DEFAULT_OPERATIVE_CODE]);

    data.forEach((item) => {
      const rawProvince = item.PROVINCIA || item.provincia || item.Provincia || item.province;
      let provinceLabel = 'Sin provincia';
      if (rawProvince && rawProvince !== '-') {
        const trimmedProvince = String(rawProvince).trim();
        const normalizedProvince = normalizeProvinceKey(trimmedProvince);
        if (normalizedProvince) {
          if (!provinceDisplayByKey.has(normalizedProvince)) {
            provinceDisplayByKey.set(normalizedProvince, trimmedProvince);
          }
          provinceLabel = provinceDisplayByKey.get(normalizedProvince) || trimmedProvince;
        } else {
          provinceLabel = trimmedProvince;
        }
      }

      const dept = getDepartamentoFromItem(item);
      if (dept) {
        departmentSet.add(dept);
      }

      const unit = (item.UNIDAD_INTERVINIENTE ||
        item.unidad_interviniente ||
        item.UNIDAD ||
        item.FUERZA_INTERVINIENTE ||
        '').toString().trim();

      const operativeCode = getOperativoCodeFromItem(item);
      if (operativeCode) {
        operativeCodeSet.add(operativeCode);
      }

      if (unit && unit !== '-') {
        unitSet.add(unit);
        if (!unitsByProvinceMap.has(provinceLabel)) {
          unitsByProvinceMap.set(provinceLabel, new Set());
        }
        unitsByProvinceMap.get(provinceLabel).add(unit);

        if (dept) {
          const hierarchyKey = `${provinceLabel}__${unit}`;
          if (!departmentsHierarchyMap.has(hierarchyKey)) {
            departmentsHierarchyMap.set(hierarchyKey, new Set());
          }
          departmentsHierarchyMap.get(hierarchyKey).add(dept);
        }
      }
    });

    const sortedProvinces = Array.from(provinceDisplayByKey.values()).sort((a, b) => a.localeCompare(b, 'es'));
    if (unitsByProvinceMap.has('Sin provincia') && !sortedProvinces.includes('Sin provincia')) {
      sortedProvinces.push('Sin provincia');
    }
    const sortedDepartments = Array.from(departmentSet).sort((a, b) => a.localeCompare(b, 'es'));
    const sortedUnits = Array.from(unitSet).sort((a, b) => a.localeCompare(b, 'es'));
    const knownOrder = OPERATIVE_CODE_ENTRIES.map((entry) => entry.code);
    const sortedOperativeCodes = knownOrder.filter((code) => operativeCodeSet.has(code));
    operativeCodeSet.forEach((code) => {
      if (!OPERATIVE_CODE_MAP[code]) {
        sortedOperativeCodes.push(code);
      }
    });
    const unitsByProvinceObj = {};
    unitsByProvinceMap.forEach((set, provinceLabel) => {
      if (set.size === 0) return;
      unitsByProvinceObj[provinceLabel] = Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
    });
    const departmentsHierarchyObj = {};
    departmentsHierarchyMap.forEach((set, key) => {
      departmentsHierarchyObj[key] = Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
    });

    setAvailableProvinces(sortedProvinces);
    setAvailableDepartments(sortedDepartments);
    setAvailableUnits(sortedUnits);
    setAvailableOperativeCodes(sortedOperativeCodes);
    setUnitsByProvince(unitsByProvinceObj);
    setDepartmentsByProvinceUnit(departmentsHierarchyObj);
    console.groupCollapsed('DashboardContext: filtros recalculados');
    console.debug('Total registros', data.length);
    console.debug('Provincias disponibles', sortedProvinces);
    console.debug('Unidades disponibles', sortedUnits);
    console.debug('Códigos operativos disponibles', sortedOperativeCodes);
    console.groupEnd();
    setDataStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        provinces: sortedProvinces
      };
    });
  }, [data]);

  // Update filters
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, ...newFilters };
      console.groupCollapsed('DashboardContext: filtros actualizados');
      console.debug('Anterior:', prev);
      console.debug('Cambios recibidos:', newFilters);
      console.debug('Resultado:', nextFilters);
      console.groupEnd();
      return nextFilters;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      fromDate: '',
      toDate: '',
      province: '',
      unidad: '',
      operativoCodigo: ''
    });
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    let updated = false;
    let finalCount = 0;

    try {
      setLoading(true);
      setError(null);

      try {
        const categorizedFromApi = await apiService.getCategorizedData();

        if (categorizedFromApi && Object.keys(categorizedFromApi).length > 0) {
          const rawFromApi = categorizedFromApi.general || categorizedFromApi.procedimientos || [];
          finalCount = rawFromApi.length;

          setData(rawFromApi);
          setCategorizedData(categorizedFromApi);

          try {
            const statsFromApi = await apiService.getDataStats();
            if (statsFromApi) {
              setDataStats(statsFromApi);
            }
          } catch (statsError) {
            console.warn('DashboardContext: No se pudieron obtener las estadisticas desde la API:', statsError);
          }

          updated = true;
        }
      } catch (apiError) {
        console.warn('DashboardContext: Fallo al refrescar desde API, se usara fallback local.', apiError);
      }

      if (!updated) {
        const localData = await loadData();

        if (localData && localData.length > 0) {
          finalCount = localData.length;
          setData(localData);
          const categorizedLocal = getCategorizedData(localData);
          setCategorizedData(categorizedLocal);
          setDataStats(buildBasicStats(localData));
          updated = true;
        } else {
          setData([]);
          setCategorizedData({});
          setDataStats(buildBasicStats([]));
          finalCount = 0;
          setError('No se encontraron datos disponibles al refrescar.');
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Error al actualizar los datos');
    } finally {
      console.info('DashboardContext: refreshData finalizado', {
        actualizado: updated,
        registros: finalCount
      });
      setLoading(false);
    }
  }, [buildBasicStats]);

  // Set map view
  const setMapView = useCallback((center, zoom) => {
    if (center) setMapCenter(center);
    if (zoom) setMapZoom(zoom);
  }, []);

  // Context value
  const contextValue = {
    loading,
    error,
    data,
    filteredData,
    filteredCategorizedData,
    filters,
    availableProvinces,
    availableDepartments,
    availableUnits,
    availableOperativeCodes,
    unitsByProvince,
    departmentsByProvinceUnit,
    dataStats,
    activeCategory,
    setFilters: updateFilters,
    clearFilters,
    refreshData,
    setActiveCategory,
    mapCenter,
    mapZoom,
    setMapView
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
