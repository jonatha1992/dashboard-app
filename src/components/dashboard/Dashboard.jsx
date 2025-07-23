// Componente principal del dashboard
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
    const [data, setData] = useState([]);

    // Función para obtener las fechas del mes actual
    const getCurrentMonthDates = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const fromDate = new Date(year, month, 1).toISOString().split('T')[0];
        const toDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        return { fromDate, toDate };
    };

    const currentMonthDates = getCurrentMonthDates();

    const [categorizedData, setCategorizedData] = useState({});
    const [securityStats, setSecurityStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeNav, setActiveNav] = useState('general');

    // Filter states - inicializar con el mes actual
    const [filters, setFilters] = useState({
        fromDate: currentMonthDates.fromDate,
        toDate: currentMonthDates.toDate,
        province: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await loadData();
                setData(result);

                // Categorizar datos
                const categorized = getCategorizedData(result);
                setCategorizedData(categorized);
                // Cargar estadísticas de seguridad
                const securityStatistics = getAllSecurityStats();
                setSecurityStats(securityStatistics);

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar los datos:', err);
                setError('Error al cargar los datos. Por favor, inténtelo de nuevo más tarde.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter handling function
    const handleFiltersChange = useCallback((newFilters) => {
        const currentMonth = getCurrentMonthDates();
        setFilters({
            fromDate: newFilters.fromDate || currentMonth.fromDate,
            toDate: newFilters.toDate || currentMonth.toDate,
            province: newFilters.province || ''
        });
    }, []);

    // Function to parse date from various formats
    const parseDate = (dateString) => {
        if (!dateString) return null;

        // Handle different date formats
        const formats = [
            /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
            /^\d{1,2}\/\d{1,2}\/\d{4}$/, // D/M/YYYY or DD/M/YYYY or D/MM/YYYY
        ];

        try {
            // Try to parse DD/MM/YYYY format first
            if (formats[0].test(dateString) || formats[2].test(dateString)) {
                const [day, month, yearPart] = dateString.split('/');
                return new Date(parseInt(yearPart), parseInt(month) - 1, parseInt(day));
            }
            // Try YYYY-MM-DD format
            else if (formats[1].test(dateString)) {
                return new Date(dateString);
            }
            // Fallback to standard parsing
            else {
                const parsed = new Date(dateString);
                return isNaN(parsed) ? null : parsed;
            }
        } catch {
            return null;
        }
    };

    // Filtered data using useMemo for performance
    const filteredData = useMemo(() => {
        let filtered = [...data];

        // Apply date filters
        if (filters.fromDate || filters.toDate) {
            filtered = filtered.filter(item => {
                const itemDate = parseDate(item.FECHA);
                if (!itemDate) return false;

                let withinRange = true;

                if (filters.fromDate) {
                    const fromDate = new Date(filters.fromDate);
                    withinRange = withinRange && itemDate >= fromDate;
                }

                if (filters.toDate) {
                    const toDate = new Date(filters.toDate);
                    // Set time to end of day for inclusive comparison
                    toDate.setHours(23, 59, 59, 999);
                    withinRange = withinRange && itemDate <= toDate;
                }

                return withinRange;
            });
        }

        // Apply province filter
        if (filters.province) {
            filtered = filtered.filter(item =>
                item.PROVINCIA && item.PROVINCIA.toLowerCase().includes(filters.province.toLowerCase())
            );
        }

        return filtered;
    }, [data, filters]);

    // Calculate statistics for filtered data
    const filteredStats = useMemo(() => {
        return getStatistics(filteredData);
    }, [filteredData]);

    // Calculate categorized data for filtered data to update sidebar counters
    const filteredCategorizedData = useMemo(() => {
        return getCategorizedData(filteredData);
    }, [filteredData]);

    const handleDataUpload = useCallback((newData) => {
        setData(newData);

        // Actualizar estadísticas de seguridad
        const securityStatistics = getAllSecurityStats();
        setSecurityStats(securityStatistics);

    }, []);

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
                <button
                    className={`text-left px-3 py-1.5 rounded-md mb-1.5 text-sm font-normal ${activeNav === 'controles' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('controles')}
                >
                    <span className="flex items-center justify-between w-full">
                        <span>🔍 Controles</span>
                        <span className={`px-1 py-0.5 text-xs rounded-full ${activeNav === 'controles' ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                            {(filteredCategorizedData.controles || []).length}
                        </span>
                    </span>
                </button>
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
                                <FilterPanel onFiltersChange={handleFiltersChange} />
                                <ExcelUpload onDataUpload={handleDataUpload} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats bar - with top margin for fixed header */}
                <div className="px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50" style={{ marginTop: '80px' }}>
                    <div className="flex flex-wrap items-center justify-around mx-auto max-w-7xl">
                        <div className="flex items-center px-4 py-1">
                            <div className="flex items-center justify-center w-8 h-8 mr-3 text-blue-600 bg-blue-100 rounded-full">📊</div>
                            <div>
                                <p className="text-xs text-gray-600">Registros</p>
                                <p className="font-semibold text-gray-800">{filteredStats.total || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center px-4 py-1">
                            <div className="flex items-center justify-center w-8 h-8 mr-3 text-green-600 bg-green-100 rounded-full">🗺️</div>
                            <div>
                                <p className="text-xs text-gray-600">Provincias</p>
                                <p className="font-semibold text-gray-800">{Object.keys(filteredStats.provinceCounts || {}).length}</p>
                            </div>
                        </div>
                        <div className="flex items-center px-4 py-1">
                            <div className="flex items-center justify-center w-8 h-8 mr-3 text-purple-600 bg-purple-100 rounded-full">🛡️</div>
                            <div>
                                <p className="text-xs text-gray-600">Tipos de Intervención</p>
                                <p className="font-semibold text-gray-800">{Object.keys(filteredStats.interventionCounts || {}).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {activeNav === 'general' && (
                        <>

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

                    {activeNav === 'detenidos' && (
                        <CategoryCharts
                            data={filteredCategorizedData.detenidos || []}
                            categoryName="Detenidos"
                            title="Detenidos"
                            icon="👮‍♂️"
                            color="bg-red-500"
                        />
                    )}

                    {activeNav === 'controlados' && (
                        <CategoryCharts
                            data={filteredCategorizedData.controlados || []}
                            categoryName="Controlados"
                            title="Controlados"
                            icon="🔍"
                            color="bg-blue-500"
                        />
                    )}

                    {activeNav === 'afectados' && (
                        <CategoryCharts
                            data={filteredCategorizedData.afectados || []}
                            categoryName="Afectados"
                            title="Afectados"
                            icon="🚨"
                            color="bg-orange-500"
                        />
                    )}

                    {activeNav === 'procedimientos' && (
                        <CategoryCharts
                            data={filteredCategorizedData.procedimientos || []}
                            categoryName="Procedimientos"
                            title="Procedimientos"
                            icon="📋"
                            color="bg-indigo-500"
                        />
                    )}

                    {activeNav === 'abatidos' && (
                        <CategoryCharts
                            data={filteredCategorizedData.abatidos || []}
                            categoryName="Abatidos"
                            title="Abatidos"
                            icon="⚠️"
                            color="bg-gray-600"
                        />
                    )}

                    {activeNav === 'trata' && (
                        <CategoryCharts
                            data={filteredCategorizedData.trata || []}
                            categoryName="Trata"
                            title="Trata de Personas"
                            icon="🚫"
                            color="bg-pink-500"
                        />
                    )}
                    {/* Aquí puedes agregar el contenido de las otras secciones */}
                    {activeNav === 'controles' && (
                        <SecuritySection category="controlados" />
                    )}
                    {activeNav === 'detenidos' && (
                        <SecuritySection category="detenidos" />
                    )}

                    {activeNav === 'incautaciones' && (
                        <>
                            <CategoryCharts
                                data={filteredCategorizedData.incautaciones || []}
                                categoryName="Incautaciones"
                                title="Incautaciones"
                                icon="📦"
                                color="bg-yellow-500"
                            />
                            <SecuritySection category="incautaciones" />
                        </>
                    )}
                    {activeNav === 'afectados' && (
                        <SecuritySection category="afectados" />
                    )}
                    {activeNav === 'abatidos' && (
                        <SecuritySection category="abatidos" />
                    )}
                </main>
            </div>
        </div>
    );
}
