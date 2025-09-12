import React, { useMemo } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useDashboard } from '../../contexts/DashboardContext';
import { normalizeProvinceKey, getDepartamentoFromItem } from '../../utils/dataUtils';
import ChartCard from '../common/ChartCard';

const DynamicChartsByCategory = ({ category }) => {
    const { filteredCategorizedData } = useDashboard();

    const categoryData = useMemo(() => {
        if (!filteredCategorizedData || !category) return [];
        return filteredCategorizedData[category] || [];
    }, [filteredCategorizedData, category]);

    // Configuración base para gráficos
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
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
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                    No hay datos disponibles para {category}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Intenta ajustar los filtros o verifica que haya datos cargados
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {/* Gráfico de Provincias */}
            {provinceChart && (
                <Grid item xs={12} lg={6}>
                    <ChartCard
                        title={`${category} por Provincia`}
                        subtitle={`Distribución geográfica de ${categoryData.length} registros`}
                    >
                        <Bar data={provinceChart} options={chartOptions} />
                    </ChartCard>
                </Grid>
            )}

            {/* Gráfico de Departamentos */}
            {departmentChart && (
                <Grid item xs={12} lg={6}>
                    <ChartCard
                        title={`${category} por Departamento`}
                        subtitle="Top departamentos con más actividad"
                    >
                        <Bar data={departmentChart} options={chartOptions} />
                    </ChartCard>
                </Grid>
            )}

            {/* Tendencia Mensual */}
            {monthlyTrendChart && (
                <Grid item xs={12} lg={6}>
                    <ChartCard
                        title={`Tendencia Mensual - ${category}`}
                        subtitle="Evolución temporal de la actividad"
                    >
                        <Line data={monthlyTrendChart} options={chartOptions} />
                    </ChartCard>
                </Grid>
            )}

            {/* Distribución por Unidad */}
            {unitChart && (
                <Grid item xs={12} lg={6}>
                    <ChartCard
                        title={`${category} por Unidad`}
                        subtitle="Distribución por fuerza interviniente"
                    >
                        <Doughnut data={unitChart} options={chartOptions} />
                    </ChartCard>
                </Grid>
            )}
        </Grid>
    );
};

export default DynamicChartsByCategory;