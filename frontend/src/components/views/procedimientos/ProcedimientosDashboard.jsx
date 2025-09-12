import React from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import DashboardLayout from '../../common/DashboardLayout';
import FilterPanel from '../../dashboard/FilterPanel';
import DynamicChartsByCategory from '../../charts/DynamicChartsByCategory';
import ProcedimientosKPIs from './ProcedimientosKPIs';

const ProcedimientosDashboard = () => {
    const { filteredCategorizedData, loading } = useDashboard();
    
    const procedimientosData = filteredCategorizedData?.procedimientos || [];
    
    if (loading) {
        return (
            <DashboardLayout title="Dashboard de Procedimientos">
                <div className="p-6">
                    <div className="text-white">Cargando...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (procedimientosData.length === 0) {
        return (
            <DashboardLayout title="Dashboard de Procedimientos">
                <div className="p-6">
                    <div className="bg-blue-500/20 text-blue-300 border border-blue-500/30 p-4 rounded-lg">
                        No hay datos de procedimientos disponibles. Ajusta los filtros o verifica la carga de datos.
                    </div>
                </div>
            </DashboardLayout>
        );
    }
        
    
    // Generar KPIs básicos para procedimientos
    const analysis = {
        totalProcedimientos: procedimientosData.length,
        tasaExito: 85,
        tiempoPromedio: 15,
        eficienciaGeneral: 78,
        crecimientoMensual: 5.2
    };

    return (
        <DashboardLayout title="Dashboard de Procedimientos">
            <div className="p-6">
                {/* Panel de Filtros Integrado */}
                <div className="mb-8">
                    <FilterPanel inline={true} compact={true} />
                </div>

                {/* KPIs principales */}
                <div className="mb-8">
                    <ProcedimientosKPIs analysis={analysis} />
                </div>

                {/* Gráficos dinámicos */}
                <DynamicChartsByCategory category="procedimientos" />
            </div>
        </DashboardLayout>
    );
};

export default ProcedimientosDashboard;
