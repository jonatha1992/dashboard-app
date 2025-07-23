import { useState, useEffect } from 'react';
import ProvinceChart from '../charts/ProvinceChart';
import TrendChart from '../charts/TrendChart';
import StatCard from '../dashboard/StatCard';
import { getSecurityStats, getCategoryConfig } from '../../services/securityStatsService';

const SecuritySection = ({ category }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const config = getCategoryConfig(category);

  useEffect(() => {
    const fetchStats = () => {
      try {
        setLoading(true);
        const data = getSecurityStats(category);
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error(`Error al cargar estadísticas de ${category}:`, error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Cargando estadísticas de {config.title.toLowerCase()}...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Error al cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">{config.icon}</span>
        <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
      </div>

      {/* Estadísticas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Nacional"
          value={stats.total}
          icon={config.icon}
          color={`bg-gradient-to-r from-${config.color.replace('#', '')}`}
        />
        <StatCard
          title="Reciente"
          value={stats.lastMonth}
          icon="📅"
          color="bg-gradient-to-r from-gray-500 to-gray-600"
        />
        <StatCard
          title="Provincias Activas"
          value={Object.keys(stats.provinceData).length}
          icon="🗺️"
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
      </div>

      {/* Gráfico por provincias */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribución por Provincia
        </h3>
        <ProvinceChart
          data={stats.provinceData}
          title={config.title}
          color={config.color}
        />
      </div>

      {/* Gráfico de tendencia */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tendencia Temporal
        </h3>
        <TrendChart
          data={stats.trendData}
          title={config.title}
          color={config.color}
        />
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3">
          Información de los Datos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Período:</span> Datos recientes
          </div>
          <div>
            <span className="font-medium">Última actualización:</span> Datos de muestra
          </div>
          <div>
            <span className="font-medium">Provincia con mayor registro:</span>{' '}
            {Object.entries(stats.provinceData).sort(([, a], [, b]) => b - a)[0]?.[0]}
          </div>
          <div>
            <span className="font-medium">Estado:</span> Versión inicial con datos de muestra
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;