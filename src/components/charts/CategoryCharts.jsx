import { useState } from 'react';
import BaseChart from './BaseChart';
import StatCard from '../dashboard/StatCard';
import DataTable from '../dashboard/DataTable';
import { getChartData } from '../../services/dataService';

const CategoryCharts = ({ data, categoryName, title, icon, color }) => {
    const [activeChart, setActiveChart] = useState('monthly');
    
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">{icon}</div>
                <h3 className="text-xl text-gray-600 mb-2">No hay datos disponibles</h3>
                <p className="text-gray-500">No se encontraron registros para {title.toLowerCase()}</p>
            </div>
        );
    }

    const chartData = getChartData(data, categoryName);
    
    if (!chartData) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">{icon}</div>
                <h3 className="text-xl text-gray-600 mb-2">Error al procesar datos</h3>
                <p className="text-gray-500">No se pudieron generar los gráficos para {title.toLowerCase()}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title={`Total ${title}`}
                    value={data.length}
                    icon={icon}
                    color={color}
                />
                <StatCard
                    title="Provincias Involucradas"
                    value={new Set(data.map(item => item.PROVINCIA)).size}
                    icon="🗺️"
                    color="bg-green-500"
                />
                <StatCard
                    title="Departamentos"
                    value={new Set(data.map(item => item.DEPARTAMENTO_O_PARTIDO)).size}
                    icon="📍"
                    color="bg-purple-500"
                />
            </div>

            {/* Selector de gráficos */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        className={`px-4 py-2 rounded-md font-medium ${
                            activeChart === 'monthly' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setActiveChart('monthly')}
                    >
                        Por Mes
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md font-medium ${
                            activeChart === 'province' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setActiveChart('province')}
                    >
                        Por Provincia
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md font-medium ${
                            activeChart === 'department' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setActiveChart('department')}
                    >
                        Por Departamento
                    </button>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeChart === 'monthly' && (
                        <>
                            <BaseChart
                                type="line"
                                data={chartData.monthly}
                                title={`${title} - Tendencia Mensual`}
                            />
                            <BaseChart
                                type="bar"
                                data={chartData.monthly}
                                title={`${title} - Por Mes (Barras)`}
                            />
                        </>
                    )}
                    
                    {activeChart === 'province' && (
                        <>
                            <BaseChart
                                type="pie"
                                data={chartData.byProvince}
                                title={`${title} - Distribución por Provincia`}
                            />
                            <BaseChart
                                type="bar"
                                data={chartData.byProvince}
                                title={`${title} - Por Provincia (Barras)`}
                            />
                        </>
                    )}
                    
                    {activeChart === 'department' && (
                        <>
                            <BaseChart
                                type="bar"
                                data={chartData.byDepartment}
                                title={`${title} - Top 10 Departamentos`}
                            />
                            <BaseChart
                                type="pie"
                                data={chartData.byDepartment}
                                title={`${title} - Top 10 Departamentos (Circular)`}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Tabla de datos */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Registros de {title} ({data.length} total)
                </h3>
                <DataTable data={data} />
            </div>
        </div>
    );
};

export default CategoryCharts;