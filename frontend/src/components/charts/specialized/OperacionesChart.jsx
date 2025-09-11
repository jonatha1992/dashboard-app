import React, { useMemo } from 'react';
import { Bar, Radar, Doughnut, Line } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper, LinearProgress, Chip } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import analyticsService from '../../../services/analyticsService';

const OperacionesChart = ({ data, variant = 'efficiency' }) => {
    const analysis = useMemo(() => {
        return analyticsService.analyzeOperaciones(data);
    }, [data]);

    const colors = {
        primary: '#1976d2',
        success: '#2e7d32',
        warning: '#f57c00',
        error: '#d32f2f',
        info: '#0288d1',
        secondary: '#7b1fa2'
    };

    // Datos para gráfico de eficiencia (Gauge)
    const efficiencyData = useMemo(() => {
        const efficiency = analysis.kpis.eficienciaPromedio || 0;
        return {
            value: Math.round(efficiency),
            target: 100,
            label: 'Eficiencia Operativa'
        };
    }, [analysis.kpis.eficienciaPromedio]);

    // Datos para gráfico radar (cobertura multidimensional)
    const radarData = useMemo(() => {
        const metrics = {
            'Cobertura Territorial': analysis.kpis.coberturaTotal || 0,
            'Eficiencia Operativa': analysis.kpis.eficienciaPromedio || 0,
            'Despliegue Recursos': analysis.kpis.recursosPromedio || 0,
            'Score Operativo': analysis.kpis.scoreOperativo || 0,
            'Personas Controladas': Math.min((analysis.personasControladas / 1000) * 100, 100),
            'Vehículos Controlados': Math.min((analysis.vehiculosControlados / 500) * 100, 100)
        };

        return {
            labels: Object.keys(metrics),
            datasets: [{
                label: 'Indicadores Operacionales',
                data: Object.values(metrics),
                backgroundColor: colors.primary + '30',
                borderColor: colors.primary,
                borderWidth: 2,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#ffffff',
                pointRadius: 5
            }]
        };
    }, [analysis]);

    // Datos para barras por unidad
    const unitData = useMemo(() => {
        const units = Object.entries(analysis.porUnidad || {})
            .sort(([,a], [,b]) => b.total - a.total)
            .slice(0, 8);

        return {
            labels: units.map(([unit]) => unit),
            datasets: [
                {
                    label: 'Efectivos',
                    data: units.map(([, data]) => data.efectivos || 0),
                    backgroundColor: colors.primary,
                    stack: 'recursos'
                },
                {
                    label: 'Vehículos',
                    data: units.map(([, data]) => data.vehiculos || 0),
                    backgroundColor: colors.info,
                    stack: 'recursos'
                }
            ]
        };
    }, [analysis.porUnidad]);

    // Datos para distribución de controles
    const controlData = useMemo(() => {
        const totalPersonas = analysis.personasControladas || 0;
        const totalVehiculos = analysis.vehiculosControlados || 0;
        const totalTotal = totalPersonas + totalVehiculos;

        if (totalTotal === 0) {
            return {
                labels: ['Sin datos'],
                datasets: [{
                    data: [1],
                    backgroundColor: [colors.error],
                    borderWidth: 0
                }]
            };
        }

        return {
            labels: ['Personas', 'Vehículos'],
            datasets: [{
                data: [totalPersonas, totalVehiculos],
                backgroundColor: [colors.success, colors.warning],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }, [analysis.personasControladas, analysis.vehiculosControlados]);

    // Configuraciones
    const commonOptions = {
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

    // Componente de KPI con progreso
    const ProgressKPI = ({ title, value, target, color = colors.primary, unit = '%' }) => {
        const percentage = target > 0 ? (value / target) * 100 : 0;
        return (
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" sx={{ color, fontWeight: 'bold', mr: 1 }}>
                        {value.toLocaleString()}{unit}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        / {target.toLocaleString()}{unit}
                    </Typography>
                </Box>
                <LinearProgress 
                    variant="determinate" 
                    value={Math.min(percentage, 100)} 
                    sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: color
                        }
                    }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {Math.round(percentage)}% del objetivo
                </Typography>
            </Paper>
        );
    };

    // Componente Gauge
    const GaugeChart = ({ value, title, color = colors.primary }) => (
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Gauge
                    value={value}
                    startAngle={-110}
                    endAngle={110}
                    sx={{
                        [`& .${gaugeClasses.valueText}`]: {
                            fontSize: 40,
                            transform: 'translate(0px, 0px)',
                            fill: color,
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                            fill: color,
                        },
                    }}
                    text={({ value }) => `${value}%`}
                />
            </Box>
            <Chip 
                label={value >= 80 ? 'Excelente' : value >= 60 ? 'Bueno' : 'Mejorar'}
                color={value >= 80 ? 'success' : value >= 60 ? 'warning' : 'error'}
                size="small"
            />
        </Paper>
    );

    if (variant === 'kpis') {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={3}>
                    <ProgressKPI
                        title="Efectivos Desplegados"
                        value={analysis.efectivosDesplegados}
                        target={1000}
                        color={colors.primary}
                        unit=""
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <ProgressKPI
                        title="Vehículos Operativos"
                        value={analysis.vehiculosDesplegados}
                        target={200}
                        color={colors.info}
                        unit=""
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <ProgressKPI
                        title="Personas Controladas"
                        value={analysis.personasControladas}
                        target={5000}
                        color={colors.success}
                        unit=""
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <ProgressKPI
                        title="Vehículos Controlados"
                        value={analysis.vehiculosControlados}
                        target={2000}
                        color={colors.warning}
                        unit=""
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'gauge') {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <GaugeChart
                        value={efficiencyData.value}
                        title="Eficiencia Operativa"
                        color={colors.primary}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <GaugeChart
                        value={Math.round(analysis.kpis.coberturaTotal || 0)}
                        title="Cobertura Territorial"
                        color={colors.success}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <GaugeChart
                        value={Math.round(analysis.kpis.scoreOperativo || 0)}
                        title="Score Operativo"
                        color={colors.secondary}
                    />
                </Grid>
            </Grid>
        );
    }

    if (variant === 'radar') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Radar Operacional Multidimensional
                </Typography>
                <Box sx={{ height: 400, position: 'relative' }}>
                    <Radar data={radarData} options={radarOptions} />
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Valores expresados en porcentaje (0-100%)
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (variant === 'doughnut') {
        return (
            <Box>
                <Typography variant="h6" gutterBottom align="center">
                    Distribución de Controles Realizados
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                    <Doughnut data={controlData} options={commonOptions} />
                </Box>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                        <Paper elevation={1} sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant="h6" color={colors.success}>
                                {analysis.personasControladas?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption">Personas</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper elevation={1} sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant="h6" color={colors.warning}>
                                {analysis.vehiculosControlados?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption">Vehículos</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Variant 'efficiency' (default) - recursos por unidad
    return (
        <Box>
            <Typography variant="h6" gutterBottom align="center">
                Recursos Desplegados por Unidad (Top 8)
            </Typography>
            <Box sx={{ height: 350, position: 'relative' }}>
                <Bar data={unitData} options={{
                    ...commonOptions,
                    scales: {
                        x: { 
                            stacked: true,
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
                            stacked: true,
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
                }} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Chip label="👥 Efectivos" size="small" />
                <Chip label="🚐 Vehículos" size="small" />
            </Box>
        </Box>
    );
};

export default OperacionesChart;