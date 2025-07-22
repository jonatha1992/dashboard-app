// Chart component for Trata (Trafficking)
import BaseChart from './BaseChart';
import { getChartData } from '../../services/dataService';

export default function TrateChart({ data, title = "Análisis de Trata y Tráfico" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  const temporalData = getChartData(data, 'temporal');
  const provincialData = getChartData(data, 'provincial');
  const monthlyData = getChartData(data, 'monthly');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        
        {/* Information banner */}
        <div className="bg-purple-100 border border-purple-300 text-purple-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-purple-600">🚨</span>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                Casos relacionados con trata de personas y tráfico ilegal - Requiere seguimiento especial.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{data.length}</div>
            <div className="text-sm text-purple-500">Casos de Trata</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {new Set(data.map(item => item.PROVINCIA)).size}
            </div>
            <div className="text-sm text-indigo-500">Provincias Afectadas</div>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">
              {new Set(data.map(item => item.TIPO_INTERVENCION)).size}
            </div>
            <div className="text-sm text-pink-500">Tipos de Operativo</div>
          </div>
          <div className="bg-violet-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-violet-600">
              {data.length > 0 ? Math.round(data.length / new Set(data.map(item => item.FECHA?.split('/')[1] + '/' + item.FECHA?.split('/')[2]).filter(Boolean)).size) : 0}
            </div>
            <div className="text-sm text-violet-500">Promedio Mensual</div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Evolución Temporal</h4>
            <BaseChart
              type="line"
              data={monthlyData}
              title="Casos por Mes"
              options={{
                elements: {
                  point: {
                    radius: 5,
                    hoverRadius: 8
                  }
                }
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Actividad Diaria</h4>
              <BaseChart
                type="bar"
                data={temporalData}
                title="Detecciones por Día"
              />
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Distribución Geográfica</h4>
              <BaseChart
                type="pie"
                data={provincialData}
                title="Casos por Provincia"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}