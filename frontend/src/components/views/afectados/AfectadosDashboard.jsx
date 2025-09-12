import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Alert,
    Skeleton
} from '@mui/material';
import { analyticsService } from '../../../services/analyticsService';
import AfectadosKPIs from './AfectadosKPIs';
import AfectadosCharts from './AfectadosCharts';
import DashboardLayout from '../../common/DashboardLayout';

const AfectadosDashboard = ({ data, loading = false }) => {
    const analysis = useMemo(() => {
        if (!data || data.length === 0) return null;
        
        // Filtrar solo datos de personal/elementos afectados
        const afectados = data.filter(item => 
            item.CANT_EFECTIVOS || 
            item.CANT_AUTOS_CAMIONETAS || 
            item.CANT_SCANNERS ||
            item.CANT_EMBARCACIONES ||
            item.CANT_MOTOS ||
            item.CANT_CABALLOS ||
            item.CANT_CANES
        );

        if (afectados.length === 0) return null;

        return analyticsService.analyzeAfectados(afectados);
    }, [data]);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Personal y Elementos Afectados
                </Typography>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={400} />
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Personal y Elementos Afectados
                </Typography>
                <Alert severity="info">
                    No hay datos de personal afectado disponibles para mostrar.
                </Alert>
            </Box>
        );
    }

    if (!analysis) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Personal y Elementos Afectados
                </Typography>
                <Alert severity="warning">
                    No se encontraron datos válidos de personal afectado en el conjunto de datos.
                </Alert>
            </Box>
        );
    }

    return (
        <DashboardLayout title="Dashboard de Afectados">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Personal y Elementos Afectados
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Análisis detallado de recursos humanos y materiales desplegados en operaciones,
                    incluyendo efectivos, vehículos, equipos y distribución geográfica.
                </Typography>

                {/* KPIs principales */}
                <Box sx={{ mb: 4 }}>
                    <AfectadosKPIs analysis={analysis} />
                </Box>

                {/* Gráficos detallados */}
                <AfectadosCharts analysis={analysis} />
            </Box>
        </DashboardLayout>
    );
};

export default AfectadosDashboard;
