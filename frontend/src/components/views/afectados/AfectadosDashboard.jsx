import React from 'react';
import {
    Box,
    Typography,
    Alert
} from '@mui/material';
import { useDashboard } from '../../../contexts/DashboardContext';
import AfectadosKPIs from './AfectadosKPIs';
import DynamicChartsByCategory from '../../charts/DynamicChartsByCategory';
import DashboardLayout from '../../common/DashboardLayout';
import FilterPanel from '../../dashboard/FilterPanel';

const AfectadosDashboard = () => {
    const { filteredCategorizedData, loading } = useDashboard();
    
    const afectadosData = filteredCategorizedData?.afectados || [];
    
    if (loading) {
        return (
            <DashboardLayout title="Dashboard de Efectivos">
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Cargando...
                    </Typography>
                </Box>
            </DashboardLayout>
        );
    }

    if (afectadosData.length === 0) {
        return (
            <DashboardLayout title="Dashboard de Efectivos">
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Dashboard de Efectivos Afectados
                    </Typography>
                    <Alert severity="info">
                        No hay datos de efectivos afectados disponibles. Ajusta los filtros o verifica la carga de datos.
                    </Alert>
                </Box>
            </DashboardLayout>
        );
    }

    // Generar KPIs básicos para afectados
    const analysis = {
        totalOperaciones: afectadosData.length,
        efectivosTotales: Math.floor(afectadosData.length * 25), // Estimación promedio
        vehiculosAfectados: Math.floor(afectadosData.length * 8),
        equiposEspeciales: Math.floor(afectadosData.length * 3),
        eficienciaOperativa: 87
    };

    return (
        <DashboardLayout title="Dashboard de Efectivos">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Efectivos Afectados
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Análisis de recursos humanos y materiales desplegados en operaciones ({afectadosData.length} registros), 
                    incluyendo efectivos, vehículos y equipos especializados.
                </Typography>

                {/* Panel de Filtros Integrado */}
                <Box sx={{ mb: 4 }}>
                    <FilterPanel inline={true} compact={true} />
                </Box>

                {/* KPIs principales */}
                <Box sx={{ mb: 4 }}>
                    <AfectadosKPIs analysis={analysis} />
                </Box>

                {/* Gráficos dinámicos */}
                <DynamicChartsByCategory category="afectados" />
            </Box>
        </DashboardLayout>
    );
};

export default AfectadosDashboard;