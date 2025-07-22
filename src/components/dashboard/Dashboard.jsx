// Componente principal del dashboard
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MapComponent from '../map/MapComponent';
import StatCard from './StatCard';
import DataTable from './DataTable';
import ExcelUpload from './ExcelUpload';
import { loadData, getStatistics, categorizeData } from '../../services/dataService';

// Import chart components
import DetenidosChart from '../charts/DetenidosChart';
import ControladosChart from '../charts/ControladosChart';
import AfectadosChart from '../charts/AfectadosChart';
import ProcedimientosChart from '../charts/ProcedimientosChart';
import AbatidosChart from '../charts/AbatidosChart';
import TrateChart from '../charts/TrateChart';
import IncautacionesChart from '../charts/IncautacionesChart';

import logo from '../../assets/react.svg';

export default function Dashboard() {
    const { logout } = useAuth();
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({});
    const [categorizedData, setCategorizedData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeNav, setActiveNav] = useState('general');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await loadData();
                setData(result);

                // Calcular estadísticas
                const statistics = getStatistics(result);
                setStats(statistics);

                // Categorizar datos
                const categories = categorizeData(result);
                setCategorizedData(categories);

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar los datos:', err);
                setError('Error al cargar los datos. Por favor, inténtelo de nuevo más tarde.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDataUpload = useCallback((newData) => {
        setProcessing(true); // Indicate that processing has started
        setData(newData);
        
        // Calcular estadísticas con los nuevos datos
        const statistics = getStatistics(newData);
        setStats(statistics);

        // Categorizar datos
        const categories = categorizeData(newData);
        setCategorizedData(categories);
        
        setProcessing(false); // Indicate that processing has finished
    }, []);

    const navigationItems = [
        { key: 'general', label: 'General', icon: '📊' },
        { key: 'detenidos', label: 'Detenidos', icon: '🚫' },
        { key: 'controlados', label: 'Controlados', icon: '🛡️' },
        { key: 'afectados', label: 'Afectados', icon: '👥' },
        { key: 'procedimientos', label: 'Procedimientos', icon: '📋' },
        { key: 'abatidos', label: 'Abatidos', icon: '⚠️' },
        { key: 'trata', label: 'Trata', icon: '🚨' },
        { key: 'incautaciones', label: 'Incautaciones', icon: '📦' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="text-red-500 mb-4">❌</div>
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <nav className="w-56 bg-white shadow-md flex flex-col py-8 px-4 min-h-screen">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Logo" className="h-16 w-16 mb-2" />
                    <h2 className="text-lg font-bold text-gray-800">Menú</h2>
                </div>
                
                {navigationItems.map((item) => (
                    <button
                        key={item.key}
                        className={`text-left px-4 py-2 rounded-md mb-2 font-medium flex items-center ${
                            activeNav === item.key 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-700 hover:bg-blue-100'
                        }`}
                        onClick={() => setActiveNav(item.key)}
                    >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                        {item.key !== 'general' && (
                            <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                {categorizedData[item.key]?.length || 0}
                            </span>
                        )}
                    </button>
                ))}
                
                <div className="flex-1" />
                <button
                    onClick={logout}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mt-8"
                >
                    Cerrar Sesión
                </button>
            </nav>

            {/* Main content */}
            <div className="flex-1">
                <header className="bg-white shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-800">Sistema de Monitoreo</h1>
                        {processing && (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                <span className="text-sm text-gray-600">Procesando...</span>
                            </div>
                        )}
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* General Section */}
                    {activeNav === 'general' && (
                        <>
                            {/* Componente de carga de Excel */}
                            <ExcelUpload onDataUpload={handleDataUpload} />
                            
                            {/* Estadísticas generales */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <StatCard
                                    title="Total de Registros"
                                    value={stats.total || 0}
                                    icon="📊"
                                    color="bg-blue-500"
                                />
                                <StatCard
                                    title="Provincias"
                                    value={Object.keys(stats.provinceCounts || {}).length}
                                    icon="🗺️"
                                    color="bg-green-500"
                                />
                                <StatCard
                                    title="Tipos de Intervención"
                                    value={Object.keys(stats.interventionCounts || {}).length}
                                    icon="🛡️"
                                    color="bg-purple-500"
                                />
                                <StatCard
                                    title="Categorías Activas"
                                    value={Object.values(categorizedData).filter(arr => arr.length > 0).length}
                                    icon="📋"
                                    color="bg-orange-500"
                                />
                            </div>

                            {/* Resumen por categorías */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen por Categorías</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {navigationItems.slice(1).map((item) => (
                                        <div key={item.key} className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl mb-2">{item.icon}</div>
                                            <div className="text-lg font-semibold text-gray-800">
                                                {categorizedData[item.key]?.length || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mapa */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Mapa de Eventos</h2>
                                <div className="bg-white rounded-lg shadow-md p-4" style={{ height: '500px' }}>
                                    <MapComponent data={data} />
                                </div>
                            </div>

                            {/* Tabla de datos */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Registros</h2>
                                <DataTable data={data} />
                            </div>
                        </>
                    )}

                    {/* Category-specific sections with charts */}
                    {activeNav === 'detenidos' && (
                        <DetenidosChart data={categorizedData.detenidos || []} />
                    )}

                    {activeNav === 'controlados' && (
                        <ControladosChart data={categorizedData.controlados || []} />
                    )}

                    {activeNav === 'afectados' && (
                        <AfectadosChart data={categorizedData.afectados || []} />
                    )}

                    {activeNav === 'procedimientos' && (
                        <ProcedimientosChart data={categorizedData.procedimientos || []} />
                    )}

                    {activeNav === 'abatidos' && (
                        <AbatidosChart data={categorizedData.abatidos || []} />
                    )}

                    {activeNav === 'trata' && (
                        <TrateChart data={categorizedData.trata || []} />
                    )}

                    {activeNav === 'incautaciones' && (
                        <IncautacionesChart data={categorizedData.incautaciones || []} />
                    )}
                </main>
            </div>
        </div>
    );
}
