import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper } from '@mui/material';
import analyticsService from '../../../services/analyticsService';
import { getChartConfig, CHART_COLORS, generateColorPalette } from '../../../utils/chartConfig';

const DetenidosChart = ({ data, variant = 'bars' }) => {
    const analysis = useMemo(() => {
        return analyticsService.analyzeDetenidos(data);
    }, [data]);

    // Configuración estándar de gráficos
    const chartColors = generateColorPalette(6);
    const colors = {
        primary: chartColors[0],
        secondary: chartColors[1],
        success: chartColors[2],
        warning: chartColors[3],
        info: chartColors[4],
        danger: chartColors[5]
    };

    // Datos para gráfico de barras por provincia
    const barData = useMemo(() => {
        const provincias = Object.entries(analysis.porProvincia)
            .sort(([, a], [, b]) => b - a)
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
                top: 10,
                bottom: 70,  // Aumentado aún más para dar espacio a etiquetas y leyendas
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
                        size: 12,
                        family: 'Inter, system-ui, -apple-system, sans-serif'
                    },
                    color: '#1951abff'
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(129, 82, 82, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1,
                cornerRadius: 6,
                displayColors: true
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Provincias',
                    color: '#374151',
                    font: {
                        weight: 'bold',
                        size: 12,
                        family: 'Inter, system-ui, -apple-system, sans-serif'
                    },
                    padding: { top: 10 }
                },
                ticks: {
                    display: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                        size: 12,  // Aumentado para mejor visibilidad
                        weight: 'normal',
                        family: 'Inter, system-ui, -apple-system, sans-serif'
                    },
                    color: '#000000',  // Color negro para mayor contraste
                    padding: 10,  // Más padding
                    maxTicksLimit: 8,  // Menos etiquetas para evitar solapamiento
                    align: 'center',  // Alineación centrada
                    labelOffset: 15,  // Offset adicional
                    crossAlign: 'far'  // Alineación cruzada
                },
                grid: {
                    display: true,
                    color: 'rgba(0,0,0,0.1)',
                    lineWidth: 1
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Cantidad',
                    color: '#374151',
                    font: {
                        weight: 'bold',
                        size: 12,
                        family: 'Inter, system-ui, -apple-system, sans-serif'
                    }
                },
                ticks: {
                    beginAtZero: true,
                    font: {
                        size: 10,
                        family: 'Inter, system-ui, -apple-system, sans-serif'
                    },
                    color: '#6B7280',
                    padding: 8
                },
                grid: {
                    display: true,
                    color: 'rgba(0,0,0,0.1)',
                    lineWidth: 1
                }
            }
        }
    };

    const barOptions = {
        ...commonOptions,
        indexAxis: 'x',
        plugins: {
            ...commonOptions.plugins,
            legend: {
                position: 'bottom', // Leyenda abajo
                display: true,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    boxWidth: 12,
                    boxHeight: 12,
                    font: {
                        size: 13,
                        weight: 'bold',
                        family: 'Inter, system-ui, -apple-system, sans-serif'
                    },
                    color: '#000000'
                }
            },
            title: {
                display: false,
                padding: {
                    bottom: 30
                }
            }
        },
        scales: {
            ...commonOptions.scales,
            x: {
                ...commonOptions.scales.x,
                grid: {
                    display: false
                },
                ticks: {
                    ...commonOptions.scales.x.ticks,
                    autoSkip: false, // Mostrar todas las etiquetas
                    maxRotation: 45, // Rotar para evitar solapamiento
                    minRotation: 0,
                    font: {
                        size: 13,
                        weight: 'bold',
                        family: 'Inter, system-ui, -apple-system, sans-serif'
                    },
                    color: '#000000',
                    padding: 15
                },
                position: 'bottom', // Eje X abajo (por defecto, pero lo reforzamos)
                afterFit: function (scale) {
                    // Aumentar espacio para las etiquetas del eje X
                    scale.height = 80;  // Dar espacio explícito mucho mayor
                }
            },
            y: {
                ...commonOptions.scales.y,
                beginAtZero: true,
                ticks: {
                    ...commonOptions.scales.y.ticks,
                    stepSize: 1,
                    precision: 0
                }
            }
        },
        layout: {
            padding: {
                top: 10,
                right: 15,
                bottom: 80, // Aumentamos considerablemente el padding inferior
                left: 15
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        },
        plugins: {
            legend: {
                position: 'right',
                display: true,
                labels: {
                    color: '#374151',
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, -apple-system, sans-serif'
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
                borderWidth: 1,
                cornerRadius: 6
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
                <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2 }}>
                    Detenidos por Sexo
                </Typography>
                <Box sx={{ height: 350, position: 'relative', minHeight: '350px' }}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                </Box>
            </Box>
        );
    }

    if (variant === 'line') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2 }}>
                    Tendencia Temporal de Detenciones
                </Typography>
                <Box sx={{ height: 350, position: 'relative', minHeight: '350px' }}>
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

    // Creamos una versión optimizada de los datos para mejor visualización
    const optimizedBarData = useMemo(() => {
        // Limitar a 8 provincias para evitar amontonamiento
        const limitedData = { ...barData };
        if (limitedData.labels.length > 8) {
            limitedData.labels = limitedData.labels.slice(0, 8);
            limitedData.datasets[0].data = limitedData.datasets[0].data.slice(0, 8);
        }
        return limitedData;
    }, [barData]);

    // Variant 'bars' (default)
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2 }}>
                Detenidos por Provincia (Top 8)
            </Typography>
            <Box sx={{ height: 450, position: 'relative', minHeight: '450px', pb: 6, mb: 4 }}>
                <Bar
                    data={optimizedBarData}
                    options={barOptions}
                    plugins={[{
                        // Plugin personalizado para asegurar que las etiquetas X se rendericen
                        id: 'forceXAxisLabels',
                        afterDraw: (chart) => {
                            const ctx = chart.ctx;
                            const xAxis = chart.scales.x;
                            const yAxis = chart.scales.y;

                            // Dibujar manualmente las etiquetas si es necesario
                            if (xAxis && xAxis.ticks) {
                                ctx.save();
                                ctx.fillStyle = '#000000';
                                ctx.font = 'bold 13px Inter, system-ui, sans-serif';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'top';

                                xAxis.ticks.forEach((tick, index) => {
                                    if (index < optimizedBarData.labels.length) {
                                        ctx.fillText(
                                            optimizedBarData.labels[index],
                                            xAxis.getPixelForTick(index),
                                            yAxis.bottom + 20
                                        );
                                    }
                                });

                                ctx.restore();
                            }
                        }
                    }]}
                />
            </Box>
        </Box>
    );
};

export default DetenidosChart;