// Chart component for Abatidos (Shot down/Eliminated)
import BaseChart from './BaseChart';
import { getChartData } from '../../services/dataService';

export default function AbatidosChart({ data, title = "Análisis de Casos Críticos" }) {
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
        
        {/* Alert banner for critical data */}
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-600">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                Esta sección contiene información crítica que requiere atención especial.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{data.length}</div>
            <div className="text-sm text-red-600">Total de Casos</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">
              {new Set(data.map(item => item.PROVINCIA)).size}
            </div>
            <div className="text-sm text-gray-600">Provincias Involucradas</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {new Set(data.map(item => item.FECHA?.split('/')[1] + '/' + item.FECHA?.split('/')[2]).filter(Boolean)).size}
            </div>
            <div className="text-sm text-yellow-600">Períodos Activos</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Cronología de Eventos</h4>
            <BaseChart
              type="line"
              data={temporalData}
              title="Casos por Fecha"
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Distribución Geográfica</h4>
            <BaseChart
              type="bar"
              data={provincialData}
              title="Por Provincia"
              options={{
                indexAxis: 'y',
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}