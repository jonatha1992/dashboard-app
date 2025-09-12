import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Alert,
    Skeleton
} from '@mui/material';
import { analyticsService } from '../../../services/analyticsService';
import ControladosKPIs from './ControladosKPIs';
import ControladosCharts from './ControladosCharts';
import DashboardLayout from '../../common/DashboardLayout';

const ControladosDashboard = ({ data, loading = false }) => {
    const analysis = useMemo(() => {
        if (!data || data.length === 0) return null;
        
        const controlados = data.filter(item => 
            item.VEHICULOS_CONTROLADOS || 
            item.PERSONAS_CONTROLADAS || 
            item.CANT_AVERIGUACIONES_SECUESTRO
        );

        if (controlados.length === 0) return null;
        return analyticsService.analyzeControlados(controlados);
    }, [data]);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Controles
                </Typography>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={400} />
            </Box>
        );
    }

    if (!analysis) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Controles
                </Typography>
                <Alert severity="info">
                    No hay datos de controles disponibles.
                </Alert>
            </Box>
        );
    }

    return (
        <DashboardLayout title="Dashboard de Controlados">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Vehículos y Personas Controladas
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Análisis detallado de controles realizados sobre vehículos y personas,
                    incluyendo averiguaciones, secuestros y efectividad operativa.
                </Typography>

                {/* KPIs principales */}
                <Box sx={{ mb: 4 }}>
                    <ControladosKPIs analysis={analysis} />
                </Box>

                {/* Gráficos detallados */}
                <ControladosCharts analysis={analysis} />
            </Box>
        </DashboardLayout>
    );
};

export default ControladosDashboard;
