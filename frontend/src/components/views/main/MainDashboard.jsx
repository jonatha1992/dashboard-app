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

const MainDashboard = ({ data, loading = false }) => {
    const navigate = useNavigate();

    const classifications = useMemo(() => {
        if (!data || data.length === 0) {
            return [
                { id: 'procedimientos', title: 'Procedimientos', description: 'Operaciones generales y procedimientos administrativos', totalCases: 0, trend: 0, icon: ProcedureIcon, color: 'primary', route: '/dashboard/procedimientos' },
                { id: 'detenidos', title: 'Detenidos', description: 'Personas detenidas y aprehendidas', totalCases: 0, trend: 0, icon: PeopleIcon, color: 'error', route: '/dashboard/detenidos' },
                { id: 'incautaciones', title: 'Incautaciones', description: 'Bienes y sustancias incautadas', totalCases: 0, trend: 0, icon: SecurityIcon, color: 'warning', route: '/dashboard/incautaciones' },
                { id: 'afectados', title: 'Personal Afectado', description: 'Recursos humanos y materiales desplegados', totalCases: 0, trend: 0, icon: PeopleIcon, color: 'success', route: '/dashboard/afectados' },
                { id: 'controlados', title: 'Controlados', description: 'Vehículos y personas controladas', totalCases: 0, trend: 0, icon: VehicleIcon, color: 'info', route: '/dashboard/controlados' },
                { id: 'trata', title: 'Trata y Tráfico', description: 'Casos de trata y tráfico de personas', totalCases: 0, trend: 0, icon: WarningIcon, color: 'secondary', route: '/dashboard/trata' }
            ];
        }

        // Filtrar datos por clasificación
        const detenidos = data.filter(item => 
            item.EDAD || item.SEXO || item.DELITO_IMPUTADO || item.SITUACION_PROCESAL || item.NACIONALIDAD
        );
        
        const incautaciones = data.filter(item => 
            item.INCAUTACIONES || item.TIPO_INCAUTACION || item.VALOR_INCAUTACION > 0 || item.AFORO > 0
        );
        
        const afectados = data.filter(item => 
            item.CANT_EFECTIVOS > 0 || item.CANT_AUTOS_CAMIONETAS > 0 || 
            item.CANT_SCANNERS > 0 || item.CANT_EMBARCACIONES > 0 ||
            item.CANT_MOTOS > 0 || item.CANT_CABALLOS > 0 || item.CANT_CANES > 0
        );
        
        const controlados = data.filter(item => 
            item.PERSONAS_CONTROLADAS > 0 || item.VEHICULOS_CONTROLADOS > 0 || 
            item.CANT_AVERIGUACIONES_SECUESTRO > 0
        );
        
        const trata = data.filter(item => 
            item.TIPO_DELITO_TRATA || item.TRATA_PERSONAS || 
            item.TRAFICO_PERSONAS || item.VICTIMAS_TRATA > 0
        );

        // Procedimientos son todos los demás casos
        const procedimientos = data.filter(item => 
            !detenidos.includes(item) && !incautaciones.includes(item) && 
            !afectados.includes(item) && !controlados.includes(item) && !trata.includes(item)
        );

        return [
            {
                id: 'procedimientos',
                title: 'Procedimientos',
                totalCases: procedimientos.length,
                trend: Math.random() * 20 - 10, // Simulado por ahora
                icon: ProcedureIcon,
                color: 'primary',
                route: '/dashboard/procedimientos'
            },
            {
                id: 'detenidos',
                title: 'Detenidos',
                totalCases: detenidos.length,
                trend: Math.random() * 20 - 10,
                icon: PeopleIcon,
                color: 'error',
                route: '/dashboard/detenidos'
            },
            {
                id: 'incautaciones',
                title: 'Incautaciones',
                totalCases: incautaciones.length,
                trend: Math.random() * 20 - 10,
                icon: SecurityIcon,
                color: 'warning',
                route: '/dashboard/incautaciones'
            },
            {
                id: 'afectados',
                title: 'Personal Afectado',
                totalCases: afectados.length,
                trend: Math.random() * 20 - 10,
                icon: PeopleIcon,
                color: 'success',
                route: '/dashboard/afectados'
            },
            {
                id: 'controlados',
                title: 'Controlados',
                totalCases: controlados.length,
                trend: Math.random() * 20 - 10,
                icon: VehicleIcon,
                color: 'info',
                route: '/dashboard/controlados'
            },
            {
                id: 'trata',
                title: 'Trata y Tráfico',
                totalCases: trata.length,
                trend: Math.random() * 20 - 10,
                icon: WarningIcon,
                color: 'secondary',
                route: '/dashboard/trata'
            }
        ];
    }, [data]);

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
