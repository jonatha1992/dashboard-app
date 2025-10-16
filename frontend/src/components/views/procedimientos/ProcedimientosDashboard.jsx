import React, { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import DashboardLayout from '../../common/DashboardLayout';
import FilterPanel from '../../dashboard/FilterPanel';
import DynamicChartsByCategory from '../../charts/DynamicChartsByCategory';
import ProcedimientosKPIs from './ProcedimientosKPIs';
import LoadingSpinner from '../../common/LoadingSpinner';

const ProcedimientosDashboard = () => {
    const { filteredCategorizedData, loading, filters, clearFilters } = useDashboard();
    const [autoCleared, setAutoCleared] = useState(false);
    
    const procedimientosData = filteredCategorizedData?.procedimientos || [];
    const hasActiveFilters = useMemo(
        () => Object.values(filters || {}).some((value) => Boolean(value)),
        [filters]
    );
    const handleDismissNotice = () => setAutoCleared(false);

    useEffect(() => {
        if (!loading && procedimientosData.length === 0 && hasActiveFilters && !autoCleared) {
            clearFilters();
            setAutoCleared(true);
        }
    }, [loading, procedimientosData.length, hasActiveFilters, clearFilters, autoCleared]);

    useEffect(() => {
        if (hasActiveFilters) {
            setAutoCleared(false);
        }
    }, [hasActiveFilters]);

    useEffect(() => {
        if (procedimientosData.length > 0 && autoCleared) {
            setAutoCleared(false);
        }
    }, [procedimientosData.length, autoCleared]);
    
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
                <div className="p-6">
                    <LoadingSpinner label="Cargando datos de procedimientos" />
                </div>
            </DashboardLayout>
        );
    }

    if (procedimientosData.length === 0) {
        console.warn('ProcedimientosDashboard: no hay datos para los filtros', filters);
        return (
            <DashboardLayout title="Dashboard de Procedimientos">
                <div className="p-6 space-y-6">
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/20 p-4 text-blue-200">
                        <p className="font-medium">
                            No hay datos de procedimientos disponibles para los filtros seleccionados.
                        </p>
                        <p className="mt-2 text-sm text-blue-100">
                            Ajusta los filtros o verifica la carga de datos.
                        </p>
                        {autoCleared && (
                            <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-blue-300/40 bg-blue-300/10 px-3 py-2 text-xs text-blue-100">
                                <span>Restablecimos los filtros automaticamente porque no se encontraron resultados.</span>
                                <button
                                    type="button"
                                    onClick={handleDismissNotice}
                                    className="rounded bg-blue-400/30 px-2 py-1 font-semibold text-white hover:bg-blue-400/50"
                                >
                                    Entendido
                                </button>
                            </div>
                        )}
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
                    <FilterPanel />
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
            <div className="p-6">
                {autoCleared && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-500/15 px-4 py-3 text-sm text-blue-100">
                        <span>
                            Se restablecieron los filtros automaticamente porque no se encontraron resultados con la busqueda anterior.
                        </span>
                        <button
                            type="button"
                            onClick={handleDismissNotice}
                            className="rounded-md bg-blue-500/60 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500/80"
                        >
                            Ocultar
                        </button>
                    </div>
                )}
                {/* Panel de Filtros Integrado */}
                <div className="mb-8">
                    <FilterPanel inline={true} compact={true} />
                </div>

                {/* KPIs principales */}
                <div className="mb-8">
                    <ProcedimientosKPIs analysis={analysis} />
                </div>

                {/* Graficos dinamicos */}
                <DynamicChartsByCategory category="procedimientos" />
            </div>
        </DashboardLayout>
    );
};

export default ProcedimientosDashboard;
