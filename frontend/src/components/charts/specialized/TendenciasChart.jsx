import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);
import { Box, Typography, Grid, Paper, Chip, Alert, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import analyticsService from '../../../services/analyticsService';

const TendenciasChart = ({ data, variant = 'multiline' }) => {
    const analysis = useMemo(() => {
        return analyticsService.generateTrendAnalysis(data);
    }, [data]);

    const colors = {
        detenidos: '#1976d2',     // Azul para detenidos
        incautaciones: '#4caf50', // Verde para incautaciones
        abatidos: '#f44336',      // Rojo para abatidos
        trata: '#9c27b0',         // Púrpura para trata
        operaciones: '#ff9800',   // Naranja para operaciones
        prediction: '#607d8b'     // Gris para predicciones
    };

    // Datos para líneas múltiples de tendencias
    const multiLineData = useMemo(() => {
        const meses = Object.keys(analysis.trends?.monthly || {}).sort().slice(-12); // Últimos 12 meses
        
        return {
            labels: meses.map(mes => {
                const date = new Date(mes + '-01');
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }),
            datasets: [
                {
                    label: 'Detenidos',
                    data: meses.map(mes => analysis.trends.monthly[mes]?.detenidos || 0),
                    borderColor: colors.detenidos,
                    backgroundColor: colors.detenidos + '20',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Incautaciones',
                    data: meses.map(mes => analysis.trends.monthly[mes]?.incautaciones || 0),
                    borderColor: colors.incautaciones,
                    backgroundColor: colors.incautaciones + '20',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Abatidos',
                    data: meses.map(mes => analysis.trends.monthly[mes]?.abatidos || 0),
                    borderColor: colors.abatidos,
                    backgroundColor: colors.abatidos + '20',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Trata',
                    data: meses.map(mes => analysis.trends.monthly[mes]?.trata || 0),
                    borderColor: colors.trata,
                    backgroundColor: colors.trata + '20',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    }, [analysis.trends]);

    // Datos para área apilada
    const areaData = useMemo(() => {
        const meses = Object.keys(analysis.trends?.monthly || {}).sort().slice(-12);
        
        return {
            labels: meses.map(mes => {
                const date = new Date(mes + '-01');
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }),
            datasets: [
                {
                    label: 'Detenidos',
                    data: meses.map(mes => analysis.trends.monthly[mes]?.detenidos || 0),
                    backgroundColor: colors.detenidos + '60',
                    borderColor: colors.detenidos,
                    borderWidth: 1,
                    fill: {
                        target: 'origin',
                        above: colors.detenidos + '60',
                    },
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                },
                {
                    label: 'Incautaciones',
                    data: meses.map(mes => analysis.trends.monthly[mes]?.incautaciones || 0),
                    backgroundColor: colors.incautaciones + '60',
                    borderColor: colors.incautaciones,
                    borderWidth: 1,
                    fill: {
                        target: 'origin',
                        above: colors.incautaciones + '60',
                    },
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                },
                {
                    label: 'Abatidos',
                    data: meses.map(mes => analysis.trends.monthly[mes]?.abatidos || 0),
                    backgroundColor: colors.abatidos + '60',
                    borderColor: colors.abatidos,
                    borderWidth: 1,
                    fill: {
                        target: 'origin',
                        above: colors.abatidos + '60',
                    },
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                },
                {
                    label: 'Trata',
                    data: meses.map(mes => analysis.trends.monthly[mes]?.trata || 0),
                    backgroundColor: colors.trata + '60',
                    borderColor: colors.trata,
                    borderWidth: 1,
                    fill: {
                        target: 'origin',
                        above: colors.trata + '60',
                    },
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }
            ]
        };
    }, [analysis.trends]);

    // Configuraciones
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                bottom: 60,
                left: 15,
                right: 15
            }
        },
        plugins: {
            legend: {
                position: 'top',
                display: true,
                labels: {
                    usePointStyle: true,
                    padding: 15,
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
                borderWidth: 1,
                mode: 'index',
                intersect: false
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        scales: {
            x: {
                display: true,
                ticks: {
                    display: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                        size: 11,
                        weight: 'normal'
                    },
                    color: '#444444',
                    padding: 5
                },
                grid: {
                    display: true,
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            y: {
                display: true,
                beginAtZero: true,
                ticks: {
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

    const areaOptions = {
        ...lineOptions,
        plugins: {
            ...lineOptions.plugins,
            tooltip: {
                ...lineOptions.plugins.tooltip,
                mode: 'index',
                intersect: false
            },
            filler: {
                propagate: true
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        scales: {
            ...lineOptions.scales,
            x: {
                ...lineOptions.scales.x,
                grid: {
                    display: false
                }
            },
            y: {
                ...lineOptions.scales.y,
                stacked: true,
                beginAtZero: true
            }
        }
    };

    // Componente de tendencia individual
    const TrendCard = ({ title, trend, color, icon, prediction }) => {
        const getTrendIcon = () => {
            if (trend?.trend === 'increasing') return <TrendingUp sx={{ color: 'green' }} />;
            if (trend?.trend === 'decreasing') return <TrendingDown sx={{ color: 'red' }} />;
            return <TrendingFlat sx={{ color: 'gray' }} />;
        };

        const getTrendColor = () => {
            if (trend?.trend === 'increasing') return 'success';
            if (trend?.trend === 'decreasing') return 'error';
            return 'default';
        };

        return (
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ color, mr: 1 }}>
                        {icon} {title}
                    </Typography>
                    {getTrendIcon()}
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {trend?.change || 0}%
                </Typography>
                
                <Chip
                    label={trend?.trend || 'stable'}
                    color={getTrendColor()}
                    size="small"
                    sx={{ mb: 2 }}
                />
                
                {prediction && (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Predicción próximo mes:
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(Math.abs(prediction.change), 100)}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: prediction.change > 0 ? 'green' : 'red'
                                }
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {prediction.change > 0 ? '+' : ''}{prediction.change}% esperado
                        </Typography>
                    </Box>
                )}
            </Paper>
        );
    };

    if (variant === 'cards') {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <TrendCard
                        title="Detenidos"
                        trend={analysis.trends?.detenidos}
                        color={colors.detenidos}
                        icon="👥"
                        prediction={analysis.predictions?.detenidos}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TrendCard
                        title="Incautaciones"
                        trend={analysis.trends?.incautaciones}
                        color={colors.incautaciones}
                        icon="📦"
                        prediction={analysis.predictions?.incautaciones}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TrendCard
                        title="Abatidos"
                        trend={analysis.trends?.abatidos}
                        color={colors.abatidos}
                        icon="⚠️"
                        prediction={analysis.predictions?.abatidos}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TrendCard
                        title="Trata"
                        trend={analysis.trends?.trata}
                        color={colors.trata}
                        icon="🚫"
                        prediction={analysis.predictions?.trata}
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'area') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Análisis de Tendencias Acumuladas (Últimos 12 meses)
                </Typography>
                <Box sx={{ height: 350, position: 'relative' }}>
                    <Line data={areaData} options={areaOptions} />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                        <Typography variant="body2">
                            <strong>Patrón estacional:</strong> {analysis.seasonality?.pattern || 'No detectado'} | 
                            <strong> Correlación más alta:</strong> {analysis.correlations?.highest || 'N/A'}
                        </Typography>
                    </Alert>
                </Box>
            </Box>
        );
    }

    // Variant 'multiline' (default)
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Análisis Temporal Comparativo de Tendencias
            </Typography>
            <Box sx={{ height: 350, position: 'relative' }}>
                <Line data={multiLineData} options={lineOptions} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip
                    label="👥 Detenidos"
                    size="small"
                    sx={{ bgcolor: colors.detenidos + '20', color: colors.detenidos }}
                />
                <Chip
                    label="📦 Incautaciones"
                    size="small"
                    sx={{ bgcolor: colors.incautaciones + '20', color: colors.incautaciones }}
                />
                <Chip
                    label="⚠️ Abatidos"
                    size="small"
                    sx={{ bgcolor: colors.abatidos + '20', color: colors.abatidos }}
                />
                <Chip
                    label="🚫 Trata"
                    size="small"
                    sx={{ bgcolor: colors.trata + '20', color: colors.trata }}
                />
            </Box>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Últimos 12 meses • Análisis predictivo incluido
                </Typography>
            </Box>
        </Box>
    );
};

export default TendenciasChart;