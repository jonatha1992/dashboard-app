import React from 'react';
import { Grid } from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import ChartCard from '../../common/ChartCard';

const IncautacionesCharts = ({ analysis }) => {
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
                    title="Tipos de Incautaciones"
                    subtitle="Clasificación por tipo de bien incautado"
                >
                    <Bar 
                        data={{
                            labels: analysis.tiposIncautaciones?.slice(0, 8).map(item => item.tipo) || [],
                            datasets: [{
                                label: 'Cantidad de Incautaciones',
                                data: analysis.tiposIncautaciones?.slice(0, 8).map(item => item.cantidad) || [],
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
                    title="Distribución por Valor"
                    subtitle="Rangos de valor monetario"
                >
                    <Doughnut 
                        data={{
                            labels: ['Bajo (<$1k)', 'Medio ($1k-$10k)', 'Alto ($10k-$100k)', 'Muy Alto (>$100k)'],
                            datasets: [{
                                data: [
                                    analysis.distribucionValor?.bajo || 0,
                                    analysis.distribucionValor?.medio || 0,
                                    analysis.distribucionValor?.alto || 0,
                                    analysis.distribucionValor?.muy_alto || 0
                                ],
                                backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#9c27b0'],
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
                    title="Incautaciones por Provincia"
                    subtitle="Distribución geográfica"
                >
                    <Bar 
                        data={{
                            labels: analysis.incautacionesPorProvincia?.slice(0, 8).map(item => item.provincia) || [],
                            datasets: [{
                                label: 'Incautaciones',
                                data: analysis.incautacionesPorProvincia?.slice(0, 8).map(item => item.cantidad) || [],
                                backgroundColor: 'rgba(211, 47, 47, 0.8)',
                                borderColor: 'rgba(211, 47, 47, 1)',
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
                    subtitle="Evolución temporal de incautaciones"
                >
                    <Line 
                        data={{
                            labels: analysis.tendenciaMensual?.map(item => item.mes) || [],
                            datasets: [
                                {
                                    label: 'Cantidad',
                                    data: analysis.tendenciaMensual?.map(item => item.cantidad) || [],
                                    borderColor: 'rgba(237, 108, 2, 1)',
                                    backgroundColor: 'rgba(237, 108, 2, 0.1)',
                                    tension: 0.4,
                                    yAxisID: 'y',
                                },
                                {
                                    label: 'Valor ($)',
                                    data: analysis.tendenciaMensual?.map(item => item.valor) || [],
                                    borderColor: 'rgba(46, 125, 50, 1)',
                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                    tension: 0.4,
                                    yAxisID: 'y1',
                                }
                            ]
                        }} 
                        options={{
                            ...chartOptions,
                            scales: {
                                y: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                },
                                y1: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    grid: {
                                        drawOnChartArea: false,
                                    },
                                },
                            }
                        }} 
                    />
                </ChartCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Top Incautaciones"
                    subtitle="Casos de mayor valor"
                >
                    <Bar 
                        data={{
                            labels: analysis.topIncautaciones?.slice(0, 5).map((item, index) => `Caso ${index + 1}`) || [],
                            datasets: [{
                                label: 'Valor ($)',
                                data: analysis.topIncautaciones?.slice(0, 5).map(item => item.valor) || [],
                                backgroundColor: 'rgba(156, 39, 176, 0.8)',
                                borderColor: 'rgba(156, 39, 176, 1)',
                                borderWidth: 1,
                            }]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Efectividad por Departamento"
                    subtitle="Tasa de éxito en incautaciones"
                >
                    <Bar 
                        data={{
                            labels: analysis.efectividadPorDepartamento?.slice(0, 6).map(item => item.departamento) || [],
                            datasets: [{
                                label: 'Efectividad (%)',
                                data: analysis.efectividadPorDepartamento?.slice(0, 6).map(item => item.efectividad) || [],
                                backgroundColor: 'rgba(25, 118, 210, 0.8)',
                                borderColor: 'rgba(25, 118, 210, 1)',
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

export default IncautacionesCharts;
