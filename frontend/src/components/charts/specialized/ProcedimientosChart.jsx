import React, { useMemo } from 'react';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper, Chip, LinearProgress } from '@mui/material';
import analyticsService from '../../../services/analyticsService';

const ProcedimientosChart = ({ data, variant = 'bars' }) => {
    const analysis = useMemo(() => {
        return analyticsService.analyzeProcedimientos(data);
    }, [data]);

    const colors = {
        primary: '#607d8b',      // Azul gris para procedimientos
        secondary: '#795548',    // Marrón para tipos
        success: '#4caf50',      // Verde para éxitos
        info: '#03a9f4',         // Cyan para información
        warning: '#ff9800',      // Naranja para pendientes
        error: '#f44336',        // Rojo para fallos
        purple: '#9c27b0'        // Púrpura para especiales
    };

    // Datos para gráfico de barras por tipo de procedimiento
    const barData = useMemo(() => {
        const tipos = Object.entries(analysis.porTipo || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            labels: tipos.map(([tipo]) => tipo),
            datasets: [{
                label: 'Procedimientos',
                data: tipos.map(([, count]) => count),
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                borderWidth: 1
            }]
        };
    }, [analysis.porTipo]);

    // Datos para gráfico de dona por estado
    const doughnutData = useMemo(() => {
        const estados = analysis.porEstado || { 
            'Completado': 0, 
            'En Proceso': 0, 
            'Pendiente': 0, 
            'Cancelado': 0 
        };
        return {
            labels: Object.keys(estados),
            datasets: [{
                data: Object.values(estados),
                backgroundColor: [colors.success, colors.info, colors.warning, colors.error],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }, [analysis.porEstado]);

    // Datos para gráfico de línea temporal
    const lineData = useMemo(() => {
        const meses = Object.entries(analysis.porMes || {}).sort();
        return {
            labels: meses.map(([mes]) => {
                const date = new Date(mes + '-01');
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Procedimientos por mes',
                data: meses.map(([, count]) => count),
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                fill: true,
                tension: 0.4
            }]
        };
    }, [analysis.porMes]);

    // Datos para gráfico polar de eficiencia por unidad
    const polarData = useMemo(() => {
        const unidades = Object.entries(analysis.porUnidad || {}).slice(0, 6);
        return {
            labels: unidades.map(([unidad]) => unidad),
            datasets: [{
                label: 'Eficiencia (%)',
                data: unidades.map(([, data]) => data.eficiencia || 0),
                backgroundColor: [
                    colors.primary + '80',
                    colors.secondary + '80',
                    colors.success + '80',
                    colors.info + '80',
                    colors.warning + '80',
                    colors.purple + '80'
                ],
                borderColor: [
                    colors.primary,
                    colors.secondary,
                    colors.success,
                    colors.info,
                    colors.warning,
                    colors.purple
                ],
                borderWidth: 2
            }]
        };
    }, [analysis.porUnidad]);

    // Configuraciones
    const commonOptions = {
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
                    display: false
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

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                bottom: 20,
                left: 10,
                right: 10
            }
        },
        plugins: {
            legend: {
                position: 'right',
                display: true,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 11
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
        }
    };

    const polarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `${context.label}: ${context.parsed.r}%`;
                    }
                }
            }
        }
    };

    // KPI Card Component con progreso
    const KPICard = ({ title, value, target, subtitle, color = colors.primary, showProgress = false }) => {
        const percentage = target > 0 ? (value / target) * 100 : 0;
        return (
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    {title}
                </Typography>
                {showProgress && target && (
                    <Box sx={{ mt: 1 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={Math.min(percentage, 100)} 
                            sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: color
                                }
                            }} 
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {Math.round(percentage)}% del objetivo
                        </Typography>
                    </Box>
                )}
                {subtitle && !showProgress && (
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Paper>
        );
    };

    if (variant === 'kpis') {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Total Procedimientos"
                        value={analysis.total || 0}
                        subtitle="Período completo"
                        color={colors.primary}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Tasa de Éxito"
                        value={analysis.kpis?.tasaExito || 0}
                        target={100}
                        color={colors.success}
                        showProgress={true}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Tiempo Promedio"
                        value={`${analysis.kpis?.tiempoPromedio || 0} días`}
                        subtitle="Duración procedimientos"
                        color={colors.info}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Pendientes"
                        value={analysis.kpis?.pendientes || 0}
                        subtitle="Requieren atención"
                        color={colors.warning}
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'doughnut') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Procedimientos por Estado
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    <Chip label="✅ Completados" size="small" />
                    <Chip label="⏳ En Proceso" size="small" />
                    <Chip label="⏸️ Pendientes" size="small" />
                    <Chip label="❌ Cancelados" size="small" />
                </Box>
            </Box>
        );
    }

    if (variant === 'line') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Evolución Temporal de Procedimientos
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Line data={lineData} options={commonOptions} />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Chip 
                        label={`Tendencia: ${analysis.tendencia?.trend || 'stable'}`}
                        color={analysis.tendencia?.trend === 'increasing' ? 'success' : 
                               analysis.tendencia?.trend === 'decreasing' ? 'warning' : 'default'}
                        size="small"
                    />
                    <Chip 
                        label={`${analysis.tendencia?.change || 0}%`}
                        variant="outlined"
                        size="small"
                    />
                </Box>
            </Box>
        );
    }

    if (variant === 'polar') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Eficiencia por Unidad Operativa
                </Typography>
                <Box sx={{ height: 350, position: 'relative' }}>
                    <PolarArea data={polarData} options={polarOptions} />
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Porcentaje de eficiencia por unidad
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Variant 'bars' (default)
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Procedimientos por Tipo (Top 10)
            </Typography>
            <Box sx={{ height: 350, position: 'relative' }}>
                <Bar data={barData} options={commonOptions} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip label="📋 Administrativos" size="small" />
                <Chip label="🔍 Investigación" size="small" />
                <Chip label="🚨 Operativos" size="small" />
                <Chip label="⚖️ Legales" size="small" />
            </Box>
        </Box>
    );
};

export default ProcedimientosChart;