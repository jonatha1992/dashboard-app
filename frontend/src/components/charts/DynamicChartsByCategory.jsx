import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import { useDashboard } from '../../contexts/DashboardContext';
import { normalizeProvinceKey, getDepartamentoFromItem } from '../../utils/dataUtils';
import ChartCard from '../common/ChartCard';

const NoChartDataMessage = ({ message }) => (
    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-dark-600 bg-dark-700/40 px-4 text-center text-sm text-gray-400">
        {message}
    </div>
);

const DynamicChartsByCategory = ({ category }) => {
    const { filteredCategorizedData } = useDashboard();

    const categoryData = useMemo(() => {
        if (!filteredCategorizedData || !category) return [];
        return filteredCategorizedData[category] || [];
    }, [filteredCategorizedData, category]);

    const readableCategory = useMemo(() => {
        if (!category) return 'Categoria';
        return category.charAt(0).toUpperCase() + category.slice(1);
    }, [category]);

    // Configuración base para gráficos (ahora se maneja en BaseChart)
    const baseChartOptions = {
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                }
            },
            y: {
                beginAtZero: true,
            }
        }
    };

    // Gráfico de distribución por provincia
    const provinceChart = useMemo(() => {
        if (!categoryData.length) return null;

        const provinceCount = {};
        categoryData.forEach(item => {
            const province = normalizeProvinceKey(
                item.PROVINCIA || item.provincia || 'Sin especificar'
            );
            provinceCount[province] = (provinceCount[province] || 0) + 1;
        });

        const sortedProvinces = Object.entries(provinceCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        return {
            labels: sortedProvinces.map(([province]) => province),
            datasets: [{
                label: `${category} por Provincia`,
                data: sortedProvinces.map(([,count]) => count),
                backgroundColor: 'rgba(25, 118, 210, 0.8)',
                borderColor: 'rgba(25, 118, 210, 1)',
                borderWidth: 1,
            }]
        };
    }, [categoryData]);

    // Gráfico de distribución por departamento
    const departmentChart = useMemo(() => {
        if (!categoryData.length) return null;

        const deptCount = {};
        categoryData.forEach(item => {
            const dept = getDepartamentoFromItem(item) || 'Sin especificar';
            if (dept !== 'Sin especificar') {
                deptCount[dept] = (deptCount[dept] || 0) + 1;
            }
        });

        const sortedDepts = Object.entries(deptCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        if (sortedDepts.length === 0) return null;

        return {
            labels: sortedDepts.map(([dept]) => dept),
            datasets: [{
                label: `${category} por Departamento`,
                data: sortedDepts.map(([,count]) => count),
                backgroundColor: 'rgba(46, 125, 50, 0.8)',
                borderColor: 'rgba(46, 125, 50, 1)',
                borderWidth: 1,
            }]
        };
    }, [categoryData, category]);

    // Gráfico de tendencia mensual
    const monthlyTrendChart = useMemo(() => {
        if (!categoryData.length) return null;

        const monthlyCount = {};
        categoryData.forEach(item => {
            const fecha = item.FECHA || item.fecha || item.FECHA_ISO || item.fecha_iso;
            if (fecha) {
                try {
                    const date = new Date(fecha);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
                } catch {
                    // Fecha inválida, ignorar
                }
            }
        });

        const sortedMonths = Object.entries(monthlyCount)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12); // Últimos 12 meses

        if (sortedMonths.length === 0) return null;

        return {
            labels: sortedMonths.map(([month]) => {
                const [year, monthNum] = month.split('-');
                const date = new Date(year, monthNum - 1);
                return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
            }),
            datasets: [{
                label: `${category} por Mes`,
                data: sortedMonths.map(([,count]) => count),
                borderColor: 'rgba(237, 108, 2, 1)',
                backgroundColor: 'rgba(237, 108, 2, 0.1)',
                tension: 0.4,
                fill: true,
            }]
        };
    }, [categoryData, category]);

    // Gráfico de distribución por unidad
    const unitChart = useMemo(() => {
        if (!categoryData.length) return null;

        const unitCount = {};
        categoryData.forEach(item => {
            const unit = item.UNIDAD_INTERVINIENTE || 
                        item.unidad_interviniente || 
                        item.UNIDAD || 
                        item.FUERZA_INTERVINIENTE || 
                        'Sin especificar';
            if (unit !== 'Sin especificar') {
                unitCount[unit] = (unitCount[unit] || 0) + 1;
            }
        });

        const sortedUnits = Object.entries(unitCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        if (sortedUnits.length === 0) return null;

        return {
            labels: sortedUnits.map(([unit]) => unit),
            datasets: [{
                data: sortedUnits.map(([,count]) => count),
                backgroundColor: [
                    '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#795548'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };
    }, [categoryData, category]);

    // Mostrar mensaje si no hay datos
    if (!categoryData.length) {
        return (
            <div className="p-8 text-center">
                <h6 className="text-lg font-semibold text-gray-400 mb-2">
                    No hay datos disponibles para {category}
                </h6>
                <p className="text-sm text-gray-500">
                    Intenta ajustar los filtros o verifica que haya datos cargados
                </p>
            </div>
        );
    }


    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Grafico de Provincias */}
            <div>
                <ChartCard
                    title={`${readableCategory} por Provincia`}
                    subtitle={`Distribucion geografica de ${categoryData.length} registros`}
                >
                    {provinceChart ? (
                        <BaseChart
                            type="bar"
                            data={provinceChart}
                            options={baseChartOptions}
                            title={`${readableCategory} por Provincia`}
                            height={220}
                        />
                    ) : (
                        <NoChartDataMessage
                            message={`No hay datos de ${readableCategory.toLowerCase()} por provincia para los filtros aplicados.`}
                        />
                    )}
                </ChartCard>
            </div>

            {/* Grafico de Departamentos */}
            <div>
                <ChartCard
                    title={`${readableCategory} por Departamento`}
                    subtitle="Top departamentos con mas actividad"
                >
                    {departmentChart ? (
                        <BaseChart
                            type="bar"
                            data={departmentChart}
                            options={baseChartOptions}
                            title={`${readableCategory} por Departamento`}
                            height={220}
                        />
                    ) : (
                        <NoChartDataMessage
                            message={`No hay datos de ${readableCategory.toLowerCase()} por departamento para los filtros aplicados.`}
                        />
                    )}
                </ChartCard>
            </div>

            {/* Tendencia Mensual */}
            <div>
                <ChartCard
                    title={`Tendencia Mensual - ${readableCategory}`}
                    subtitle="Evolucion temporal de la actividad"
                >
                    {monthlyTrendChart ? (
                        <BaseChart
                            type="line"
                            data={monthlyTrendChart}
                            options={baseChartOptions}
                            title={`Tendencia Mensual - ${readableCategory}`}
                            height={220}
                        />
                    ) : (
                        <NoChartDataMessage
                            message={`No hay datos temporales recientes para ${readableCategory.toLowerCase()} con los filtros seleccionados.`}
                        />
                    )}
                </ChartCard>
            </div>

            {/* Distribucion por Unidad */}
            <div>
                <ChartCard
                    title={`${readableCategory} por Unidad`}
                    subtitle="Distribucion por fuerza interviniente"
                >
                    {unitChart ? (
                        <BaseChart
                            type="pie"
                            data={unitChart}
                            options={baseChartOptions}
                            title={`${readableCategory} por Unidad`}
                            height={220}
                        />
                    ) : (
                        <NoChartDataMessage
                            message={`No hay datos de ${readableCategory.toLowerCase()} por unidad para los filtros aplicados.`}
                        />
                    )}
                </ChartCard>
            </div>
        </div>
    );

};

export default DynamicChartsByCategory;

