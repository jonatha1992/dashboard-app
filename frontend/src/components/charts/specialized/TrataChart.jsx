import React, { useMemo } from 'react';
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper, Chip, Alert } from '@mui/material';
import analyticsService from '../../../services/analyticsService';

const TrataChart = ({ data, variant = 'victims' }) => {
    const analysis = useMemo(() => {
        return analyticsService.analyzeTrata(data);
    }, [data]);

    const colors = {
        primary: '#9c27b0',      // Púrpura para trata
        secondary: '#e91e63',    // Rosa para víctimas
        warning: '#ff9800',      // Naranja para rutas
        danger: '#f44336',       // Rojo para alto riesgo
        info: '#2196f3',         // Azul para información
        success: '#4caf50',      // Verde para rescates
        dark: '#424242'          // Gris oscuro
    };

    // Datos para gráfico de barras por tipo de trata
    const barData = useMemo(() => {
        const tipos = Object.entries(analysis.porTipo || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        return {
            labels: tipos.map(([tipo]) => tipo),
            datasets: [{
                label: 'Casos de Trata/Tráfico',
                data: tipos.map(([, count]) => count),
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                borderWidth: 1
            }]
        };
    }, [analysis.porTipo]);

    // Datos para gráfico de dona por perfil de víctimas
    const victimProfileData = useMemo(() => {
        const sexoData = analysis.perfilVictimas?.porSexo || { 'Femenino': 0, 'Masculino': 0, 'No especificado': 0 };
        return {
            labels: Object.keys(sexoData),
            datasets: [{
                data: Object.values(sexoData),
                backgroundColor: [colors.secondary, colors.info, colors.dark],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }, [analysis.perfilVictimas]);

    // Datos para gráfico de línea temporal
    const lineData = useMemo(() => {
        const meses = Object.entries(analysis.porMes || {}).sort();
        return {
            labels: meses.map(([mes]) => {
                const date = new Date(mes + '-01');
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Casos de Trata por mes',
                data: meses.map(([, count]) => count),
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                fill: true,
                tension: 0.4
            }]
        };
    }, [analysis.porMes]);

    // Datos para scatter plot (rutas de tráfico)
    const scatterData = useMemo(() => {
        const rutasData = Object.entries(analysis.rutasTrafic || {}).map(([ruta, frecuencia]) => {
            const riesgo = analysis.zonasRiesgo?.[ruta] || Math.random() * 20;
            return {
                x: frecuencia,
                y: riesgo,
                label: ruta,
                color: riesgo > 15 ? colors.danger : riesgo > 10 ? colors.warning : colors.info
            };
        });

        return {
            datasets: [{
                label: 'Rutas de Tráfico',
                data: rutasData,
                backgroundColor: rutasData.map(d => d.color),
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        };
    }, [analysis.rutasTrafic, analysis.zonasRiesgo]);

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

    const scatterOptions = {
        ...commonOptions,
        scales: {
            x: {
                title: { display: true, text: 'Frecuencia de Rutas' }
            },
            y: {
                title: { display: true, text: 'Nivel de Riesgo' },
                max: 20
            }
        },
        plugins: {
            ...commonOptions.plugins,
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const point = context.raw;
                        return `${point.label}: ${point.x} casos, Riesgo: ${point.y}`;
                    }
                }
            }
        }
    };

    // KPI Card Component
    const KPICard = ({ title, value, subtitle, color = colors.primary, icon = '', alert = false }) => (
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            {alert && (
                <Alert severity="error" sx={{ mb: 1, fontSize: '0.75rem' }}>
                    Problemática crítica
                </Alert>
            )}
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
                        title="Total Casos Trata"
                        value={analysis.total || 0}
                        subtitle="Período completo"
                        color={colors.primary}
                        icon="⚠️"
                        alert={analysis.total > 10}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Víctimas Rescatadas"
                        value={analysis.kpis?.victimasRescatadas || 0}
                        subtitle="Operaciones exitosas"
                        color={colors.success}
                        icon="🆘"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Menores Afectados"
                        value={`${analysis.kpis?.porcentajeMenores || 0}%`}
                        subtitle="Menores de 18 años"
                        color={colors.danger}
                        icon="👶"
                        alert={analysis.kpis?.porcentajeMenores > 50}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Red Más Activa"
                        value={analysis.kpis?.redesmásActivas || 'N/A'}
                        subtitle="Mayor actividad"
                        color={colors.warning}
                        icon="🕸️"
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'victims') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Perfil de Víctimas por Sexo
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Doughnut data={victimProfileData} options={doughnutOptions} />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                        <Typography variant="body2">
                            <strong>Edad Promedio:</strong> {analysis.kpis?.edadPromedioVictimas || 'N/A'} años | 
                            <strong> Menores:</strong> {analysis.kpis?.porcentajeMenores || 0}%
                        </Typography>
                    </Alert>
                </Box>
            </Box>
        );
    }

    if (variant === 'line') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Evolución Temporal de Casos de Trata
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

    if (variant === 'routes') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Análisis de Rutas de Tráfico
                </Typography>
                <Box sx={{ height: 350, position: 'relative' }}>
                    <Scatter data={scatterData} options={scatterOptions} />
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Cada punto representa una ruta identificada
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Chip label="🔴 Alto Riesgo" size="small" />
                        <Chip label="🟡 Medio Riesgo" size="small" />
                        <Chip label="🔵 Bajo Riesgo" size="small" />
                    </Box>
                </Box>
            </Box>
        );
    }

    // Variant 'bars' (default)
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Casos de Trata y Tráfico por Tipo
            </Typography>
            <Box sx={{ height: 350, position: 'relative' }}>
                <Bar data={barData} options={commonOptions} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip label="🚫 Trata Personas" size="small" />
                <Chip label="🛣️ Tráfico Personas" size="small" />
                <Chip label="⚠️ Explotación" size="small" />
                <Chip label="🆘 Rescates" size="small" />
            </Box>
        </Box>
    );
};

export default TrataChart;