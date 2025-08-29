// Componente principal del dashboard
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import MapComponent from '../map/MapComponent';
import StatCard from './StatCard';
import DataTable from './DataTable';

import CategoryCharts from '../charts/CategoryCharts';
import { loadData, getStatistics, getCategorizedData } from '../../services/dataService';

import ExcelUpload from './ExcelUpload';

import FilterPanel from './FilterPanel';

import SecuritySection from '../security/SecuritySection';
import { getAllSecurityStats } from '../../services/securityStatsService';
import logo from '../../assets/react.svg';


export default function Dashboard() {
    const { logout } = useAuth();
    const {
        data,
        setData,
        loading,
        error,
        activeCategory,
        setActiveCategory,
        filters,
        setFilters,
        filteredData,
        filteredCategorizedData
    } = useDashboard();

    // Para mantener compatibilidad con el resto del componente
    const activeNav = activeCategory;
    const setActiveNav = setActiveCategory;

    // Estadísticas rápidas para la vista general
    const filteredStats = {
        total: filteredData.length,
        provinceCounts: filteredData.reduce((acc, item) => {
            if (item.PROVINCIA) acc[item.PROVINCIA] = (acc[item.PROVINCIA] || 0) + 1;
            return acc;
        }, {}),
        interventionCounts: filteredData.reduce((acc, item) => {
            if (item.TIPO_INTERVENCION) acc[item.TIPO_INTERVENCION] = (acc[item.TIPO_INTERVENCION] || 0) + 1;
            return acc;
        }, {})
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
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'general' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('general')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>General</span>
                        <span className="px-1 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">{filteredData.length}</span>
                    </span>
                </button>
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
                                <FilterPanel />
                                <ExcelUpload />
                            </div>
                        </div>
                    </div>
                </header>


                <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {activeNav === 'general' && (
                        <>
                            {/* Tarjetas de estadísticas */}
                            <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
                                <StatCard
                                    title="Total de Registros"
                                    value={filteredData.length}
                                    icon="📊"
                                    color="bg-blue-500"
                                />
                                <StatCard
                                    title="Provincias"
                                    value={Object.keys(filteredStats.provinceCounts || {}).length}
                                    icon="🗺️"
                                    color="bg-green-500"
                                />
                                <StatCard
                                    title="Tipos de Intervención"
                                    value={Object.keys(filteredStats.interventionCounts || {}).length}
                                    icon="🛡️"
                                    color="bg-purple-500"
                                />
                            </div>

                            {/* Mapa */}
                            <div className="mb-8">
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">Mapa de Eventos</h2>
                                <div className="p-4 bg-white rounded-lg shadow-md" style={{ height: '500px' }}>
                                    <MapComponent data={filteredData} />
                                </div>
                            </div>

                            {/* Tabla de datos */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold text-gray-800">Registros</h2>
                                <DataTable data={filteredData} />
                            </div>
                        </>
                    )}

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
                                    <div key={catKey} className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">{icon}</div>
                                        <h3 className="text-xl text-gray-600 mb-2">No hay datos disponibles</h3>
                                        <p className="text-gray-500">No se encontraron registros para {title.toLowerCase()}</p>
                                    </div>
                                );
                            }

                            return (
                                <div key={catKey}>
                                    <CategoryCharts
                                        data={catData}
                                        categoryName={title}
                                        title={title}
                                        icon={icon}
                                        color={color}
                                        hideEmpty={true}
                                    />
                                    <SecuritySection category={catKey} hideEmpty={true} />
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
