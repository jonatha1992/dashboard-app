// Chart component for Detenidos (Detained)
import BaseChart from './BaseChart';
import { getChartData } from '../../services/dataService';

export default function DetenidosChart({ data, title = "Análisis de Detenidos" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  const temporalData = getChartData(data, 'temporal');
  const provincialData = getChartData(data, 'provincial');

  return (
    <div className="space-y-6">
      {/* Resumen estadístico */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{data.length}</div>
            <div className="text-sm text-red-500">Total de Casos</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(data.map(item => item.PROVINCIA)).size}
            </div>
            <div className="text-sm text-orange-500">Provincias Afectadas</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {new Set(data.map(item => item.FECHA?.split('/')[1] + '/' + item.FECHA?.split('/')[2]).filter(Boolean)).size}
            </div>
            <div className="text-sm text-yellow-500">Meses Activos</div>
          </div>
        </div>
        
        {/* Gráfico temporal */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-2">Tendencia Temporal</h4>
          <BaseChart
            type="line"
            data={temporalData}
            title="Casos por Día"
          />
        </div>
        
        {/* Gráfico por provincia */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Distribución por Provincia</h4>
          <BaseChart
            type="bar"
            data={provincialData}
            title="Casos por Provincia"
          />
        </div>
      </div>
    </div>
  );
}