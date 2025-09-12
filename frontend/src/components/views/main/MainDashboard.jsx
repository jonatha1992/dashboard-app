import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Container,
    Paper,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Security as SecurityIcon,
    People as PeopleIcon,
    DirectionsCar as VehicleIcon,
    Assignment as ProcedureIcon,
    MonetizationOn as MoneyIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import ClassificationCard from '../../common/ClassificationCard';
import MetricCard from '../../common/MetricCard';
import DashboardLayout from '../../common/DashboardLayout';
import { useDashboard } from '../../../contexts/DashboardContext';

const MainDashboard = () => {
    const navigate = useNavigate();
    const { data, filteredCategorizedData, loading } = useDashboard();

    const classifications = useMemo(() => {
        // Usar datos categorizados del backend en lugar de filtrar manualmente
        const categorizedData = filteredCategorizedData || {};
        
        console.log('📊 MainDashboard: Datos categorizados recibidos:', Object.keys(categorizedData).map(k => `${k}: ${categorizedData[k]?.length || 0}`).join(', '));

        return [
            {
                id: 'procedimientos',
                title: 'Procedimientos',
                totalCases: categorizedData.procedimientos?.length || 0,
                trend: 5.2,
                icon: ProcedureIcon,
                color: 'primary',
                route: '/dashboard/procedimientos'
            },
            {
                id: 'detenidos',
                title: 'Detenidos',
                totalCases: categorizedData.detenidos?.length || 0,
                trend: -2.1,
                icon: PeopleIcon,
                color: 'error',
                route: '/dashboard/detenidos'
            },
            {
                id: 'incautaciones',
                title: 'Incautaciones',
                totalCases: categorizedData.incautaciones?.length || 0,
                trend: 8.7,
                icon: SecurityIcon,
                color: 'warning',
                route: '/dashboard/incautaciones'
            },
            {
                id: 'afectados',
                title: 'Personal Afectado',
                totalCases: categorizedData.afectados?.length || 0,
                trend: 3.4,
                icon: PeopleIcon,
                color: 'success',
                route: '/dashboard/afectados'
            },
            {
                id: 'controlados',
                title: 'Controlados',
                totalCases: categorizedData.controlados?.length || 0,
                trend: -1.8,
                icon: VehicleIcon,
                color: 'info',
                route: '/dashboard/controlados'
            },
            {
                id: 'trata',
                title: 'Trata y Tráfico',
                totalCases: categorizedData.trata?.length || 0,
                trend: 12.3,
                icon: WarningIcon,
                color: 'secondary',
                route: '/dashboard/trata'
            }
        ];
    }, [filteredCategorizedData]);

    const handleCardDoubleClick = (classification) => {
        navigate(classification.route);
    };


    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
                    Dashboard Principal - Cargando...
                </Typography>
            </Container>
        );
    }

    return (
        <DashboardLayout title="Dashboard Principal" showBackButton={false}>
            <Box sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Dashboard Operativo
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Resumen ejecutivo de todas las clasificaciones operativas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Haga clic en cualquier tarjeta para acceder al dashboard especializado
                    </Typography>
                </Box>

            <Grid container spacing={2}>
                {classifications.map((classification) => (
                    <Grid item xs={12} sm={6} md={4} key={classification.id}>
                        <ClassificationCard
                            title={classification.title}
                            totalCases={classification.totalCases}
                            trend={classification.trend}
                            icon={classification.icon}
                            color={classification.color}
                            onClick={() => handleCardDoubleClick(classification)}
                        />
                    </Grid>
                ))}
            </Grid>

                <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Métricas Generales del Sistema
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {data?.length?.toLocaleString() || '0'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Total Registros
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    {classifications.filter(c => c.totalCases > 0).length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Clasificaciones Activas
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                    {Math.max(...classifications.map(c => c.totalCases), 0).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Mayor Volumen
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                                    {new Date().toLocaleDateString('es-AR')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Última Actualización
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            📊 Período de datos: Enero 2024 - {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            🔄 Datos actualizados automáticamente cada 24 horas
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </DashboardLayout>
    );
};

export default MainDashboard;
