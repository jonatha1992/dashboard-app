import React, { useMemo } from 'react';
import { Bar, Radar, Line } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper, Chip, Divider } from '@mui/material';
import analyticsService from '../../../services/analyticsService';

const ComparativoChart = ({ data, variant = 'stacked' }) => {
    const analysis = useMemo(() => {
        return analyticsService.generateComparativeAnalysis(data);
    }, [data]);

    const colors = {
        detenidos: '#1976d2',     // Azul para detenidos
        incautaciones: '#4caf50', // Verde para incautaciones
        abatidos: '#f44336',      // Rojo para abatidos
        trata: '#9c27b0',         // Púrpura para trata
        operaciones: '#ff9800',   // Naranja para operaciones
        procedimientos: '#607d8b', // Azul gris para procedimientos
        total: '#424242'          // Gris oscuro para total
    };

    // Datos para gráfico de barras apiladas por provincia
    const stackedBarData = useMemo(() => {
        const provincias = Object.keys(analysis.porProvincia || {}).slice(0, 10);
        
        return {
            labels: provincias.map(p => p.replace('_', ' ')),
            datasets: [
                {
                    label: 'Detenidos',
                    data: provincias.map(p => analysis.porProvincia[p]?.detenidos || 0),
                    backgroundColor: colors.detenidos,
                    stack: 'problematics'
                },
                {
                    label: 'Incautaciones',
                    data: provincias.map(p => analysis.porProvincia[p]?.incautaciones || 0),
                    backgroundColor: colors.incautaciones,
                    stack: 'problematics'
                },
                {
                    label: 'Abatidos',
                    data: provincias.map(p => analysis.porProvincia[p]?.abatidos || 0),
                    backgroundColor: colors.abatidos,
                    stack: 'problematics'
                },
                {
                    label: 'Trata',
                    data: provincias.map(p => analysis.porProvincia[p]?.trata || 0),
                    backgroundColor: colors.trata,
                    stack: 'problematics'
                }
            ]
        };
    }, [analysis.porProvincia]);

    // Datos para gráfico radar comparativo
    const radarData = useMemo(() => {
        const categories = ['Detenidos', 'Incautaciones', 'Abatidos', 'Trata', 'Operaciones'];
        const totals = analysis.totales || {};
        const maxValue = Math.max(...Object.values(totals));
        
        return {
            labels: categories,
            datasets: [{
                label: 'Problemáticas (Normalizado)',
                data: categories.map(cat => {
                    const key = cat.toLowerCase();
                    const value = totals[key] || 0;
                    return maxValue > 0 ? (value / maxValue) * 100 : 0;
                }),
                backgroundColor: colors.total + '30',
                borderColor: colors.total,
                borderWidth: 2,
                pointBackgroundColor: colors.total,
                pointBorderColor: '#ffffff',
                pointRadius: 5
            }]
        };
    }, [analysis.totales]);

    // Datos para líneas múltiples por tendencias
    const multiLineData = useMemo(() => {
        const meses = Object.keys(analysis.tendenciasTempo || {}).sort();
        
        return {
            labels: meses.map(mes => {
                const date = new Date(mes + '-01');
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }),
            datasets: [
                {
                    label: 'Detenidos',
                    data: meses.map(mes => analysis.tendenciasTempo[mes]?.detenidos || 0),
                    borderColor: colors.detenidos,
                    backgroundColor: colors.detenidos + '20',
                    tension: 0.4
                },
                {
                    label: 'Incautaciones',
                    data: meses.map(mes => analysis.tendenciasTempo[mes]?.incautaciones || 0),
                    borderColor: colors.incautaciones,
                    backgroundColor: colors.incautaciones + '20',
                    tension: 0.4
                },
                {
                    label: 'Abatidos',
                    data: meses.map(mes => analysis.tendenciasTempo[mes]?.abatidos || 0),
                    borderColor: colors.abatidos,
                    backgroundColor: colors.abatidos + '20',
                    tension: 0.4
                },
                {
                    label: 'Trata',
                    data: meses.map(mes => analysis.tendenciasTempo[mes]?.trata || 0),
                    borderColor: colors.trata,
                    backgroundColor: colors.trata + '20',
                    tension: 0.4
                }
            ]
        };
    }, [analysis.tendenciasTempo]);

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
        },
        scales: {
            x: {
                display: true,
                ticks: {
                    display: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                        size: 10,
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
                stacked: true,
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

    const radarOptions = {
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
                        return `${context.label}: ${context.parsed.r.toFixed(1)}%`;
                    }
                }
            }
        }
    };

    const lineOptions = {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: {
                ...commonOptions.scales.y,
                stacked: false
            }
        }
    };

    // Componente de ranking
    const RankingCard = ({ title, ranking, colorKey }) => (
        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom align="center" sx={{ color: colors[colorKey] }}>
                {title}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {ranking && ranking.length > 0 ? (
                ranking.slice(0, 5).map((item, index) => (
                    <Box key={item.provincia} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                            #{index + 1} {item.provincia.replace('_', ' ')}
                        </Typography>
                        <Chip 
                            label={item.total.toLocaleString()} 
                            size="small" 
                            sx={{ bgcolor: colors[colorKey] + '20', color: colors[colorKey] }}
                        />
                    </Box>
                ))
            ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                    Sin datos disponibles
                </Typography>
            )}
        </Paper>
    );

    if (variant === 'ranking') {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <RankingCard 
                        title="Top Detenidos"
                        ranking={analysis.ranking?.detenidos}
                        colorKey="detenidos"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <RankingCard 
                        title="Top Incautaciones"
                        ranking={analysis.ranking?.incautaciones}
                        colorKey="incautaciones"
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'radar') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Radar Comparativo de Problemáticas
                </Typography>
                <Box sx={{ height: 400, position: 'relative' }}>
                    <Radar data={radarData} options={radarOptions} />
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Valores normalizados al 100% para comparación relativa
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (variant === 'trends') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Tendencias Comparativas por Problemática
                </Typography>
                <Box sx={{ height: 350, position: 'relative' }}>
                    <Line data={multiLineData} options={lineOptions} />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    <Chip label="👥 Detenidos" size="small" />
                    <Chip label="📦 Incautaciones" size="small" />
                    <Chip label="⚠️ Abatidos" size="small" />
                    <Chip label="🚫 Trata" size="small" />
                </Box>
            </Box>
        );
    }

    // Variant 'stacked' (default)
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Comparativo de Problemáticas por Provincia (Top 10)
            </Typography>
            <Box sx={{ height: 350, position: 'relative' }}>
                <Bar data={stackedBarData} options={commonOptions} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip label="👥 Detenidos" size="small" sx={{ bgcolor: colors.detenidos + '20' }} />
                <Chip label="📦 Incautaciones" size="small" sx={{ bgcolor: colors.incautaciones + '20' }} />
                <Chip label="⚠️ Abatidos" size="small" sx={{ bgcolor: colors.abatidos + '20' }} />
                <Chip label="🚫 Trata" size="small" sx={{ bgcolor: colors.trata + '20' }} />
            </Box>
        </Box>
    );
};

export default ComparativoChart;