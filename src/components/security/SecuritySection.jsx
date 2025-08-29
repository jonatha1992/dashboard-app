import { useEffect } from 'react';
import ProvinceChart from '../charts/ProvinceChart';
import TrendChart from '../charts/TrendChart';
import StatCard from '../dashboard/StatCard';
import { getCategoryConfig } from '../../services/securityStatsService';
import { useDashboard } from '../../contexts/DashboardContext';


const SecuritySection = ({ category, hideEmpty = false }) => {
  const { filteredCategorizedData, loading, error } = useDashboard();
  const data = filteredCategorizedData[category] || [];
  const config = getCategoryConfig(category);

  // Estadísticas
  const total = data.length;
  const provinceData = data.reduce((acc, item) => {
    if (item.PROVINCIA) acc[item.PROVINCIA] = (acc[item.PROVINCIA] || 0) + 1;
    return acc;
  }, {});
  const trendData = [];
  // Aquí podrías agregar lógica para tendencia temporal real si tienes fechas
  // Por ahora solo placeholder vacío

  const hasProvinceData = Object.values(provinceData).some(val => val > 0);
  const hasData = total > 0;
  const topProvince = hasProvinceData
    ? Object.entries(provinceData).sort(([, a], [, b]) => b - a)[0]
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  if (!hasData && hideEmpty) return null;

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">{config.icon}</span>
        <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
      </div>

      {/* Estadísticas resumen - Solo mostrar si hay datos */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Nacional"
            value={total}
            icon={config.icon}
            color={`bg-gradient-to-r from-${config.color.replace('#', '')}`}
          />
          <StatCard
            title="Provincias Activas"
            value={Object.keys(provinceData).length}
            icon="🗺️"
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
        </div>
      )}

      {/* Gráfico por provincias - Solo mostrar si hay datos de provincias */}
      {hasProvinceData && (
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribución por Provincia
          </h3>
          <ProvinceChart
            data={provinceData}
            title={config.title}
            color={config.color}
          />
        </div>
      )}

      {/* Información adicional - Solo mostrar si hay datos */}
      {hasData && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            Información de los Datos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {topProvince && (
              <div>
                <span className="font-medium">Provincia con mayor registro:</span>{' '}
                {topProvince[0]} ({topProvince[1].toLocaleString()})
              </div>
            )}
            <div>
              <span className="font-medium">Total de provincias:</span> {Object.keys(provinceData).length}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {!hasData && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay datos disponibles para mostrar en esta sección.</p>
        </div>
      )}
    </div>
  );
};

export default SecuritySection;