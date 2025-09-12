import React from 'react';
import { Grid } from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import ChartCard from '../../common/ChartCard';

const ProcedimientosCharts = ({ analysis }) => {
    if (!analysis) return null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Tipos de Procedimientos"
                    subtitle="Distribución por categoría operativa"
                >
                    <Bar 
                        data={{
                            labels: analysis.tiposProcedimientos?.slice(0, 8).map(item => item.tipo) || [],
                            datasets: [{
                                label: 'Cantidad de Procedimientos',
                                data: analysis.tiposProcedimientos?.slice(0, 8).map(item => item.cantidad) || [],
                                backgroundColor: 'rgba(25, 118, 210, 0.8)',
                                borderColor: 'rgba(25, 118, 210, 1)',
                                borderWidth: 1,
                            }]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>
            
            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Estado de Procedimientos"
                    subtitle="Distribución por estado actual"
                >
                    <Doughnut 
                        data={{
                            labels: ['Completados', 'En Proceso', 'Pendientes', 'Cancelados'],
                            datasets: [{
                                data: [
                                    analysis.estadoProcedimientos?.completados || 0,
                                    analysis.estadoProcedimientos?.en_proceso || 0,
                                    analysis.estadoProcedimientos?.pendientes || 0,
                                    analysis.estadoProcedimientos?.cancelados || 0
                                ],
                                backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336'],
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Procedimientos por Provincia"
                    subtitle="Distribución geográfica de operaciones"
                >
                    <Bar 
                        data={{
                            labels: analysis.procedimientosPorProvincia?.slice(0, 8).map(item => item.provincia) || [],
                            datasets: [{
                                label: 'Procedimientos',
                                data: analysis.procedimientosPorProvincia?.slice(0, 8).map(item => item.cantidad) || [],
                                backgroundColor: 'rgba(46, 125, 50, 0.8)',
                                borderColor: 'rgba(46, 125, 50, 1)',
                                borderWidth: 1,
                            }]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Tendencia Mensual"
                    subtitle="Evolución de procedimientos en el tiempo"
                >
                    <Line 
                        data={{
                            labels: analysis.tendenciaMensual?.map(item => item.mes) || [],
                            datasets: [{
                                label: 'Procedimientos Mensuales',
                                data: analysis.tendenciaMensual?.map(item => item.cantidad) || [],
                                borderColor: 'rgba(25, 118, 210, 1)',
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                tension: 0.4,
                                fill: true,
                            }]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Duración de Procedimientos"
                    subtitle="Tiempo de procesamiento por rango"
                >
                    <Bar 
                        data={{
                            labels: ['1-7 días', '8-30 días', '31-90 días', '90+ días'],
                            datasets: [{
                                label: 'Cantidad',
                                data: [
                                    analysis.duracionProcedimientos?.['1-7 días'] || 0,
                                    analysis.duracionProcedimientos?.['8-30 días'] || 0,
                                    analysis.duracionProcedimientos?.['31-90 días'] || 0,
                                    analysis.duracionProcedimientos?.['90+ días'] || 0
                                ],
                                backgroundColor: 'rgba(237, 108, 2, 0.8)',
                                borderColor: 'rgba(237, 108, 2, 1)',
                                borderWidth: 1,
                            }]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Eficiencia por Unidad"
                    subtitle="Rendimiento operativo por departamento"
                >
                    <Bar 
                        data={{
                            labels: analysis.eficienciaPorUnidad?.slice(0, 6).map(item => item.unidad) || [],
                            datasets: [{
                                label: 'Eficiencia (%)',
                                data: analysis.eficienciaPorUnidad?.slice(0, 6).map(item => item.eficiencia) || [],
                                backgroundColor: 'rgba(156, 39, 176, 0.8)',
                                borderColor: 'rgba(156, 39, 176, 1)',
                                borderWidth: 1,
                            }]
                        }} 
                        options={{
                            ...chartOptions,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
                                    ticks: {
                                        callback: function(value) {
                                            return value + '%';
                                        }
                                    }
                                }
                            }
                        }} 
                    />
                </ChartCard>
            </Grid>
        </Grid>
    );
};

export default ProcedimientosCharts;
