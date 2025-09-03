import { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import BaseChart from './BaseChart';
import StatCard from '../dashboard/StatCard';
import DataTable from '../dashboard/DataTable';
import { getChartData } from '../../services/dataService';

const CategoryCharts = ({ data, categoryName, title, icon, color, showTable = true }) => {
    const [activeChart, setActiveChart] = useState('monthly');
    const [timeGranularity, setTimeGranularity] = useState('month'); // 'day' | 'week' | 'month'
    const { filters } = useDashboard();
    const hasProvinceFilter = Boolean(filters && filters.province);

    // Ensure that when the user changes the time granularity we show the temporal charts
    useEffect(() => {
        setActiveChart('monthly');
    }, [timeGranularity]);

    if (!data || data.length === 0) {
        // Nunca ocultar completamente cuando hideEmpty es true
        return (
            <div className="py-8 text-center border rounded-lg bg-gray-50">
                <div className="mb-3 text-4xl text-gray-400">{icon}</div>
                <h3 className="mb-2 text-lg font-medium text-gray-600">
                    0 registros de {title.toLowerCase()}
                </h3>
                <p className="text-sm text-gray-500">
                    No hay datos disponibles para los filtros aplicados
                </p>
                <div className="mt-4 p-3 bg-white rounded border">
                    <div className="text-sm text-gray-400">Gráfico vacío - Sin estadísticas para mostrar</div>
                </div>
            </div>
        );
    }

    const chartData = getChartData(data, categoryName);

    // Helper: build time series with granularity
    const getWeekNumber = (d) => {
        // ISO week number
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        // Return week label in Spanish short form: "SEM-##" (e.g., SEM-05)
        // If you prefer to include year, change to `${date.getUTCFullYear()}-SEM-${...}`
        return `SEM-${String(weekNo).padStart(2, '0')}`;
    };

    const buildTimeSeries = (granularity) => {
        // Prefer FECHA_ISO (yyyy-mm-dd) when present to avoid inconsistent Date parsing
        const map = data.reduce((acc, item) => {
            const raw = item.FECHA_ISO || item.FECHA || '';
            if (!raw) return acc;
            const parsed = new Date(raw);
            if (isNaN(parsed.getTime())) return acc;

            let key;
            if (granularity === 'day') {
                const y = parsed.getFullYear();
                const m = String(parsed.getMonth() + 1).padStart(2, '0');
                const d = String(parsed.getDate()).padStart(2, '0');
                key = `${y}-${m}-${d}`; // ISO day key
            } else if (granularity === 'week') {
                key = getWeekNumber(parsed);
            } else {
                // month key as YYYY-MM to allow chronological sorting
                const y = parsed.getFullYear();
                const m = String(parsed.getMonth() + 1).padStart(2, '0');
                key = `${y}-${m}`;
            }

            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        // Sort keys chronologically
        const sortedKeys = Object.keys(map).sort();

        // Check if all data is from the same year for smart date formatting
        const years = sortedKeys.map(k => {
            if (granularity === 'day' || granularity === 'month') {
                return k.split('-')[0];
            }
            return null;
        }).filter(Boolean);
        const uniqueYears = [...new Set(years)];
        const sameYear = uniqueYears.length === 1;

        const labels = sortedKeys.map(k => {
            if (granularity === 'day') {
                const [y, m, d] = k.split('-');
                return sameYear ? `${d}/${m}` : `${d}/${m}/${y}`;
            } else if (granularity === 'week') {
                return k; // already in Y-W## format
            }
            // month
            const [y, m] = k.split('-');
            const date = new Date(Number(y), Number(m) - 1, 1);
            return sameYear ? 
                date.toLocaleDateString('es-ES', { month: 'long' }) :
                date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        });

        const values = sortedKeys.map(k => map[k]);

        return {
            labels,
            datasets: [{
                label: `${categoryName} - ${granularity}`,
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        };
    };

    // Helper to get caption text for time granularity
    const timeCaption = (g) => {
        if (g === 'day') return 'Día';
        if (g === 'week') return 'Semana';
        return 'Mes';
    };

    if (!chartData) {
        return (
            <div className="py-12 text-center">
                <div className="mb-4 text-6xl text-gray-400">{icon}</div>
                <h3 className="mb-2 text-xl text-gray-600">Error al procesar datos</h3>
                <p className="text-gray-500">No se pudieron generar los gráficos para {title.toLowerCase()}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
            <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        className={`px-3 py-1 rounded ${timeGranularity === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => { setTimeGranularity('month'); setActiveChart('monthly'); }}
                    >
                        Mes
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${timeGranularity === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => { setTimeGranularity('week'); setActiveChart('monthly'); }}
                    >Semana</button>
                    <button
                        className={`px-3 py-1 rounded ${timeGranularity === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => { setTimeGranularity('day'); setActiveChart('monthly'); }}
                    >Día</button>
                    <button
                        className={`px-4 py-2 rounded-md font-medium ${activeChart === 'province'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={() => setActiveChart('province')}
                    >
                        Por Provincia
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md font-medium ${activeChart === 'department'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={() => setActiveChart('department')}
                    >
                        Por Departamento
                    </button>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {activeChart === 'monthly' && (
                        <>
                            <div className="p-4 bg-white rounded-lg shadow-md">
                                <div className="mb-2 text-sm font-semibold text-gray-700">Tendencia ({timeCaption(timeGranularity)})</div>
                                <BaseChart
                                    type="line"
                                    data={buildTimeSeries(timeGranularity)}
                                    title={null}
                                    caption={timeCaption(timeGranularity)}
                                />
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-md">
                                <div className="mb-2 text-sm font-semibold text-gray-700">Por {timeGranularity === 'month' ? 'Mes' : timeGranularity === 'week' ? 'Semana' : 'Día'} (Barras)</div>
                                <BaseChart
                                    type="bar"
                                    data={buildTimeSeries(timeGranularity)}
                                    title={null}
                                    caption={`${timeCaption(timeGranularity)} — Cantidad`}
                                />
                            </div>
                        </>
                    )}

                    {activeChart === 'province' && (
                        <>
                            {/* If a province filter is active, show byDepartment instead of byProvince */}
                            {hasProvinceFilter ? (
                                <>
                                    <div className="p-4 bg-white rounded-lg shadow-md">
                                        <div className="mb-2 text-sm font-semibold text-gray-700">Distribución por Departamento</div>
                                        <BaseChart
                                            type="pie"
                                            data={chartData.byDepartment}
                                            title={null}
                                            caption="Departamento"
                                        />
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow-md">
                                        <div className="mb-2 text-sm font-semibold text-gray-700">Por Departamento (Barras)</div>
                                        <BaseChart
                                            type="bar"
                                            data={chartData.byDepartment}
                                            title={null}
                                            caption="Departamento — Cantidad"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-white rounded-lg shadow-md">
                                        <div className="mb-2 text-sm font-semibold text-gray-700">Distribución por Provincia</div>
                                        <BaseChart
                                            type="pie"
                                            data={chartData.byProvince}
                                            title={null}
                                            caption="Provincia"
                                        />
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow-md">
                                        <div className="mb-2 text-sm font-semibold text-gray-700">Por Provincia (Barras)</div>
                                        <BaseChart
                                            type="bar"
                                            data={chartData.byProvince}
                                            title={null}
                                            caption="Provincia — Cantidad"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {activeChart === 'department' && (
                        <>
                            <BaseChart
                                type="bar"
                                data={chartData.byDepartment}
                                title={`${title} - Top 10 Departamentos`}
                                caption="Departamento — Top 10"
                            />
                            <BaseChart
                                type="pie"
                                data={chartData.byDepartment}
                                title={`${title} - Top 10 Departamentos (Circular)`}
                                caption="Departamento — Top 10"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Tabla de datos (opcional) */}
            {showTable && (
                <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                        Registros de {title} ({data.length} total)
                    </h3>
                    <DataTable data={data} />
                </div>
            )}
        </div>
    );
};

export default CategoryCharts;