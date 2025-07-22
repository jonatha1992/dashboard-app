// Chart component for Afectados (Affected)
import BaseChart from './BaseChart';
import { getChartData } from '../../services/dataService';

export default function AfectadosChart({ data, title = "Análisis de Personas Afectadas" }) {
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{data.length}</div>
            <div className="text-sm text-orange-500">Total de Afectados</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {new Set(data.map(item => item.PROVINCIA)).size}
            </div>
            <div className="text-sm text-red-500">Áreas Afectadas</div>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">
              {new Set(data.map(item => item.TIPO_INTERVENCION)).size}
            </div>
            <div className="text-sm text-pink-500">Tipos de Casos</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Evolución Temporal</h4>
            <BaseChart
              type="line"
              data={temporalData}
              title="Casos por Período"
            />
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Por Región</h4>
            <BaseChart
              type="pie"
              data={provincialData}
              title="Distribución Regional"
            />
          </div>
        </div>
      </div>
    </div>
  );
}