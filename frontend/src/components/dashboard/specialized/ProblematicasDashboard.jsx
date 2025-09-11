import React, { useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Security,
    Gavel,
    DirectionsCar,
    Assessment,
    TrendingUp,
    Groups,
    LocalPolice,
    AccountBalance,
    PersonRemove,
    ShoppingCart
} from '@mui/icons-material';

import DetenidosChart from '../../charts/specialized/DetenidosChart';
import IncautacionesChart from '../../charts/specialized/IncautacionesChart';
import OperacionesChart from '../../charts/specialized/OperacionesChart';
import AbatidosChart from '../../charts/specialized/AbatidosChart';
import TrataChart from '../../charts/specialized/TrataChart';
import ProcedimientosChart from '../../charts/specialized/ProcedimientosChart';
import analyticsService from '../../../services/analyticsService';
import { useDashboard } from '../../../contexts/DashboardContext';

const ProblematicasDashboard = () => {
    const { data, filteredData, loading, error, filteredCategorizedData } = useDashboard();

    // Análisis general usando datos filtrados
    const generalAnalysis = useMemo(() => {
        const dataToUse = filteredData && filteredData.length > 0 ? filteredData : data;
        if (!dataToUse || dataToUse.length === 0) return null;
        return {
            ranking: analyticsService.generateRankingProblematicas(dataToUse),
            trends: analyticsService.generateTrendAnalysis(dataToUse, 'monthly')
        };
    }, [data, filteredData]);

    // Configuración de categorías con iconografía y colores profesionales
    const categories = useMemo(() => ([
        {
            key: 'detenidos',
            title: 'Detenidos',
            color: '#d32f2f',
            icon: <LocalPolice />,
            description: 'Personas detenidas en operativos'
        },
        {
            key: 'incautaciones',
            title: 'Incautaciones',
            color: '#f57c00',
            icon: <ShoppingCart />,
            description: 'Material y elementos incautados'
        },
        {
            key: 'controlados',
            title: 'Controles',
            color: '#388e3c',
            icon: <DirectionsCar />,
            description: 'Personas y vehículos controlados'
        },
        {
            key: 'afectados',
            title: 'Personal Afectado',
            color: '#1976d2',
            icon: <Groups />,
            description: 'Personal policial afectado'
        },
        {
            key: 'abatidos',
            title: 'Abatidos',
            color: '#424242',
            icon: <PersonRemove />,
            description: 'Personas abatidas en enfrentamientos'
        },
        {
            key: 'trata',
            title: 'Trata y Tráfico',
            color: '#7b1fa2',
            icon: <Security />,
            description: 'Casos de trata de personas y tráfico'
        },
        {
            key: 'procedimientos',
            title: 'Procedimientos',
            color: '#0277bd',
            icon: <AccountBalance />,
            description: 'Procedimientos judiciales iniciados'
        }
    ]), []);

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

    // Tarjeta profesional con diseño mejorado
    const CategoryCard = ({ category, kpiValue, children }) => (
        <Card
            elevation={3}
            sx={{
                height: 450,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    elevation: 6,
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                },
                borderTop: `4px solid ${category.color}`,
                overflow: 'hidden'
            }}
        >
            <CardHeader
                avatar={
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: category.color + '15',
                            color: category.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {category.icon}
                    </Box>
                }
                title={
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {category.title}
                    </Typography>
                }
                subheader={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {category.description}
                    </Typography>
                }
                sx={{ pb: 1 }}
            />

            <Box sx={{ px: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: category.color,
                            lineHeight: 1
                        }}
                    >
                        {kpiValue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        registros
                    </Typography>
                </Box>
                <Divider sx={{ mt: 1, mb: 2 }} />
            </Box>

            <CardContent sx={{
                pt: 0,
                pb: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                <Box sx={{
                    flexGrow: 1,
                    position: 'relative',
                    minHeight: 250
                }}>
                    {children}
                </Box>
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

    const dataToUse = filteredData && filteredData.length > 0 ? filteredData : data;
    const getCategoryCount = (key) => {
        if (!filteredCategorizedData || !filteredCategorizedData[key]) return 0;
        return filteredCategorizedData[key].length;
    };

    // Renderizar componente de gráfico según categoría
    const renderCategoryChart = (categoryKey) => {
        const chartProps = { data: dataToUse, style: { width: '100%', height: '100%' } };

        switch (categoryKey) {
            case 'detenidos':
                return <DetenidosChart {...chartProps} variant="bars" />;
            case 'incautaciones':
                return <IncautacionesChart {...chartProps} variant="doughnut" />;
            case 'controlados':
                return <OperacionesChart {...chartProps} variant="radar" />;
            case 'afectados':
                return <OperacionesChart {...chartProps} variant="kpis" />;
            case 'abatidos':
                return <AbatidosChart {...chartProps} variant="bars" />;
            case 'trata':
                return <TrataChart {...chartProps} variant="victims" />;
            case 'procedimientos':
                return <ProcedimientosChart {...chartProps} variant="doughnut" />;
            default:
                return (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'text.secondary'
                    }}>
                        <Typography variant="caption">Sin datos disponibles</Typography>
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ width: '100%', px: { xs: 0, sm: 1 } }}>
            {/* Header profesional */}
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        p: 2,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Assessment sx={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Análisis de Problemáticas Operativas
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                            Dashboard especializado para análisis multidimensional de problemáticas de seguridad
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label={`${dataToUse.length.toLocaleString()} registros`}
                                size="small"
                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                            <Chip
                                label={`${categories.length} categorías`}
                                size="small"
                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Grid responsivo de tarjetas */}
            <Grid container spacing={3}>
                {categories.map(category => (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={4}
                        xl={3}
                        key={category.key}
                    >
                        <CategoryCard
                            category={category}
                            kpiValue={getCategoryCount(category.key)}
                        >
                            {renderCategoryChart(category.key)}
                        </CategoryCard>
                    </Grid>
                ))}
            </Grid>

            {/* Footer informativo */}
            <Paper
                elevation={1}
                sx={{
                    mt: 6,
                    p: 3,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200'
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 0.5 }}>
                            📊 Resumen del Dashboard
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Dashboard actualizado con {data.length.toLocaleString()} registros operativos.
                            Análisis basado en datos procesados con metodología de categorización jerárquica.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Chip
                                label="Tiempo real"
                                size="small"
                                color="success"
                                variant="outlined"
                            />
                            <Chip
                                label="Actualizado"
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ProblematicasDashboard;