import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Tabs,
    Tab,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Button,
    ButtonGroup,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Security,
    Gavel,
    DirectionsCar,
    VisibilityOff,
    Assessment,
    TrendingUp,
    PieChart,
    BarChart
} from '@mui/icons-material';

import DetenidosChart from '../../charts/specialized/DetenidosChart';
import IncautacionesChart from '../../charts/specialized/IncautacionesChart';
import OperacionesChart from '../../charts/specialized/OperacionesChart';
import analyticsService from '../../../services/analyticsService';
import { useDashboard } from '../../../contexts/DashboardContext';

const ProblematicasDashboard = () => {
    const { data, loading, error } = useDashboard();
    const [activeTab, setActiveTab] = useState(0);
    const [viewMode, setViewMode] = useState('overview');

    // Análisis general
    const generalAnalysis = useMemo(() => {
        if (!data || data.length === 0) return null;
        return {
            ranking: analyticsService.generateRankingProblematicas(data),
            trends: analyticsService.generateTrendAnalysis(data, 'monthly')
        };
    }, [data]);

    // Configuración de pestañas
    const tabs = [
        {
            label: 'Visión General',
            icon: <Assessment />,
            value: 'overview'
        },
        {
            label: 'Seguridad Ciudadana',
            icon: <Security />,
            value: 'seguridad',
            problems: ['detenidos', 'abatidos']
        },
        {
            label: 'Operaciones',
            icon: <DirectionsCar />,
            value: 'operaciones', 
            problems: ['controles', 'recursos']
        },
        {
            label: 'Inteligencia',
            icon: <VisibilityOff />,
            value: 'inteligencia',
            problems: ['incautaciones', 'trata']
        }
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setViewMode('overview');
    };

    // Componente de KPI principal
    const MainKPI = ({ title, value, subtitle, trend, color = '#1976d2', icon }) => (
        <Card elevation={3} sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                        sx={{ 
                            p: 1, 
                            backgroundColor: color + '20', 
                            borderRadius: 1, 
                            mr: 2,
                            color: color
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
                {trend && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Chip
                            label={`${trend > 0 ? '+' : ''}${trend}%`}
                            size="small"
                            color={trend > 0 ? 'success' : trend < 0 ? 'error' : 'default'}
                            icon={trend > 0 ? <TrendingUp /> : undefined}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    // Componente de tarjeta problemática
    const ProblematicCard = ({ title, data: cardData, chartComponent, variant = 'primary' }) => (
        <Card elevation={2} sx={{ height: '480px' }}>
            <CardHeader
                title={title}
                action={
                    <ButtonGroup size="small">
                        <Button onClick={() => setViewMode('kpis')}>KPIs</Button>
                        <Button onClick={() => setViewMode('charts')}>Gráficos</Button>
                    </ButtonGroup>
                }
            />
            <Divider />
            <CardContent sx={{ height: 'calc(100% - 90px)', overflow: 'hidden', p: 2 }}>
                {React.cloneElement(chartComponent, { 
                    data: cardData, 
                    variant: viewMode === 'kpis' ? 'kpis' : variant 
                })}
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Analizando problemáticas...
                </Typography>
            </Box>
        );
    }

    if (error || !data || data.length === 0) {
        return (
            <Alert severity="warning" sx={{ mt: 2 }}>
                No se pueden analizar las problemáticas. {error || 'No hay datos disponibles.'}
            </Alert>
        );
    }

    const renderOverview = () => (
        <Grid container spacing={3}>
            {/* KPIs Principales */}
            <Grid item xs={12} md={3}>
                <MainKPI
                    title="Total Operaciones"
                    value={data.length}
                    subtitle="Procedimientos registrados"
                    trend={generalAnalysis?.trends?.operaciones?.change}
                    color="#1976d2"
                    icon={<Assessment />}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <MainKPI
                    title="Detenidos"
                    value={data.filter(item => item.DETENIDOS > 0).length}
                    subtitle="Personas detenidas"
                    trend={generalAnalysis?.trends?.detenidos?.change}
                    color="#f44336"
                    icon={<Security />}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <MainKPI
                    title="Incautaciones"
                    value={data.filter(item => item.INCAUTACIONES).length}
                    subtitle="Elementos incautados"
                    trend={generalAnalysis?.trends?.incautaciones?.change}
                    color="#ff9800"
                    icon={<Gavel />}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <MainKPI
                    title="Controles"
                    value={data.filter(item => item.PERSONAS_CONTROLADAS > 0).length}
                    subtitle="Operativos de control"
                    trend={generalAnalysis?.trends?.operaciones?.change}
                    color="#4caf50"
                    icon={<DirectionsCar />}
                />
            </Grid>

            {/* Ranking de Problemáticas */}
            <Grid item xs={12} md={8}>
                <Card elevation={2}>
                    <CardHeader title="Ranking de Problemáticas por Provincia" />
                    <CardContent>
                        <DetenidosChart data={data} variant="bars" />
                    </CardContent>
                </Card>
            </Grid>

            {/* Top Provincias */}
            <Grid item xs={12} md={4}>
                <Card elevation={2}>
                    <CardHeader title="Distribución por Tipo" />
                    <CardContent>
                        <IncautacionesChart data={data} variant="doughnut" />
                    </CardContent>
                </Card>
            </Grid>

            {/* Tendencias */}
            <Grid item xs={12}>
                <Card elevation={2}>
                    <CardHeader title="Análisis Temporal Comparativo" />
                    <CardContent>
                        <OperacionesChart data={data} variant="radar" />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderSeguridadCiudadana = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <ProblematicCard
                    title="Análisis de Detenidos"
                    data={data}
                    chartComponent={<DetenidosChart />}
                    variant="bars"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ProblematicCard
                    title="Tendencia Temporal"
                    data={data}
                    chartComponent={<DetenidosChart />}
                    variant="line"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ProblematicCard
                    title="Perfil Demográfico"
                    data={data}
                    chartComponent={<DetenidosChart />}
                    variant="doughnut"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ProblematicCard
                    title="KPIs de Seguridad"
                    data={data}
                    chartComponent={<DetenidosChart />}
                    variant="kpis"
                />
            </Grid>
        </Grid>
    );

    const renderOperaciones = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <ProblematicCard
                    title="Indicadores Operacionales"
                    data={data}
                    chartComponent={<OperacionesChart />}
                    variant="kpis"
                />
            </Grid>
            <Grid item xs={12} md={8}>
                <ProblematicCard
                    title="Recursos por Unidad"
                    data={data}
                    chartComponent={<OperacionesChart />}
                    variant="efficiency"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <ProblematicCard
                    title="Distribución de Controles"
                    data={data}
                    chartComponent={<OperacionesChart />}
                    variant="doughnut"
                />
            </Grid>
            <Grid item xs={12}>
                <ProblematicCard
                    title="Radar Operacional"
                    data={data}
                    chartComponent={<OperacionesChart />}
                    variant="radar"
                />
            </Grid>
        </Grid>
    );

    const renderInteligencia = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <ProblematicCard
                    title="KPIs de Incautaciones"
                    data={data}
                    chartComponent={<IncautacionesChart />}
                    variant="kpis"
                />
            </Grid>
            <Grid item xs={12} md={8}>
                <ProblematicCard
                    title="Análisis por Tipo"
                    data={data}
                    chartComponent={<IncautacionesChart />}
                    variant="treemap"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <ProblematicCard
                    title="Rangos de Valor"
                    data={data}
                    chartComponent={<IncautacionesChart />}
                    variant="doughnut"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ProblematicCard
                    title="Relación Valor-Frecuencia"
                    data={data}
                    chartComponent={<IncautacionesChart />}
                    variant="scatter"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ProblematicCard
                    title="Evolución Temporal"
                    data={data}
                    chartComponent={<IncautacionesChart />}
                    variant="line"
                />
            </Grid>
        </Grid>
    );

    const renderCurrentTab = () => {
        switch (activeTab) {
            case 0: return renderOverview();
            case 1: return renderSeguridadCiudadana();
            case 2: return renderOperaciones();
            case 3: return renderInteligencia();
            default: return renderOverview();
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    📊 Análisis de Problemáticas Operativas
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Dashboard especializado para análisis multidimensional de problemáticas de seguridad
                </Typography>
            </Box>

            {/* Tabs */}
            <Paper elevation={1} sx={{ mb: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {tabs.map((tab, index) => (
                        <Tab 
                            key={index}
                            label={tab.label} 
                            icon={tab.icon}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Content */}
            <Box sx={{ mt: 2 }}>
                {renderCurrentTab()}
            </Box>

            {/* Footer Info */}
            <Paper elevation={0} sx={{ mt: 4, p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="caption" color="text.secondary">
                    Dashboard actualizado con {data.length.toLocaleString()} registros operativos. 
                    Análisis basado en datos procesados con metodología de categorización jerárquica.
                </Typography>
            </Paper>
        </Box>
    );
};

export default ProblematicasDashboard;