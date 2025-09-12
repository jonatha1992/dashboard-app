import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Alert,
    Skeleton
} from '@mui/material';
import { analyticsService } from '../../../services/analyticsService';
import DetenidosKPIs from './DetenidosKPIs';
import DetenidosCharts from './DetenidosCharts';
import DashboardLayout from '../../common/DashboardLayout';
import FilterPanel from '../../common/FilterPanel';

const DetenidosDashboard = ({ data, loading = false }) => {
    const [filters, setFilters] = useState({});
    
    const analysis = useMemo(() => {
        if (!data || data.length === 0) return null;
        
        // Filtrar solo datos de detenidos
        const detenidos = data.filter(item => 
            item.EDAD || 
            item.SEXO || 
            item.DELITO_IMPUTADO ||
            item.SITUACION_PROCESAL ||
            item.NACIONALIDAD
        );

        if (detenidos.length === 0) return null;

        return analyticsService.analyzeDetenidos(detenidos);
    }, [data]);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Detenidos
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
                    Dashboard de Detenidos
                </Typography>
                <Alert severity="info">
                    No hay datos de detenidos disponibles para mostrar.
                </Alert>
            </Box>
        );
    }

    if (!analysis) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Detenidos
                </Typography>
                <Alert severity="warning">
                    No se encontraron datos válidos de detenidos en el conjunto de datos.
                </Alert>
            </Box>
        );
    }

    const availableDelitos = data ? [...new Set(data.filter(item => item.DELITO_IMPUTADO).map(item => item.DELITO_IMPUTADO))] : [];
    const availableProvinces = data ? [...new Set(data.filter(item => item.PROVINCIA).map(item => item.PROVINCIA))] : [];

    return (
        <DashboardLayout title="Dashboard de Detenidos">
            <Box sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Dashboard de Detenidos y Aprehendidos
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Análisis detallado de personas detenidas y aprehendidas, incluyendo demografía, 
                    tipos de delitos y tendencias temporales.
                </Typography>

                {/* Panel de Filtros */}
                <FilterPanel 
                    filters={filters}
                    onFiltersChange={setFilters}
                    availableProvinces={availableProvinces}
                    availableDelitos={availableDelitos}
                />

                {/* KPIs principales */}
                <Box sx={{ mb: 3 }}>
                    <DetenidosKPIs analysis={analysis} />
                </Box>

                {/* Gráficos detallados */}
                <DetenidosCharts analysis={analysis} />
            </Box>
        </DashboardLayout>
    );
};

export default DetenidosDashboard;
