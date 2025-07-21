// Componente principal del dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MapComponent from '../map/MapComponent';
import StatCard from './StatCard';
import DataTable from './DataTable';
import CategoryCharts from '../charts/CategoryCharts';
import { loadData, getStatistics, getCategorizedData } from '../../services/dataService';
import logo from '../../assets/react.svg';

export default function Dashboard() {
    const { logout } = useAuth();
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({});
    const [categorizedData, setCategorizedData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeNav, setActiveNav] = useState('general');

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
                const categorized = getCategorizedData(result);
                setCategorizedData(categorized);

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar los datos:', err);
                setError('Error al cargar los datos. Por favor, inténtelo de nuevo más tarde.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'general' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('general')}
                >
                    General
                </button>
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'detenidos' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('detenidos')}
                >
                    Detenidos
                </button>
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'controlados' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('controlados')}
                >
                    Controlados
                </button>
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'afectados' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('afectados')}
                >
                    Afectados
                </button>
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'procedimientos' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('procedimientos')}
                >
                    Procedimientos
                </button>
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'abatidos' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('abatidos')}
                >
                    Abatidos
                </button>
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'trata' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('trata')}
                >
                    Trata
                </button>
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'incautaciones' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('incautaciones')}
                >
                    Incautaciones
                </button>
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
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {activeNav === 'general' && (
                        <>
                            {/* Estadísticas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

                    {activeNav === 'detenidos' && (
                        <CategoryCharts 
                            data={categorizedData.detenidos || []}
                            categoryName="Detenidos"
                            title="Detenidos"
                            icon="👮‍♂️"
                            color="bg-red-500"
                        />
                    )}

                    {activeNav === 'controlados' && (
                        <CategoryCharts 
                            data={categorizedData.controlados || []}
                            categoryName="Controlados"
                            title="Controlados"
                            icon="🔍"
                            color="bg-blue-500"
                        />
                    )}

                    {activeNav === 'afectados' && (
                        <CategoryCharts 
                            data={categorizedData.afectados || []}
                            categoryName="Afectados"
                            title="Afectados"
                            icon="🚨"
                            color="bg-orange-500"
                        />
                    )}

                    {activeNav === 'procedimientos' && (
                        <CategoryCharts 
                            data={categorizedData.procedimientos || []}
                            categoryName="Procedimientos"
                            title="Procedimientos"
                            icon="📋"
                            color="bg-indigo-500"
                        />
                    )}

                    {activeNav === 'abatidos' && (
                        <CategoryCharts 
                            data={categorizedData.abatidos || []}
                            categoryName="Abatidos"
                            title="Abatidos"
                            icon="⚠️"
                            color="bg-gray-600"
                        />
                    )}

                    {activeNav === 'trata' && (
                        <CategoryCharts 
                            data={categorizedData.trata || []}
                            categoryName="Trata"
                            title="Trata de Personas"
                            icon="🚫"
                            color="bg-pink-500"
                        />
                    )}

                    {activeNav === 'incautaciones' && (
                        <CategoryCharts 
                            data={categorizedData.incautaciones || []}
                            categoryName="Incautaciones"
                            title="Incautaciones"
                            icon="📦"
                            color="bg-yellow-500"
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
