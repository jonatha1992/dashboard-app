// Chart component for Procedimientos (Procedures)
import BaseChart from './BaseChart';
import { getChartData } from '../../services/dataService';

export default function ProcedimientosChart({ data, title = "Análisis de Procedimientos" }) {
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
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.length}</div>
            <div className="text-sm text-green-500">Total Procedimientos</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {new Set(data.map(item => item.PROVINCIA)).size}
            </div>
            <div className="text-sm text-emerald-500">Jurisdicciones</div>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-teal-600">
              {new Set(data.map(item => item.FECHA?.split(' ')[0]).filter(Boolean)).size}
            </div>
            <div className="text-sm text-teal-500">Días Activos</div>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">
              {Math.round(data.length / Math.max(new Set(data.map(item => item.FECHA?.split(' ')[0]).filter(Boolean)).size, 1))}
            </div>
            <div className="text-sm text-cyan-500">Promedio Diario</div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Tendencia Mensual</h4>
            <BaseChart
              type="bar"
              data={monthlyData}
              title="Procedimientos por Mes"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Actividad Diaria</h4>
              <BaseChart
                type="line"
                data={temporalData}
                title="Procedimientos por Día"
              />
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Distribución Provincial</h4>
              <BaseChart
                type="doughnut"
                data={provincialData}
                title="Por Provincia"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}