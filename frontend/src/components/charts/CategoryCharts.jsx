import { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import BaseChart from './BaseChart';
import StatCard from '../dashboard/StatCard';
import DataTable from '../dashboard/DataTable';
import { getChartData } from '../../services/dataService';

const CategoryCharts = ({ data, categoryName, title, icon, color, showTable = true, compactMode = false, defaultView = 'monthly' }) => {
    const [activeChart, setActiveChart] = useState(defaultView);
    const [timeGranularity, setTimeGranularity] = useState('month'); // 'day' | 'week' | 'month'
    const [manualGranularitySelection, setManualGranularitySelection] = useState(false); // Track if user manually selected granularity
    const { filters } = useDashboard();
    const hasProvinceFilter = Boolean(filters && filters.province);
    
    // LOGGING TEMPORAL para diagnosticar filtros
    if (Math.random() < 0.1) { // 10% de las veces
        console.log(`📊 CategoryCharts [${categoryName}]:`, {
            dataCount: data?.length || 0,
            hasProvinceFilter,
            activeProvince: filters?.province,
            chartType: activeChart
        });
    }

    // Only auto-switch to temporal charts when granularity changes manually
    useEffect(() => {
        if (manualGranularitySelection) {
            setActiveChart('monthly');
        }
    }, [timeGranularity, manualGranularitySelection]);

    // Auto-seleccionar granularidad inteligente basada en densidad de datos
    // SOLO cuando el usuario NO ha hecho selección manual
    useEffect(() => {
        // Skip auto-selection if user has manually chosen granularity
        if (manualGranularitySelection || !data || data.length === 0) return;
        
        // Obtener todas las fechas válidas de los datos
        const validDates = data
            .map(item => item.FECHA_ISO || item.FECHA || '')
            .filter(date => date && date !== '-' && date.trim() !== '')
            .map(date => new Date(date))
            .filter(date => !isNaN(date.getTime()))
            .sort();
            
        if (validDates.length === 0) return;
        
        // Calcular el rango temporal real de los datos
        const earliest = validDates[0];
        const latest = validDates[validDates.length - 1];
        const totalDays = Math.max(1, Math.round((latest - earliest) / (1000 * 60 * 60 * 24)) + 1);
        
        // Calcular densidad: registros por día
        const density = data.length / totalDays;
        
        // Lógica inteligente de granularidad basada en densidad y rango
        let nextGranularity;
        if (totalDays <= 7 || density >= 2) {
            // Pocos días O alta densidad -> mostrar por día
            nextGranularity = 'day';
        } else if (totalDays <= 60 || density >= 0.5) {
            // Rango medio O densidad media -> mostrar por semana
            nextGranularity = 'week';
        } else {
            // Rango largo Y baja densidad -> mostrar por mes
            nextGranularity = 'month';
        }
        
        // Solo cambiar si hay una mejora significativa
        if (nextGranularity !== timeGranularity) {
            setTimeGranularity(nextGranularity);
        }
    }, [data, timeGranularity, manualGranularitySelection]);

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
        // ISO week number with year to avoid confusion between years
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        // Include year to ensure chronological sorting and avoid confusion
        return `${date.getUTCFullYear()}-SEM-${String(weekNo).padStart(2, '0')}`;
    };

    const buildTimeSeries = (granularity) => {
        // Prefer FECHA_ISO (yyyy-mm-dd) when present to avoid inconsistent Date parsing
        const map = data.reduce((acc, item) => {
            const raw = item.FECHA_ISO || item.FECHA || '';
            if (!raw || raw === '-' || raw.trim() === '') return acc; // Skip empty/invalid dates
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

        // CRUCIAL: Solo incluir períodos que tienen datos reales (> 0)
        const sortedKeys = Object.keys(map)
            .filter(key => map[key] > 0) // Solo períodos con datos reales
            .sort();
        
        // Debug logging para verificar filtrado de períodos vacíos
        if (Math.random() < 0.1) { // 10% de las veces para no saturar la consola
            console.log(`📊 buildTimeSeries [${categoryName}] ${granularity}:`, {
                totalRecords: data.length,
                periodsWithData: sortedKeys.length,
                periods: sortedKeys,
                periodCounts: sortedKeys.map(k => `${k}:${map[k]}`).slice(0, 5) // primeros 5
            });
        }

        // Si no hay datos válidos, retornar estructura vacía
        if (sortedKeys.length === 0) {
            return {
                labels: [],
                datasets: [{
                    label: `${categoryName} - ${granularity}`,
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            };
        }

        // Check if all data is from the same year for smart date formatting
        const years = sortedKeys.map(k => {
            if (granularity === 'day' || granularity === 'month') {
                return k.split('-')[0];
            } else if (granularity === 'week') {
                // k format is now "YYYY-SEM-##"
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
                // k format is now "YYYY-SEM-##", format nicely
                const [year, , weekNum] = k.split('-');
                return sameYear ? `S${weekNum}` : `${year} S${weekNum}`;
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

    // Si está en modo compacto, mostrar solo el gráfico específico
    if (compactMode) {
        if (activeChart === 'monthly') {
            return (
                <div className="h-full">
                    {/* Header combinado: título Tendencia + botones */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-700">Tendencia</div>
                        <div className="flex justify-end gap-1">
                            <button className={`px-2 py-0.5 text-xs rounded ${timeGranularity === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => { setTimeGranularity('month'); setManualGranularitySelection(true); }}>Mes</button>
                            <button className={`px-2 py-0.5 text-xs rounded ${timeGranularity === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => { setTimeGranularity('week'); setManualGranularitySelection(true); }}>Semana</button>
                            <button className={`px-2 py-0.5 text-xs rounded ${timeGranularity === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => { setTimeGranularity('day'); setManualGranularitySelection(true); }}>Día</button>
                        </div>
                    </div>
                    <BaseChart
                        type="line"
                        data={buildTimeSeries(timeGranularity)}
                        title={null}
                        granularity={timeGranularity}
                        onGranularityChange={setTimeGranularity}
                        chartKey={`trend-${timeGranularity}`}
                        height={220}
                    />
                </div>
            );
        }

        if (activeChart === 'province' || activeChart === 'department') {
            const isDept = activeChart === 'department';
            const dataForChart = isDept ? chartData.byDepartment : chartData.byProvince;
            return (
                <div className="h-full">
                    {/* Toggle compacto Provincia/Departamento */}
                    <div className="flex justify-end gap-1 mb-2">
                        <button className={`px-2 py-0.5 text-xs rounded ${!isDept ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setActiveChart('province')}>Provincia</button>
                        <button className={`px-2 py-0.5 text-xs rounded ${isDept ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setActiveChart('department')}>Departamento</button>
                    </div>
                    <BaseChart
                        type="bar"
                        data={dataForChart}
                        title={null}
                        height={220}
                    />
                </div>
            );
        }
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
                        onClick={() => { setTimeGranularity('month'); setManualGranularitySelection(true); setActiveChart('monthly'); }}
                    >
                        Mes
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${timeGranularity === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => { setTimeGranularity('week'); setManualGranularitySelection(true); setActiveChart('monthly'); }}
                    >Semana</button>
                    <button
                        className={`px-3 py-1 rounded ${timeGranularity === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => { setTimeGranularity('day'); setManualGranularitySelection(true); setActiveChart('monthly'); }}
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
                                    granularity={timeGranularity}
                                    onGranularityChange={setTimeGranularity}
                                    chartKey={`trend-${timeGranularity}`}
                                    height={260}
                                />
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-md">
                                <div className="mb-2 text-sm font-semibold text-gray-700">Por {timeGranularity === 'month' ? 'Mes' : timeGranularity === 'week' ? 'Semana' : 'Día'} (Barras)</div>
                                <BaseChart
                                    key={`bars-${timeGranularity}`}
                                    type="bar"
                                    data={buildTimeSeries(timeGranularity)}
                                    title={null}
                                    height={260}
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
                                            height={260}
                                        />
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow-md">
                                        <div className="mb-2 text-sm font-semibold text-gray-700">Por Departamento (Barras)</div>
                                        <BaseChart
                                            type="bar"
                                            data={chartData.byDepartment}
                                            title={null}
                                            caption="Departamento — Cantidad"
                                            height={260}
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
                                            height={260}
                                        />
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow-md">
                                        <div className="mb-2 text-sm font-semibold text-gray-700">Por Provincia (Barras)</div>
                                        <BaseChart
                                            type="bar"
                                            data={chartData.byProvince}
                                            title={null}
                                            caption="Provincia — Cantidad"
                                            height={260}
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