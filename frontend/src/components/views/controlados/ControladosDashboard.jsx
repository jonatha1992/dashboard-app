import React from 'react';
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
                <div className="p-4">
                    <div className="text-white">Cargando...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (controladosData.length === 0) {
        return (
            <DashboardLayout title="Dashboard de Controlados">
                <div className="p-4">
                    <div className="bg-blue-500/20 text-blue-300 border border-blue-500/30 p-4 rounded-lg">
                        No hay datos de controles disponibles. Ajusta los filtros o verifica la carga de datos.
                    </div>
                </div>
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
            <div className="p-4">
                {/* Panel de Filtros Integrado */}
                <div className="mb-5">
                    <FilterPanel inline={true} compact={true} />
                </div>

                {/* KPIs principales */}
                <div className="mb-5">
                    <ControladosKPIs analysis={analysis} />
                </div>

                {/* Gráficos dinámicos */}
                <DynamicChartsByCategory category="controlados" />
            </div>
        </DashboardLayout>
    );
};

export default ControladosDashboard;

