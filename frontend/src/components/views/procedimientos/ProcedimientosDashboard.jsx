import React, { useEffect, useMemo } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import DashboardLayout from '../../common/DashboardLayout';
import FilterPanel from '../../dashboard/FilterPanel';
import DynamicChartsByCategory from '../../charts/DynamicChartsByCategory';
import ProcedimientosKPIs from './ProcedimientosKPIs';
import LoadingSpinner from '../../common/LoadingSpinner';

const ProcedimientosDashboard = () => {
    const { filteredCategorizedData, loading, filters, clearFilters } = useDashboard();
    const procedimientosData = filteredCategorizedData?.procedimientos || [];
    const hasActiveFilters = useMemo(
        () => Object.values(filters || {}).some((value) => Boolean(value)),
        [filters]
    );
    useEffect(() => {
        console.groupCollapsed('ProcedimientosDashboard: estado de datos');
        console.debug('Registros filtrados', procedimientosData.length);
        console.debug('Filtros activos', filters);
        console.debug('Estado de carga', loading);
        console.groupEnd();
    }, [procedimientosData.length, filters, loading]);
    
    if (loading) {
        return (
            <DashboardLayout title="Dashboard de Procedimientos">
                <div className="p-4">
                    <LoadingSpinner label="Cargando datos de procedimientos" />
                </div>
            </DashboardLayout>
        );
    }

    if (procedimientosData.length === 0) {
        console.warn('ProcedimientosDashboard: no hay datos para los filtros', filters);
        return (
            <DashboardLayout title="Dashboard de Procedimientos">
                <div className="p-4 space-y-5">
                    <FilterPanel inline={true} compact={true} />
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/15 p-4 text-blue-100">
                        <p className="font-semibold text-blue-50">
                            No hay datos que coincidan con los criterios seleccionados.
                        </p>
                        <p className="mt-2 text-sm text-blue-200">
                            Ajusta los filtros para ver resultados disponibles.
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-4 rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Generar KPIs basicos para procedimientos
    const analysis = {
        totalProcedimientos: procedimientosData.length,
        tasaExito: 85,
        tiempoPromedio: 15,
        eficienciaGeneral: 78,
        crecimientoMensual: 5.2
    };

    return (
        <DashboardLayout title="Dashboard de Procedimientos">
            <div className="p-4">
                {/* Panel de Filtros Integrado */}
                <div className="mb-5">
                    <FilterPanel inline={true} compact={true} />
                </div>

                {/* KPIs principales */}
                <div className="mb-5">
                    <ProcedimientosKPIs analysis={analysis} />
                </div>

                {/* Graficos dinamicos */}
                <DynamicChartsByCategory category="procedimientos" />
            </div>
        </DashboardLayout>
    );
};

export default ProcedimientosDashboard;


