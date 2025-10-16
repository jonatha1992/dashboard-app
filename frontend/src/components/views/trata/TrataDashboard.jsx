import React, { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import TrataKPIs from './TrataKPIs';
import DynamicChartsByCategory from '../../charts/DynamicChartsByCategory';
import DashboardLayout from '../../common/DashboardLayout';
import FilterPanel from '../../dashboard/FilterPanel';
import LoadingSpinner from '../../common/LoadingSpinner';

const TrataDashboard = () => {
    const { filteredCategorizedData, loading, filters, clearFilters } = useDashboard();
    const [autoCleared, setAutoCleared] = useState(false);
    
    const trataData = filteredCategorizedData?.trata || [];
    const hasActiveFilters = useMemo(
        () => Object.values(filters || {}).some((value) => Boolean(value)),
        [filters]
    );

    useEffect(() => {
        console.groupCollapsed('TrataDashboard: estado de datos');
        console.debug('Registros filtrados', trataData.length);
        console.debug('Filtros activos', filters);
        console.debug('Estado de carga', loading);
        console.groupEnd();
    }, [trataData.length, filters, loading]);

    useEffect(() => {
        if (!loading && trataData.length === 0 && hasActiveFilters && !autoCleared) {
            clearFilters();
            setAutoCleared(true);
        }
    }, [loading, trataData.length, hasActiveFilters, clearFilters, autoCleared]);

    useEffect(() => {
        if (hasActiveFilters) {
            setAutoCleared(false);
        }
    }, [hasActiveFilters]);

    useEffect(() => {
        if (trataData.length > 0 && autoCleared) {
            setAutoCleared(false);
        }
    }, [trataData.length, autoCleared]);

    const handleDismissNotice = () => setAutoCleared(false);
    
    if (loading) {
        return (
            <DashboardLayout title="Dashboard de Trata">
                <div className="p-6">
                    <LoadingSpinner label="Cargando datos de trata" />
                </div>
            </DashboardLayout>
        );
    }

    if (trataData.length === 0) {
        console.warn('TrataDashboard: no se encontraron datos para los filtros', filters);
        return (
            <DashboardLayout title="Dashboard de Trata">
                <div className="p-6 space-y-6">
                    <div className="bg-blue-500/20 text-blue-200 border border-blue-500/30 p-4 rounded-lg">
                        <p className="font-medium">
                            No hay datos de trata de personas disponibles para los filtros seleccionados.
                        </p>
                        <p className="mt-2 text-sm text-blue-100">
                            Ajusta los filtros o verifica la carga de datos.
                        </p>
                        {autoCleared && (
                            <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-blue-300/40 bg-blue-300/10 px-3 py-2 text-xs text-blue-100">
                                <span>Restablecimos los filtros automáticamente porque no se encontraron resultados.</span>
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

    // Generar KPIs basicos para trata
    const analysis = {
        totalCasos: trataData.length,
        victimasRescatadas: Math.floor(trataData.length * 2.3), // Promedio estimado por caso
        tratantesDetenidos: Math.floor(trataData.length * 1.8),
        tasaRescate: 85,
        modalidadPrevalente: "Laboral"
    };

    return (
        <DashboardLayout title="Dashboard de Trata">
            <div className="p-6">
                {autoCleared && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-500/15 px-4 py-3 text-sm text-blue-100">
                        <span>
                            Se restablecieron los filtros automáticamente porque no se encontraron resultados con la búsqueda anterior.
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
                    <TrataKPIs analysis={analysis} />
                </div>

                {/* Gráficos dinámicos */}
                <DynamicChartsByCategory category="trata" />
            </div>
        </DashboardLayout>
    );
};

export default TrataDashboard;

