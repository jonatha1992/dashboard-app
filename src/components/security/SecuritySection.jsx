// no react hooks needed here other than props/context
import ProvinceChart from '../charts/ProvinceChart';
import TrendChart from '../charts/TrendChart';
import StatCard from '../dashboard/StatCard';
import { getCategoryConfig } from '../../services/securityStatsService';
import { useDashboard } from '../../contexts/DashboardContext';


const SecuritySection = ({ category, hideEmpty = false, showProvinceChart = true, showSummaryCards = true }) => {
  const { filteredCategorizedData, loading, error } = useDashboard();
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
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  if (!hasData && hideEmpty) return null;

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