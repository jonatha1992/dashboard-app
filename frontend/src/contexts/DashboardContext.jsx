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
  getDepartamentoFromItem
} from '../utils/dataUtils';

// Re-export utility functions for other modules
export {
  parseDateToISO,
  formatDateForDisplay,
  normalizeProvinceKey,
  getCoordinatesFromItem,
  getProvinceKeyFromItem,
  getDepartamentoFromItem
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
    departamento: '',
    unidad: ''
  });

  // Data Warehouse state
  const [dwStatus, setDwStatus] = useState(null);
  const [dwLoading, setDwLoading] = useState(false);
  const [dwError, setDwError] = useState(null);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableYears, setAvailableYears] = useState([2025]);
  const [mapCenter, setMapCenter] = useState({ lat: -38.4161, lng: -63.6167 });
  const [mapZoom, setMapZoom] = useState(4);

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
      
      // Department filtering
      if (filters.departamento) {
        const itemDept = getDepartamentoFromItem(item).toLowerCase();
        if (itemDept !== filters.departamento.toLowerCase()) return false;
      }
      
      // Unit filtering
      if (filters.unidad) {
        const unit = (item.UNIDAD_INTERVINIENTE || item.unidad_interviniente || '').toLowerCase();
        if (unit !== filters.unidad.toLowerCase()) return false;
      }
      
      return true;
    });
  }, [data, filters]);

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
        
        if (filters.departamento) {
          const itemDept = getDepartamentoFromItem(item).toLowerCase();
          if (itemDept !== filters.departamento.toLowerCase()) return false;
        }
        
        if (filters.unidad) {
          const unit = (item.UNIDAD_INTERVINIENTE || item.unidad_interviniente || '').toLowerCase();
          if (unit !== filters.unidad.toLowerCase()) return false;
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
            
            // Create basic stats
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
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      fromDate: '',
      toDate: '',
      province: '',
      departamento: '',
      unidad: ''
    });
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      // Implementation of refresh logic
      // ...
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set map view
  const setMapView = useCallback((center, zoom) => {
    if (center) setMapCenter(center);
    if (zoom) setMapZoom(zoom);
  }, []);

  // Context value
  const contextValue = {
    // State
    loading,
    error,
    data,
    filteredData,
    filteredCategorizedData,
    filters,
    availableProvinces,
    availableDepartments: [], // TODO: Populate this
    availableUnits: [], // TODO: Populate this
    dataStats,
    activeCategory,
    
    // Methods
    setFilters: updateFilters,
    clearFilters,
    refreshData,
    setActiveCategory,
    
    // Map related
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
