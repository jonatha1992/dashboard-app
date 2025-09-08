// Componente principal del dashboard
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import MapComponent from '../map/MapComponent';
import StatCard from './StatCard';
import DataTable from './DataTable';

import CategoryCharts from '../charts/CategoryCharts';
// removed unused imports from dataService; Dashboard uses the context to access data



import FilterPanel from './FilterPanel';
import SystemStatusView from './SystemStatusView';

import SecuritySection from '../security/SecuritySection';
import FilteringStatsDashboard from './FilteringStatsDashboard';
import FilteredDataTables from './FilteredDataTables';
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
    const {
        loading,
        error,
        activeCategory,
        setActiveCategory,
        filteredData,
        filteredCategorizedData,
        dataStats,
        refreshData
    } = useDashboard();

    // Para mantener compatibilidad con el resto del componente
    const activeNav = activeCategory;
    const setActiveNav = setActiveCategory;

    // Formatear información de fechas para el navbar - calculado desde datos GEOG. PROCEDIMIENTO
    const getDateRangeInfo = () => {
        // Calcular directamente desde filteredData de GEOG. PROCEDIMIENTO
        const geogData = filteredData.filter(item => 
            item.HOJA === 'GEOG. PROCEDIMIENTO' || 
            item.ARCHIVO_ORIGINAL || // Si no tiene HOJA, asumir que es GEOG
            !item.HOJA // datos sin hoja específica
        );
        
        if (geogData.length === 0) {
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
            {/* Fixed Sidebar */}
            <nav className="fixed top-0 left-0 z-50 flex flex-col w-48 h-screen px-4 py-8 bg-white shadow-md">
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="Logo" className="w-12 h-12 mb-2" />
                    <h2 className="text-base font-bold text-gray-800">Menú</h2>
                </div>

                {/* Controles / Controlados (único botón más abajo) */}
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'detenidos' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('detenidos')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>🚨 Detenidos</span>
                        <span className={`px-1 py-0.5 text-xs rounded-full ${activeNav === 'detenidos' ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                            {(filteredCategorizedData.detenidos || []).length}
                        </span>
                    </span>
                </button>
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'controlados' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('controlados')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>👁️ Controlados</span>
                        <span className={`px-1 py-0.5 text-xs rounded-full ${activeNav === 'controlados' ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                            {(filteredCategorizedData.controlados || []).length}
                        </span>
                    </span>
                </button>
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'afectados' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('afectados')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>👥 Afectados</span>
                        <span className={`px-1 py-0.5 text-xs rounded-full ${activeNav === 'afectados' ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                            {(filteredCategorizedData.afectados || []).length}
                        </span>
                    </span>
                </button>
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'procedimientos' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('procedimientos')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>📋 Procedimientos</span>
                        <span className={`px-1 py-0.5 text-xs rounded-full ${activeNav === 'procedimientos' ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                            {(filteredCategorizedData.procedimientos || []).length}
                        </span>
                    </span>
                </button>
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'abatidos' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('abatidos')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>💀 Abatidos</span>
                        <span className={`px-1 py-0.5 text-xs rounded-full ${activeNav === 'abatidos' ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                            {(filteredCategorizedData.abatidos || []).length}
                        </span>
                    </span>
                </button>
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'trata' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('trata')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>🚫 Trata</span>
                        <span className={`px-1 py-0.5 text-xs rounded-full ${activeNav === 'trata' ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                            {(filteredCategorizedData.trata || []).length}
                        </span>
                    </span>
                </button>
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'incautaciones' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('incautaciones')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>📦 Incautaciones</span>
                        <span className={`px-1 py-0.5 text-xs rounded-full ${activeNav === 'incautaciones' ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                            {(filteredCategorizedData.incautaciones || []).length}
                        </span>
                    </span>
                </button>

                {/* Sección de Estado - solo para administradores */}
                {user?.role === 'admin' && (
                    <>
                        <div className="my-2 border-t border-gray-200"></div>
                        <button
                            className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'estado' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                            onClick={() => setActiveNav('estado')}
                        >
                            <span className="flex items-center justify-between w-full">
                                <span>⚙️ Estado</span>
                            </span>
                        </button>
                        <button
                            className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'filtrado' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                            onClick={() => setActiveNav('filtrado')}
                        >
                            <span className="flex items-center justify-between w-full">
                                <span>🔍 Filtrado</span>
                            </span>
                        </button>
                        <button
                            className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'tablas-filtradas' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                            onClick={() => setActiveNav('tablas-filtradas')}
                        >
                            <span className="flex items-center justify-between w-full">
                                <span>🗂️ Tablas</span>
                            </span>
                        </button>
                    </>
                )}

                <div className="flex-1" />
                <button
                    onClick={logout}
                    className="w-full px-3 py-2 mt-6 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    Cerrar Sesión
                </button>
            </nav>

            {/* Main content with left margin for fixed sidebar */}
            <div className="flex-1 ml-48">
                <header className="fixed top-0 right-0 z-40 bg-white shadow-md" style={{ width: 'calc(100% - 12rem)' }}>
                    <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                                    <span className="text-xl text-white">📊</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-800">Sistema de Monitoreo</h1>
                            </div>

                            <div className="flex items-center space-x-4">
                                {/* Date Range Info */}
                                <div className="flex items-center px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md">
                                    <div className="flex items-center justify-center w-6 h-6 mr-2 bg-green-600 rounded-full">
                                        <span className="text-xs text-white">📅</span>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-green-800">{dateInfo.text}</div>
                                        <div className="text-xs text-green-600">
                                            {dateInfo.totalRecords.toLocaleString('es-AR')} registros
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md">
                                    <div className="flex items-center justify-center w-6 h-6 mr-2 bg-blue-600 rounded-full">
                                        <span className="text-xs text-white">
                                            {user?.role === 'admin' ? '👑' : '👤'}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-700">{user?.username}</div>
                                        <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                                    </div>
                                </div>
                                
                                {/* Refresh Button */}
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing || loading}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                        refreshing || loading 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                                    }`}
                                    title="Actualizar datos"
                                >
                                    <span className={`mr-2 ${refreshing ? 'animate-spin' : ''}`}>
                                        {refreshing ? '⟳' : '🔄'}
                                    </span>
                                    {refreshing ? 'Actualizando...' : 'Actualizar'}
                                </button>
                                
                                <FilterPanel />
                                
                            </div>
                        </div>
                    </div>
                </header>


                <main className="px-4 py-6 mx-auto mt-16 max-w-7xl sm:px-6 lg:px-8">
                    {activeNav === 'estado' && <SystemStatusView />}
                    {activeNav === 'filtrado' && <FilteringStatsDashboard />}
                    {activeNav === 'tablas-filtradas' && <FilteredDataTables />}
                    {['detenidos', 'controlados', 'afectados', 'procedimientos', 'abatidos', 'trata', 'incautaciones'].map(catKey => (
                        activeNav === catKey && (() => {
                            const catData = filteredCategorizedData[catKey] || [];
                            const title = catKey.charAt(0).toUpperCase() + catKey.slice(1);
                            const icon = (() => {
                                switch (catKey) {
                                    case 'detenidos': return '👮‍♂️';
                                    case 'controlados': return '🔍';
                                    case 'afectados': return '🚨';
                                    case 'procedimientos': return '📋';
                                    case 'abatidos': return '⚠️';
                                    case 'trata': return '🚫';
                                    case 'incautaciones': return '📦';
                                    default: return '📊';
                                }
                            })();
                            const color = (() => {
                                switch (catKey) {
                                    case 'detenidos': return 'bg-red-500';
                                    case 'controlados': return 'bg-blue-500';
                                    case 'afectados': return 'bg-orange-500';
                                    case 'procedimientos': return 'bg-indigo-500';
                                    case 'abatidos': return 'bg-gray-600';
                                    case 'trata': return 'bg-pink-500';
                                    case 'incautaciones': return 'bg-yellow-500';
                                    default: return 'bg-blue-500';
                                }
                            })();

                            if (!catData || catData.length === 0) {
                                return (
                                    <div key={catKey} className="py-12 text-center">
                                        <div className="mb-4 text-6xl text-gray-400">{icon}</div>
                                        <h3 className="mb-2 text-xl text-gray-600">No hay datos disponibles</h3>
                                        <p className="text-gray-500">No se encontraron registros para {title.toLowerCase()}</p>
                                    </div>
                                );
                            }

                            return (
                                <div key={catKey}>
                                    <SecuritySection category={catKey} showProvinceChart={false} />
                                    
                                    {/* Layout flex: Mapa izquierda (6/12) + Gráficos derecha (6/12) */}
                                    <div className="flex flex-col lg:flex-row gap-6 mb-8">
                                        {/* Columna izquierda - Mapa (6/12 en lg+) */}
                                        <div className="w-full lg:w-6/12">
                                            <div className="p-4 bg-white rounded-lg shadow-md" style={{ height: '600px' }}>
                                                <h2 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                                                    <span className="mr-2">🗺️</span>
                                                    Mapa de {title}
                                                </h2>
                                                {/* El mapa ocupa el alto restante del card (reservamos ~44px para el título) */}
                                                <div style={{ height: 'calc(100% - 44px)' }}>
                                                    <MapComponent data={catData} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Columna derecha - Gráficos (6/12 en lg+) */}
                                        <div className="w-full lg:w-6/12 space-y-6">
                                            {/* Gráfico de tendencia (línea) */}
                                            <div className="p-4 bg-white rounded-lg shadow-md">
                                               <div style={{ height: '250px' }}>
                                                    <CategoryCharts
                                                        data={catData}
                                                        categoryName={title}
                                                        title={title}
                                                        icon={icon}
                                                        color={color}
                                                        showTable={false}
                                                        compactMode={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-4 bg-white rounded-lg shadow-md">
                                                <div style={{ height: '250px' }}>
                                                    <CategoryCharts
                                                        data={catData}
                                                        categoryName={title}
                                                        title={title}
                                                        icon={icon}
                                                        color={color}
                                                        showTable={false}
                                                        compactMode={true}
                                                        defaultView="province"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabla de registros para la categoría (única tabla abajo) */}
                                    <div className="mt-8">
                                        <DataTable data={catData} />
                                    </div>
                                </div>
                            );
                        })()
                    ))}

                    {/* Las secciones por categoría se manejan arriba con el map unificado */}
                </main>
            </div>
        </div>
    );
}
