import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassificationCard from '../../common/ClassificationCard';
import MetricCard from '../../common/MetricCard';
import DashboardLayout from '../../common/DashboardLayout';
import { useDashboard } from '../../../contexts/DashboardContext';

const MainDashboard = () => {
    const navigate = useNavigate();
    const { data, filteredCategorizedData, loading } = useDashboard();

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
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <h2 className="text-2xl font-bold text-white mt-4">Dashboard Principal - Cargando...</h2>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout title="Dashboard Principal" showBackButton={false}>
            <div className="py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Dashboard Operativo
                    </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

                <div className="bg-background-secondary rounded-lg p-6 shadow-card">
                    <h3 className="text-xl font-semibold text-white mb-6">
                        Métricas Generales del Sistema
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4">
                            <div className="text-3xl font-bold text-primary-400 mb-2">
                                {data?.length?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-gray-400">
                                Total Registros
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                                {classifications.filter(c => c.totalCases > 0).length}
                            </div>
                            <div className="text-sm text-gray-400">
                                Clasificaciones Activas
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">
                                {Math.max(...classifications.map(c => c.totalCases), 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400">
                                Mayor Volumen
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-3xl font-bold text-cyan-400 mb-2">
                                {new Date().toLocaleDateString('es-AR')}
                            </div>
                            <div className="text-sm text-gray-400">
                                Última Actualización
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-background-card rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">
                            📊 Período de datos: Enero 2024 - {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-sm text-gray-400">
                            🔄 Datos actualizados automáticamente cada 24 horas
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MainDashboard;
