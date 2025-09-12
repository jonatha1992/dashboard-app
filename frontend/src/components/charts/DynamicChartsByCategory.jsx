import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import { abbreviateName } from '../../utils/chartUtils';
import { useDashboard } from '../../contexts/DashboardContext';
import { normalizeProvinceKey, getDepartamentoFromItem } from '../../utils/dataUtils';
import ChartCard from '../common/ChartCard';

const DynamicChartsByCategory = ({ category }) => {
    const { filteredCategorizedData } = useDashboard();

    const categoryData = useMemo(() => {
        if (!filteredCategorizedData || !category) return [];
        return filteredCategorizedData[category] || [];
    }, [filteredCategorizedData, category]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Provincias */}
            {provinceChart && (
                <div>
                    <ChartCard
                        title={`${category} por Provincia`}
                        subtitle={`Distribución geográfica de ${categoryData.length} registros`}
                    >
                        <BaseChart
                            type="bar"
                            data={provinceChart}
                            options={baseChartOptions}
                            title={`${category} por Provincia`}
                            height={300}
                        />
                    </ChartCard>
                </div>
            )}

            {/* Gráfico de Departamentos */}
            {departmentChart && (
                <div>
                    <ChartCard
                        title={`${category} por Departamento`}
                        subtitle="Top departamentos con más actividad"
                    >
                        <BaseChart
                            type="bar"
                            data={departmentChart}
                            options={baseChartOptions}
                            title={`${category} por Departamento`}
                            height={300}
                        />
                    </ChartCard>
                </div>
            )}

            {/* Tendencia Mensual */}
            {monthlyTrendChart && (
                <div>
                    <ChartCard
                        title={`Tendencia Mensual - ${category}`}
                        subtitle="Evolución temporal de la actividad"
                    >
                        <BaseChart
                            type="line"
                            data={monthlyTrendChart}
                            options={baseChartOptions}
                            title={`Tendencia Mensual - ${category}`}
                            height={300}
                        />
                    </ChartCard>
                </div>
            )}

            {/* Distribución por Unidad */}
            {unitChart && (
                <div>
                    <ChartCard
                        title={`${category} por Unidad`}
                        subtitle="Distribución por fuerza interviniente"
                    >
                        <BaseChart
                            type="pie"
                            data={unitChart}
                            options={baseChartOptions}
                            title={`${category} por Unidad`}
                            height={300}
                        />
                    </ChartCard>
                </div>
            )}
        </div>
    );
};

export default DynamicChartsByCategory;