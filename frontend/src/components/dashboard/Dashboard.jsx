// Componente principal del dashboard
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import FilterPanel from './FilterPanel';
import ProblematicasDashboard from './specialized/ProblematicasDashboard';
import logo from '../../assets/react.svg';


export default function Dashboard() {
    // Asegurarse de que el cuerpo tenga un fondo claro
    useEffect(() => {
        document.body.classList.add('bg-gray-50');
        return () => {
            document.body.classList.remove('bg-gray-50');
        };
    }, []);
    const { logout, user } = useAuth();
    const { loading, error, dataStats, refreshData, filteredData } = useDashboard();

    // Formatear información de fechas para el navbar - calculado desde datos GEOG. PROCEDIMIENTO
    const getDateRangeInfo = () => {
        if (!filteredData || !Array.isArray(filteredData)) {
            return { text: 'Cargando rango de fechas...', totalRecords: dataStats?.totalRecords || 0 };
        }
        // Calcular directamente desde filteredData de GEOG. PROCEDIMIENTO
        const geogData = filteredData.filter(item =>
            item && (
                item.HOJA === 'GEOG. PROCEDIMIENTO' ||
                item.ARCHIVO_ORIGINAL || // Si no tiene HOJA, asumir que es GEOG
                !item.HOJA // datos sin hoja específica
            )
        );

        if (geogData.length === 0) {
            // Intentar fallback a dataStats.dateRange
            if (dataStats?.dateRange?.earliest && dataStats?.dateRange?.latest) {
                return { text: `${dataStats.dateRange.earliest} - ${dataStats.dateRange.latest}`, totalRecords: dataStats.totalRecords || 0 };
            }
            return { text: 'Sin datos de GEOG. PROCEDIMIENTO', totalRecords: 0 };
        }

        // Obtener fechas válidas de GEOG. PROCEDIMIENTO
        const validDates = geogData
            .map(item => item.FECHA)
            .filter(date => date && date !== '-' && date.trim() !== '')
            .filter(date => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date))
            .sort();

        if (validDates.length === 0) {
            return { text: 'Sin fechas válidas en GEOG. PROCEDIMIENTO', totalRecords: geogData.length };
        }

        // Formatear fechas para display
        const formatDate = (dateStr) => {
            try {
                // Convertir dd/mm/yyyy a Date
                const [day, month, year] = dateStr.split('/');
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } catch {
                return dateStr;
            }
        };

        const earliest = validDates[0];
        const latest = validDates[validDates.length - 1];

        return {
            text: `${formatDate(earliest)} - ${formatDate(latest)}`,
            totalRecords: dataStats?.totalRecords || geogData.length
        };
    };

    const dateInfo = getDateRangeInfo();

    // Estado local para el botón de refrescar
    const [refreshing, setRefreshing] = React.useState(false);

    // Función para manejar el refresco
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const result = await refreshData();
            if (result.success) {
                console.log(`✅ Datos refrescados desde ${result.source}`);
            } else {
                console.error('❌ Error refrescando datos:', result.error);
            }
        } catch (error) {
            console.error('❌ Error en refresco:', error);
        } finally {
            setRefreshing(false);
        }
    };


    // Manejar carga y error
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="mb-4 text-red-500">❌</div>
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header completo sin sidebar */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
                <div className="px-4 py-2 mx-auto max-w-7xl">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <img src={logo} alt="Logo" className="w-8 h-8" />
                            <div className="text-lg font-semibold text-gray-800">📊 Análisis de Problemáticas</div>
                            {/* Toggle filtros (estado controlado dentro de FilterPanel via prop) */}
                            <FilterPanel inline compact />
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="items-center hidden px-2 py-1 border border-green-200 rounded-md md:flex bg-green-50">
                                <span className="text-xs font-medium text-green-700">{dateInfo.text}</span>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing || loading}
                                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all ${refreshing || loading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                title="Actualizar datos"
                            >
                                <span className={`mr-1 ${refreshing ? 'animate-spin' : ''}`}>{refreshing ? '⟳' : '🔄'}</span>
                                Actualizar
                            </button>
                            <button
                                onClick={logout}
                                className="px-3 py-1.5 text-xs text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content sin margen lateral */}
            <main className="px-4 py-4 mx-auto mt-14 max-w-7xl">
                <ProblematicasDashboard />
            </main>
        </div>
    );
}
