import React from 'react';
import { Grid } from '@mui/material';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import ChartCard from '../../common/ChartCard';

const AfectadosCharts = ({ analysis }) => {
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
                    title="Distribución de Recursos"
                    subtitle="Tipos de recursos desplegados"
                >
                    <Doughnut 
                        data={{
                            labels: ['Efectivos', 'Vehículos', 'Scanners', 'Embarcaciones', 'Motos', 'Caballos', 'Canes'],
                            datasets: [{
                                data: [
                                    analysis.distribucionRecursos?.efectivos || 0,
                                    analysis.distribucionRecursos?.vehiculos || 0,
                                    analysis.distribucionRecursos?.scanners || 0,
                                    analysis.distribucionRecursos?.embarcaciones || 0,
                                    analysis.distribucionRecursos?.motos || 0,
                                    analysis.distribucionRecursos?.caballos || 0,
                                    analysis.distribucionRecursos?.canes || 0
                                ],
                                backgroundColor: [
                                    '#1976d2', '#2e7d32', '#ed6c02', 
                                    '#9c27b0', '#d32f2f', '#795548', '#607d8b'
                                ],
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
                    title="Efectivos por Provincia"
                    subtitle="Distribución geográfica del personal"
                >
                    <Bar 
                        data={{
                            labels: analysis.efectivosPorProvincia?.slice(0, 8).map(item => item.provincia) || [],
                            datasets: [{
                                label: 'Efectivos Desplegados',
                                data: analysis.efectivosPorProvincia?.slice(0, 8).map(item => item.cantidad) || [],
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
                    title="Tendencia Mensual de Despliegue"
                    subtitle="Evolución del personal afectado"
                >
                    <Bar 
                        data={{
                            labels: analysis.tendenciaMensual?.map(item => item.mes) || [],
                            datasets: [{
                                label: 'Efectivos Mensuales',
                                data: analysis.tendenciaMensual?.map(item => item.efectivos) || [],
                                backgroundColor: 'rgba(46, 125, 50, 0.6)',
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
                    title="Eficiencia Operativa"
                    subtitle="Relación recursos vs resultados"
                >
                    <Radar 
                        data={{
                            labels: ['Efectivos', 'Vehículos', 'Equipos', 'Resultados', 'Cobertura', 'Tiempo'],
                            datasets: [{
                                label: 'Eficiencia',
                                data: [
                                    analysis.eficiencia?.efectivos || 0,
                                    analysis.eficiencia?.vehiculos || 0,
                                    analysis.eficiencia?.equipos || 0,
                                    analysis.eficiencia?.resultados || 0,
                                    analysis.eficiencia?.cobertura || 0,
                                    analysis.eficiencia?.tiempo || 0
                                ],
                                backgroundColor: 'rgba(237, 108, 2, 0.2)',
                                borderColor: 'rgba(237, 108, 2, 1)',
                                borderWidth: 2,
                                pointBackgroundColor: 'rgba(237, 108, 2, 1)',
                            }]
                        }} 
                        options={{
                            ...chartOptions,
                            scales: {
                                r: {
                                    beginAtZero: true,
                                    max: 100
                                }
                            }
                        }} 
                    />
                </ChartCard>
            </Grid>
        </Grid>
    );
};

export default AfectadosCharts;
