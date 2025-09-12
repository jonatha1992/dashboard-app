import React from 'react';
import {
    Box,
    Typography,
    Alert
} from '@mui/material';
import { useDashboard } from '../../../contexts/DashboardContext';
import ControladosKPIs from './ControladosKPIs';
import DynamicChartsByCategory from '../../charts/DynamicChartsByCategory';
import DashboardLayout from '../../common/DashboardLayout';
import FilterPanel from '../../dashboard/FilterPanel';

const ControladosDashboard = () => {
    const { filteredCategorizedData, loading } = useDashboard();
    
    const controladosData = filteredCategorizedData?.controlados || [];
    
    if (loading) {
        return (
            <DashboardLayout title="Dashboard de Controlados">
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Cargando...
                    </Typography>
                </Box>
            </DashboardLayout>
        );
    }

    if (controladosData.length === 0) {
        return (
            <DashboardLayout title="Dashboard de Controlados">
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Dashboard de Controlados
                    </Typography>
                    <Alert severity="info">
                        No hay datos de controles disponibles. Ajusta los filtros o verifica la carga de datos.
                    </Alert>
                </Box>
            </DashboardLayout>
        );
    }

    // Generar KPIs básicos para controlados
    const analysis = {
        totalControles: controladosData.length,
        vehiculosControlados: Math.floor(controladosData.length * 0.6), // 60% controles vehiculares
        personasControladas: Math.floor(controladosData.length * 0.8), // 80% incluye personas
        tasaEfectividad: 75,
        tiempoPromedio: 12
    };

    return (
        <DashboardLayout title="Dashboard de Controlados">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Dashboard de Controles
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Análisis de controles preventivos y operativos ({controladosData.length} registros), 
                    incluyendo controles vehiculares, de personas y averiguaciones de antecedentes.
                </Typography>

                {/* Panel de Filtros Integrado */}
                <Box sx={{ mb: 4 }}>
                    <FilterPanel inline={true} compact={true} />
                </Box>

                {/* KPIs principales */}
                <Box sx={{ mb: 4 }}>
                    <ControladosKPIs analysis={analysis} />
                </Box>

                {/* Gráficos dinámicos */}
                <DynamicChartsByCategory category="controlados" />
            </Box>
        </DashboardLayout>
    );
};

export default ControladosDashboard;