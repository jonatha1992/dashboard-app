/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getCategorizedData } from '../services/dataService';
import apiService from '../services/apiService';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {

  // Estado global de datos y navegación
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    province: ''
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
              console.log(`✅ Datos cargados desde backend: ${result.length} registros`);
              
              // Calcular fecha mínima y máxima basada en los datos cargados
              const parseDateToISO = (dateStr) => {
                if (!dateStr) return null;
                // Si ya está en formato ISO yyyy-mm-dd o contiene 'T', extraer la parte fecha
                if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
                // Formato común dd/mm/yyyy
                const dmy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (dmy) {
                  const dd = dmy[1].padStart(2, '0');
                  const mm = dmy[2].padStart(2, '0');
                  const yyyy = dmy[3];
                  return `${yyyy}-${mm}-${dd}`;
                }
                // Intentar con Date parser como último recurso
                const parsed = new Date(dateStr);
                if (!isNaN(parsed.getTime())) {
                  const y = parsed.getFullYear();
                  const m = String(parsed.getMonth() + 1).padStart(2, '0');
                  const d = String(parsed.getDate()).padStart(2, '0');
                  return `${y}-${m}-${d}`;
                }
                return null;
              };

              const isoDates = result
                .map(item => parseDateToISO(item.FECHA))
                .filter(Boolean)
                .sort();

              if (isoDates.length > 0) {
                const minDate = isoDates[0];
                const maxDate = isoDates[isoDates.length - 1];
                // Si los filtros están vacíos (carga inicial), los inicializamos
                setFilters(prev => ({
                  fromDate: prev.fromDate || minDate,
                  toDate: prev.toDate || maxDate,
                  province: prev.province || ''
                }));
              }
            } else {
              // Sin datos en el backend - modo Import File
              setData([]);
              console.log('📁 Backend sin datos, usar Import File para cargar archivos Excel');
            }
          } else {
            // Usuario no autenticado - se manejará por las rutas protegidas
            setData([]);
            console.log('🔐 Usuario no autenticado');
          }
        } catch (error) {
          // Error cargando datos - no es crítico, puede ser que no haya datos aún
          setData([]);
          console.log('📁 Sin datos disponibles en backend, usar Import File para cargar datos');
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

  // Filtrar datos según filtros
  const filteredData = useMemo(() => {
    // Helper para convertir FECHA a ISO yyyy-mm-dd (compatible con input date)
    const parseDateToISO = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
      const dmy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dmy) {
        const dd = dmy[1].padStart(2, '0');
        const mm = dmy[2].padStart(2, '0');
        const yyyy = dmy[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
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
    data,
    setData,
    loading,
    error,
    activeCategory,
    setActiveCategory: updateActiveCategory,
    filters,
    setFilters: updateFilters,
    filteredData,
    filteredCategorizedData
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
