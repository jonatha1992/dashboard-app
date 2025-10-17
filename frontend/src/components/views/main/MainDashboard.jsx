import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassificationCard from '../../common/ClassificationCard';
import DashboardLayout from '../../common/DashboardLayout';
import { useDashboard } from '../../../contexts/DashboardContext';
import FilterPanel from '../../dashboard/FilterPanel';

const MainDashboard = () => {
    const navigate = useNavigate();
    const { data, filteredData, filteredCategorizedData, loading } = useDashboard();

    const classifications = useMemo(() => {
        // Usar datos categorizados del backend en lugar de filtrar manualmente
        const categorizedData = filteredCategorizedData || {};

        console.log('📊 MainDashboard: Datos categorizados recibidos:', Object.keys(categorizedData).map(k => `${k}: ${categorizedData[k]?.length || 0}`).join(', '));

        return [
            {
                id: 'procedimientos',
                title: 'Procedimientos',
                totalCases: categorizedData.procedimientos?.length || 0,
                trend: 5.2,
                icon: '📋',
                color: 'blue',
                route: '/dashboard/procedimientos'
            },
            {
                id: 'detenidos',
                title: 'Detenidos',
                totalCases: categorizedData.detenidos?.length || 0,
                trend: -2.1,
                icon: '👥',
                color: 'red',
                route: '/dashboard/detenidos'
            },
            {
                id: 'incautaciones',
                title: 'Incautaciones',
                totalCases: categorizedData.incautaciones?.length || 0,
                trend: 8.7,
                icon: '🔒',
                color: 'yellow',
                route: '/dashboard/incautaciones'
            },
            {
                id: 'afectados',
                title: 'Personal Afectado',
                totalCases: categorizedData.afectados?.length || 0,
                trend: 3.4,
                icon: '🚑',
                color: 'green',
                route: '/dashboard/afectados'
            },
            {
                id: 'controlados',
                title: 'Controlados',
                totalCases: categorizedData.controlados?.length || 0,
                trend: -1.8,
                icon: '🚗',
                color: 'cyan',
                route: '/dashboard/controlados'
            },
            {
                id: 'trata',
                title: 'Trata y Tráfico',
                totalCases: categorizedData.trata?.length || 0,
                trend: 12.3,
                icon: '⚠️',
                color: 'purple',
                route: '/dashboard/trata'
            }
        ];
    }, [filteredCategorizedData]);

    const handleCardDoubleClick = (classification) => {
        navigate(classification.route);
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-primary">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-500"></div>
                    <h2 className="mt-4 text-2xl font-bold text-white">Dashboard Principal - Cargando...</h2>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout title="Dashboard Principal" showBackButton={false}>
            <div className="py-6">
                <div className="mb-5">
                    <FilterPanel inline={true} compact={true} />
                </div>

                <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-2 lg:grid-cols-3">
                    {classifications.map((classification) => (
                        <ClassificationCard
                            key={classification.id}
                            title={classification.title}
                            totalCases={classification.totalCases}
                            trend={classification.trend}
                            icon={classification.icon}
                            color={classification.color}
                            onClick={() => handleCardDoubleClick(classification)}
                        />
                    ))}
                </div>

                <div className="p-4 rounded-lg bg-background-secondary shadow-card">
                    <h3 className="mb-4 text-lg font-semibold text-white">
                        Métricas Generales del Sistema
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
                        <div className="p-3 text-center">
                            <div className="mb-1 text-2xl font-semibold text-primary-400">
                                {(filteredData?.length ?? data?.length)?.toLocaleString() || '0'}
                            </div>
                            <div className="text-xs text-gray-400">
                                Total Registros
                            </div>
                        </div>
                        <div className="p-3 text-center">
                            <div className="mb-1 text-2xl font-semibold text-green-400">
                                {classifications.filter(c => c.totalCases > 0).length}
                            </div>
                            <div className="text-xs text-gray-400">
                                Clasificaciones Activas
                            </div>
                        </div>
                        <div className="p-3 text-center">
                            <div className="mb-1 text-2xl font-semibold text-yellow-400">
                                {Math.max(...classifications.map(c => c.totalCases), 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                                Mayor Volumen
                            </div>
                        </div>
                        <div className="p-3 text-center">
                            <div className="mb-1 text-2xl font-semibold text-cyan-400">
                                {new Date().toLocaleDateString('es-AR')}
                            </div>
                            <div className="text-xs text-gray-400">
                                Ultima Actualizacion
                            </div>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-background-card">
                        <div className="mb-1 text-xs text-gray-400">
                            Periodo de datos: Enero 2024 - {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400">
                            Datos actualizados automaticamente cada 24 horas
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MainDashboard;








