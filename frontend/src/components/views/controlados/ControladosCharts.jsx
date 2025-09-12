import React from 'react';
import { Grid } from '@mui/material';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import ChartCard from '../../common/ChartCard';

const ControladosCharts = ({ analysis }) => {
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
                    title="Controles por Provincia"
                    subtitle="Distribución geográfica de controles"
                >
                    <Bar 
                        data={{
                            labels: analysis.controlesPorProvincia?.slice(0, 8).map(item => item.provincia) || [],
                            datasets: [
                                {
                                    label: 'Vehículos',
                                    data: analysis.controlesPorProvincia?.slice(0, 8).map(item => item.vehiculos) || [],
                                    backgroundColor: 'rgba(25, 118, 210, 0.8)',
                                    borderColor: 'rgba(25, 118, 210, 1)',
                                    borderWidth: 1,
                                },
                                {
                                    label: 'Personas',
                                    data: analysis.controlesPorProvincia?.slice(0, 8).map(item => item.personas) || [],
                                    backgroundColor: 'rgba(46, 125, 50, 0.8)',
                                    borderColor: 'rgba(46, 125, 50, 1)',
                                    borderWidth: 1,
                                }
                            ]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Tipos de Control"
                    subtitle="Distribución por tipo de control realizado"
                >
                    <Doughnut 
                        data={{
                            labels: ['Vehículos', 'Personas', 'Averiguaciones'],
                            datasets: [{
                                data: [
                                    analysis.distribucionControles?.vehiculos || 0,
                                    analysis.distribucionControles?.personas || 0,
                                    analysis.distribucionControles?.averiguaciones || 0
                                ],
                                backgroundColor: ['#1976d2', '#2e7d32', '#ed6c02'],
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
                    title="Tendencia Mensual"
                    subtitle="Evolución de controles en el tiempo"
                >
                    <Line 
                        data={{
                            labels: analysis.tendenciaMensual?.map(item => item.mes) || [],
                            datasets: [
                                {
                                    label: 'Vehículos Controlados',
                                    data: analysis.tendenciaMensual?.map(item => item.vehiculos) || [],
                                    borderColor: 'rgba(25, 118, 210, 1)',
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    tension: 0.4,
                                },
                                {
                                    label: 'Personas Controladas',
                                    data: analysis.tendenciaMensual?.map(item => item.personas) || [],
                                    borderColor: 'rgba(46, 125, 50, 1)',
                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                    tension: 0.4,
                                }
                            ]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ChartCard
                    title="Efectividad por Departamento"
                    subtitle="Tasa de éxito en controles por departamento"
                >
                    <Bar 
                        data={{
                            labels: analysis.efectividadPorDepartamento?.slice(0, 6).map(item => item.departamento) || [],
                            datasets: [{
                                label: 'Tasa de Efectividad (%)',
                                data: analysis.efectividadPorDepartamento?.slice(0, 6).map(item => item.efectividad) || [],
                                backgroundColor: 'rgba(237, 108, 2, 0.8)',
                                borderColor: 'rgba(237, 108, 2, 1)',
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

export default ControladosCharts;
