import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper } from '@mui/material';
import analyticsService from '../../../services/analyticsService';

const DetenidosChart = ({ data, variant = 'bars' }) => {
    const analysis = useMemo(() => {
        return analyticsService.analyzeDetenidos(data);
    }, [data]);

    // Configuración común de colores
    const colors = {
        primary: '#1976d2',
        secondary: '#dc004e',
        success: '#2e7d32',
        warning: '#ed6c02',
        info: '#0288d1',
        danger: '#d32f2f'
    };

    // Datos para gráfico de barras por provincia
    const barData = useMemo(() => {
        const provincias = Object.entries(analysis.porProvincia)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            labels: provincias.map(([provincia]) => provincia.replace('_', ' ')),
            datasets: [{
                label: 'Detenidos',
                data: provincias.map(([, count]) => count),
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                borderWidth: 1
            }]
        };
    }, [analysis.porProvincia]);

    // Datos para gráfico de dona por sexo
    const doughnutData = useMemo(() => {
        const sexoData = analysis.porSexo;
        return {
            labels: Object.keys(sexoData),
            datasets: [{
                data: Object.values(sexoData),
                backgroundColor: [colors.primary, colors.secondary, colors.info],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }, [analysis.porSexo]);

    // Datos para gráfico de línea temporal
    const lineData = useMemo(() => {
        const meses = Object.entries(analysis.porMes).sort();
        return {
            labels: meses.map(([mes]) => {
                const date = new Date(mes + '-01');
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Detenidos por mes',
                data: meses.map(([, count]) => count),
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                fill: true,
                tension: 0.4
            }]
        };
    }, [analysis.porMes]);

    // Configuraciones de Chart.js
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                bottom: 40,
                left: 10,
                right: 10
            }
        },
        plugins: {
            legend: {
                position: 'top',
                display: true,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Categoría',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    padding: { top: 10 }
                },
                ticks: {
                    display: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                        size: 10
                    },
                    color: '#666666'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Cantidad',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                },
                ticks: {
                    beginAtZero: true
                }
            }
        }
    };

    const barOptions = {
        ...commonOptions,
        scales: {
            x: {
                display: true,
                ticks: {
                    display: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                        size: 10
                    },
                    color: '#666666'
                },
                grid: {
                    display: false
                }
            },
            y: {
                display: true,
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 10
                    },
                    color: '#666666'
                },
                grid: {
                    display: true,
                    color: 'rgba(0,0,0,0.1)'
                }
            }
        }
    };

    const doughnutOptions = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            legend: {
                position: 'right',
                display: true,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 11
                    },
                    generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const dataset = data.datasets[0];
                                const backgroundColor = dataset.backgroundColor[i];
                                return {
                                    text: label,
                                    fillStyle: backgroundColor,
                                    strokeStyle: backgroundColor,
                                    lineWidth: 0,
                                    pointStyle: 'circle',
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            }
        }
    };

    // KPIs Component
    const KPICard = ({ title, value, subtitle, color = colors.primary }) => (
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Paper>
    );

    if (variant === 'kpis') {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Total Detenidos"
                        value={analysis.total}
                        subtitle="Período completo"
                        color={colors.primary}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Edad Promedio"
                        value={`${analysis.kpis.promedioEdad} años`}
                        subtitle="De los detenidos"
                        color={colors.info}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Menores"
                        value={`${analysis.kpis.porcentajeMenores}%`}
                        subtitle="Menores de 18 años"
                        color={colors.warning}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Extranjeros"
                        value={`${analysis.kpis.porcentajeExtranjeros}%`}
                        subtitle="Nacionalidad extranjera"
                        color={colors.secondary}
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'doughnut') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Detenidos por Sexo
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                </Box>
            </Box>
        );
    }

    if (variant === 'line') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Tendencia Temporal de Detenciones
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Line data={lineData} options={commonOptions} />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Tendencia: {analysis.tendencia.trend === 'increasing' ? '📈' : 
                                   analysis.tendencia.trend === 'decreasing' ? '📉' : '➡️'} 
                        {' '}{analysis.tendencia.change}% vs período anterior
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Variant 'bars' (default)
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Detenidos por Provincia (Top 10)
            </Typography>
            <Box sx={{ height: 300, position: 'relative' }}>
                <Bar data={barData} options={barOptions} />
            </Box>
        </Box>
    );
};

export default DetenidosChart;