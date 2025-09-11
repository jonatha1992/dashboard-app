import React, { useMemo } from 'react';
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import analyticsService from '../../../services/analyticsService';
import { getChartConfig, CHART_COLORS, generateColorPalette } from '../../../utils/chartConfig';

const IncautacionesChart = ({ data, variant = 'treemap' }) => {
    const analysis = useMemo(() => {
        return analyticsService.analyzeIncautaciones(data);
    }, [data]);

    const colors = {
        drugs: '#f44336',      // Rojo para drogas
        weapons: '#9c27b0',    // Púrpura para armas
        money: '#4caf50',      // Verde para dinero
        vehicles: '#2196f3',   // Azul para vehículos
        other: '#ff9800',      // Naranja para otros
        primary: '#1976d2'
    };

    // Función para asignar color por tipo
    const getColorByType = (tipo) => {
        const tipoLower = tipo.toLowerCase();
        if (tipoLower.includes('droga') || tipoLower.includes('estupefa')) return colors.drugs;
        if (tipoLower.includes('arma') || tipoLower.includes('municí')) return colors.weapons;
        if (tipoLower.includes('dinero') || tipoLower.includes('efectivo')) return colors.money;
        if (tipoLower.includes('vehículo') || tipoLower.includes('auto')) return colors.vehicles;
        return colors.other;
    };

    // Datos para gráfico de barras por tipo
    const barData = useMemo(() => {
        const tipos = Object.entries(analysis.porTipo)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        return {
            labels: tipos.map(([tipo]) => tipo),
            datasets: [{
                label: 'Incautaciones',
                data: tipos.map(([, count]) => count),
                backgroundColor: tipos.map(([tipo]) => getColorByType(tipo)),
                borderWidth: 1
            }]
        };
    }, [analysis.porTipo]);

    // Datos para gráfico de dona por valor
    const valueRangeData = useMemo(() => {
        const ranges = analysis.porRangoValor || {
            'Bajo (< $50K)': 0,
            'Medio ($50K-$500K)': 0,
            'Alto (> $500K)': 0
        };

        return {
            labels: Object.keys(ranges),
            datasets: [{
                data: Object.values(ranges),
                backgroundColor: [colors.other, colors.primary, colors.drugs],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }, [analysis.porRangoValor]);

    // Datos para scatter plot (valor vs frecuencia)
    const scatterData = useMemo(() => {
        const tiposData = Object.entries(analysis.porTipo).map(([tipo, count]) => {
            // Simular valor promedio por tipo (en análisis real vendría del backend)
            const avgValue = tipo.toLowerCase().includes('droga') ? 100000 :
                           tipo.toLowerCase().includes('arma') ? 50000 :
                           tipo.toLowerCase().includes('dinero') ? 200000 : 25000;
            
            return {
                x: count,
                y: avgValue,
                label: tipo,
                color: getColorByType(tipo)
            };
        });

        return {
            datasets: [{
                label: 'Tipo de Incautación',
                data: tiposData,
                backgroundColor: tiposData.map(d => d.color),
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        };
    }, [analysis.porTipo]);

    // Datos temporales
    const lineData = useMemo(() => {
        const meses = Object.entries(analysis.porMes).sort();
        return {
            labels: meses.map(([mes]) => {
                const date = new Date(mes + '-01');
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Incautaciones',
                data: meses.map(([, count]) => count),
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                fill: true,
                tension: 0.4
            }]
        };
    }, [analysis.porMes]);

    // Configuraciones
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                bottom: 60, // Increased bottom padding for x-axis labels
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
                title: { display: true, text: 'Cantidad de Incautaciones' }
            },
            y: {
                title: { display: true, text: 'Valor Promedio ($)' },
                ticks: {
                    callback: (value) => `$${value.toLocaleString()}`
                }
            }
        },
        plugins: {
            ...commonOptions.plugins,
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const point = context.raw;
                        return `${point.label}: ${point.x} incautaciones, $${point.y.toLocaleString()}`;
                    }
                }
            }
        }
    };

    // KPI Cards
    const KPICard = ({ title, value, subtitle, color = colors.primary, prefix = '' }) => (
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
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
                        title="Total Incautaciones"
                        value={analysis.total}
                        subtitle="Período completo"
                        color={colors.primary}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Valor Total"
                        value={analysis.valorTotal}
                        subtitle="En pesos argentinos"
                        color={colors.money}
                        prefix="$"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Valor Promedio"
                        value={analysis.kpis.valorPromedio}
                        subtitle="Por incautación"
                        color={colors.other}
                        prefix="$"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Tipo Más Común"
                        value={analysis.kpis.tipoMasComun}
                        subtitle="Mayor frecuencia"
                        color={colors.drugs}
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'doughnut') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Incautaciones por Rango de Valor
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Doughnut data={valueRangeData} options={doughnutOptions} />
                </Box>
            </Box>
        );
    }

    if (variant === 'scatter') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Relación Frecuencia vs Valor por Tipo
                </Typography>
                <Box sx={{ height: 350, position: 'relative' }}>
                    <Scatter data={scatterData} options={scatterOptions} />
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Cada punto representa un tipo de incautación
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (variant === 'line') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Evolución Temporal de Incautaciones
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Line data={lineData} options={commonOptions} />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Chip 
                        label={`Tendencia: ${analysis.tendencia.trend}`}
                        color={analysis.tendencia.trend === 'increasing' ? 'success' : 
                               analysis.tendencia.trend === 'decreasing' ? 'error' : 'default'}
                        size="small"
                    />
                    <Chip 
                        label={`${analysis.tendencia.change}%`}
                        variant="outlined"
                        size="small"
                    />
                </Box>
            </Box>
        );
    }

    // Variant 'treemap' (default) - simulado con barras horizontales
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Incautaciones por Tipo (Top 8)
            </Typography>
            <Box sx={{ height: 350, position: 'relative' }}>
                <Bar 
                    data={barData} 
                    options={{
                        ...commonOptions,
                        indexAxis: 'y',
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }} 
                />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip label="🔴 Drogas" size="small" />
                <Chip label="🟣 Armas" size="small" />
                <Chip label="🟢 Dinero" size="small" />
                <Chip label="🔵 Vehículos" size="small" />
                <Chip label="🟠 Otros" size="small" />
            </Box>
        </Box>
    );
};

export default IncautacionesChart;