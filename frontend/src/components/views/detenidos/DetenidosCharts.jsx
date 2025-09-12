import React from 'react';
import { Grid } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import ChartCard from '../../common/ChartCard';

const DetenidosCharts = ({ analysis }) => {
    if (!analysis) return null;

    // Configuraciones de gráficos
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
                    title="Delitos Más Comunes"
                    subtitle="Top 8 tipos de delitos en detenciones"
                >
                    <Bar 
                        data={{
                            labels: analysis.delitosMasComunes?.slice(0, 8).map(item => item.delito) || [],
                            datasets: [{
                                label: 'Cantidad de Casos',
                                data: analysis.delitosMasComunes?.slice(0, 8).map(item => item.cantidad) || [],
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
                    title="Distribución por Sexo"
                    subtitle="Proporción demográfica de detenidos"
                >
                    <Doughnut 
                        data={{
                            labels: ['Masculino', 'Femenino', 'No especificado'],
                            datasets: [{
                                data: [
                                    analysis.distribucionSexo?.masculino || 0,
                                    analysis.distribucionSexo?.femenino || 0,
                                    analysis.distribucionSexo?.no_especificado || 0
                                ],
                                backgroundColor: ['#1976d2', '#e91e63', '#757575'],
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
                    title="Distribución por Edad"
                    subtitle="Rangos etarios de personas detenidas"
                >
                    <Bar 
                        data={{
                            labels: ['18-25', '26-35', '36-45', '46-55', '56+'],
                            datasets: [{
                                label: 'Cantidad',
                                data: [
                                    analysis.distribucionEdad?.['18-25'] || 0,
                                    analysis.distribucionEdad?.['26-35'] || 0,
                                    analysis.distribucionEdad?.['36-45'] || 0,
                                    analysis.distribucionEdad?.['46-55'] || 0,
                                    analysis.distribucionEdad?.['56+'] || 0
                                ],
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
                    title="Tendencia Mensual"
                    subtitle="Evolución de detenciones en el tiempo"
                >
                    <Bar 
                        data={{
                            labels: analysis.tendenciaMensual?.map(item => item.mes) || [],
                            datasets: [{
                                label: 'Detenciones Mensuales',
                                data: analysis.tendenciaMensual?.map(item => item.cantidad) || [],
                                backgroundColor: 'rgba(211, 47, 47, 0.6)',
                                borderColor: 'rgba(211, 47, 47, 1)',
                                borderWidth: 1,
                            }]
                        }} 
                        options={chartOptions} 
                    />
                </ChartCard>
            </Grid>
        </Grid>
    );
};

export default DetenidosCharts;
