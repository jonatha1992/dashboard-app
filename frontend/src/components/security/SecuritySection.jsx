// no react hooks needed here other than props/context
import ProvinceChart from '../charts/ProvinceChart';
import TrendChart from '../charts/TrendChart';
import StatCard from '../dashboard/StatCard';
import { getCategoryConfig } from '../../services/securityStatsService';
import { useDashboard } from '../../contexts/DashboardContext';


const SecuritySection = ({ category, showProvinceChart = true }) => {
  const { filteredCategorizedData, loading, error, filters } = useDashboard();
  const data = filteredCategorizedData[category] || [];
  const config = getCategoryConfig(category);

  // Estadísticas basadas exclusivamente en datos reales
  const total = data.length;
  const provinceData = data.reduce((acc, item) => {
    if (item.PROVINCIA) acc[item.PROVINCIA] = (acc[item.PROVINCIA] || 0) + 1;
    return acc;
  }, {});

  const hasProvinceData = Object.values(provinceData).some(val => val > 0);
  const hasData = total > 0;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-sm text-gray-600">Cargando {category}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Nunca ocultar completamente - siempre mostrar con mensaje apropiado
  if (!hasData) {
    const hasActiveFilters = filters.fromDate || filters.toDate || filters.province;
    return (
      <div className="p-8 text-center">
        <div className="mb-4 text-4xl text-gray-400">📊</div>
        <h3 className="mb-2 text-lg font-medium text-gray-600">
          {hasActiveFilters ? 'Sin datos para el filtro aplicado' : 'Sin datos disponibles'}
        </h3>
        <p className="text-sm text-gray-500">
          {hasActiveFilters 
            ? `No se encontraron registros de ${category} para los filtros seleccionados`
            : `Use "Importar Excel" para cargar datos de ${category}`
          }
        </p>
        {hasActiveFilters && (
          <div className="mt-3 text-xs text-gray-400">
            📅 Filtros activos: 
            {filters.province && ` Provincia: ${filters.province}`}
            {(filters.fromDate || filters.toDate) && ` • Fechas: ${filters.fromDate} al ${filters.toDate}`}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-6">
      {/* Header */}
      <div className="flex items-center mb-6 space-x-3">
        <span className="text-3xl">{config.icon}</span>
        <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
      </div>


      {/* Gráfico por provincias - Solo mostrar si hay datos de provincias y si se permite */}
      {showProvinceChart && hasProvinceData && (
        <div className="w-full md:w-1/2">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Distribución por Provincia
          </h3>
          <ProvinceChart
            data={provinceData}
            title={config.title}
            color={config.color}
          />
        </div>
      )}


      {/* Mensaje cuando no hay datos */}
      {!hasData && (
        <div className="py-12 text-center rounded-lg bg-gray-50">
          <p className="text-gray-500">No hay datos disponibles para mostrar en esta sección.</p>
        </div>
      )}
    </div>
  );
};

export default SecuritySection;