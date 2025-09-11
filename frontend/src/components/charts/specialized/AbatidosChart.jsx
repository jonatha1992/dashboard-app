import React, { useMemo } from 'react';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import analyticsService from '../../../services/analyticsService';

const AbatidosChart = ({ data, variant = 'bars' }) => {
    const analysis = useMemo(() => {
        return analyticsService.analyzeAbatidos(data);
    }, [data]);

    const colors = {
        primary: '#d32f2f',      // Rojo para abatidos
        secondary: '#ff5722',    // Naranja para heridos
        warning: '#ff9800',      // Amber para procedimien
        info: '#2196f3',         // Azul para fuerzas
        success: '#4caf50',      // Verde para resultados
        dark: '#424242'          // Gris oscuro
    };

    // Datos para gráfico de barras por provincia
    const barData = useMemo(() => {
        const provincias = Object.entries(analysis.porProvincia || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            labels: provincias.map(([provincia]) => provincia.replace('_', ' ')),
            datasets: [{
                label: 'Abatidos',
                data: provincias.map(([, count]) => count),
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                borderWidth: 1
            }]
        };
    }, [analysis.porProvincia]);

    // Datos para gráfico de dona por tipo de enfrentamiento
    const doughnutData = useMemo(() => {
        const tiposData = analysis.porTipoEnfrentamiento || { 'Enfrentamiento Armado': 0, 'Procedimiento Especial': 0, 'Operativo': 0 };
        return {
            labels: Object.keys(tiposData),
            datasets: [{
                data: Object.values(tiposData),
                backgroundColor: [colors.primary, colors.warning, colors.info],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }, [analysis.porTipoEnfrentamiento]);

    // Datos para gráfico de línea temporal
    const lineData = useMemo(() => {
        const meses = Object.entries(analysis.porMes || {}).sort();
        return {
            labels: meses.map(([mes]) => {
                const date = new Date(mes + '-01');
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Abatidos por mes',
                data: meses.map(([, count]) => count),
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                fill: true,
                tension: 0.4
            }]
        };
    }, [analysis.porMes]);

    // Datos para radar de análisis operativo
    const radarData = useMemo(() => {
        const metrics = {
            'Efectividad Operativa': analysis.kpis?.efectividadOperativa || 0,
            'Respuesta Rápida': analysis.kpis?.tiempoRespuesta || 0,
            'Coordinación': analysis.kpis?.nivelCoordinacion || 0,
            'Recursos Desplegados': analysis.kpis?.recursosUtilizados || 0,
            'Cobertura Territorial': analysis.kpis?.coberturaZonal || 0,
            'Impacto Operativo': analysis.kpis?.impactoZonal || 0
        };

        return {
            labels: Object.keys(metrics),
            datasets: [{
                label: 'Análisis Operativo',
                data: Object.values(metrics),
                backgroundColor: colors.primary + '30',
                borderColor: colors.primary,
                borderWidth: 2,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#ffffff',
                pointRadius: 5
            }]
        };
    }, [analysis.kpis]);

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

    const radarOptions = {
        ...commonOptions,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20
                }
            }
        }
    };

    // KPI Card Component
    const KPICard = ({ title, value, subtitle, color = colors.primary, icon = '' }) => (
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
                {icon} {typeof value === 'number' ? value.toLocaleString() : value}
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
                        title="Total Abatidos"
                        value={analysis.total || 0}
                        subtitle="Período completo"
                        color={colors.primary}
                        icon="⚠️"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Heridos"
                        value={analysis.totalHeridos || 0}
                        subtitle="En enfrentamientos"
                        color={colors.secondary}
                        icon="🏥"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Efectividad"
                        value={`${analysis.kpis?.efectividadOperativa || 0}%`}
                        subtitle="Operativa"
                        color={colors.success}
                        icon="🎯"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Zona Crítica"
                        value={analysis.kpis?.zonaMasCritica || 'N/A'}
                        subtitle="Mayor incidencia"
                        color={colors.dark}
                        icon="📍"
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'doughnut') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Abatidos por Tipo de Enfrentamiento
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
                    Tendencia Temporal de Enfrentamientos Letales
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Line data={lineData} options={commonOptions} />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Chip 
                        label={`Tendencia: ${analysis.tendencia?.trend || 'stable'}`}
                        color={analysis.tendencia?.trend === 'increasing' ? 'error' : 
                               analysis.tendencia?.trend === 'decreasing' ? 'success' : 'default'}
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

    if (variant === 'radar') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Análisis Operativo Multidimensional
                </Typography>
                <Box sx={{ height: 400, position: 'relative' }}>
                    <Radar data={radarData} options={radarOptions} />
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Métricas operativas expresadas en porcentaje (0-100%)
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Variant 'bars' (default)
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Enfrentamientos Letales por Provincia (Top 10)
            </Typography>
            <Box sx={{ height: 350, position: 'relative' }}>
                <Bar data={barData} options={commonOptions} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip label="⚠️ Crítico" size="small" />
                <Chip label="🏥 Heridos" size="small" />
                <Chip label="🎯 Efectividad" size="small" />
            </Box>
        </Box>
    );
};

export default AbatidosChart;