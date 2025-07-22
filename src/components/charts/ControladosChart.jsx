// Chart component for Controlados (Controlled)
import BaseChart from './BaseChart';
import { getChartData } from '../../services/dataService';

export default function ControladosChart({ data, title = "Análisis de Controles" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  const provincialData = getChartData(data, 'provincial');
  const monthlyData = getChartData(data, 'monthly');

  return (
    <div className="space-y-6">
      {/* Resumen estadístico */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <div className="text-sm text-blue-500">Total de Controles</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {new Set(data.map(item => item.PROVINCIA)).size}
            </div>
            <div className="text-sm text-indigo-500">Provincias Activas</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(data.length / new Set(data.map(item => item.FECHA?.split(' ')[0]).filter(Boolean)).size || 1)}
            </div>
            <div className="text-sm text-purple-500">Promedio por Día</div>
          </div>
        </div>
        
        {/* Gráfico mensual */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-2">Evolución Mensual</h4>
          <BaseChart
            type="line"
            data={monthlyData}
            title="Controles por Mes"
          />
        </div>
        
        {/* Gráfico por provincia */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Distribución Geográfica</h4>
          <BaseChart
            type="doughnut"
            data={provincialData}
            title="Controles por Provincia"
          />
        </div>
      </div>
    </div>
  );
}