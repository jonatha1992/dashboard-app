// Chart component for Incautaciones (Seizures)
import BaseChart from './BaseChart';
import { getChartData } from '../../services/dataService';

export default function IncautacionesChart({ data, title = "Análisis de Incautaciones" }) {
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{data.length}</div>
            <div className="text-sm text-emerald-500">Total Incautaciones</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {new Set(data.map(item => item.PROVINCIA)).size}
            </div>
            <div className="text-sm text-green-500">Provincias Activas</div>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-teal-600">
              {new Set(data.map(item => item.FECHA?.split(' ')[0]).filter(Boolean)).size}
            </div>
            <div className="text-sm text-teal-500">Días con Actividad</div>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">
              {data.length > 0 ? Math.round(data.length / Math.max(new Set(data.map(item => item.FECHA?.split(' ')[0]).filter(Boolean)).size, 1)) : 0}
            </div>
            <div className="text-sm text-cyan-500">Promedio Diario</div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Gráfico de tendencia mensual */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Tendencia de Incautaciones</h4>
            <BaseChart
              type="line"
              data={monthlyData}
              title="Evolución Mensual"
              options={{
                elements: {
                  line: {
                    tension: 0.4
                  }
                }
              }}
            />
          </div>
          
          {/* Grid de gráficos secundarios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Actividad Diaria</h4>
              <BaseChart
                type="bar"
                data={temporalData}
                title="Incautaciones por Día"
                options={{
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Distribución Provincial</h4>
              <BaseChart
                type="doughnut"
                data={provincialData}
                title="Por Provincia"
                options={{
                  cutout: '50%'
                }}
              />
            </div>
          </div>
          
          {/* Tabla resumen */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Resumen por Provincia</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Provincia</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Cantidad</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    data.reduce((acc, item) => {
                      const province = item.PROVINCIA || 'Sin especificar';
                      acc[province] = (acc[province] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([province, count]) => (
                      <tr key={province} className="border-b border-gray-100">
                        <td className="py-2 text-sm text-gray-900">{province}</td>
                        <td className="py-2 text-sm text-gray-900 text-right">{count}</td>
                        <td className="py-2 text-sm text-gray-900 text-right">
                          {((count / data.length) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}