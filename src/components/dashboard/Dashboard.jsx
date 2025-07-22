// Componente principal del dashboard
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MapComponent from '../map/MapComponent';
import StatCard from './StatCard';
import DataTable from './DataTable';
import ExcelUpload from './ExcelUpload';
import FilterPanel from './FilterPanel';
import { loadData, getStatistics } from '../../services/dataService';
import logo from '../../assets/react.svg';

export default function Dashboard() {
    const { logout } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeNav, setActiveNav] = useState('general');
    
    // Filter states
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        province: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await loadData();
                setData(result);
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
    const handleFiltersChange = useCallback(({ type, filter }) => {
        setFilters(prevFilters => {
            if (type === 'date') {
                return {
                    ...prevFilters,
                    fromDate: filter.fromDate,
                    toDate: filter.toDate
                };
            } else if (type === 'province') {
                return {
                    ...prevFilters,
                    province: filter
                };
            }
            return prevFilters;
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
                const [day, month, year] = dateString.split('/');
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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

    const handleDataUpload = useCallback((newData) => {
        setData(newData);
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
            <nav className="w-48 bg-white shadow-md flex flex-col py-8 px-4 min-h-screen">
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
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'controles' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('controles')}
                >
                    Controles
                </button>
                <button
                    className={`text-left px-4 py-2 rounded-md mb-2 font-medium ${activeNav === 'detenidos' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                    onClick={() => setActiveNav('detenidos')}
                >
                    Detenidos
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
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-800">Sistema de Monitoreo</h1>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {activeNav === 'general' && (
                        <>
                            {/* Componente de carga de Excel - movido al tope */}
                            <ExcelUpload onDataUpload={handleDataUpload} />
                            
                            {/* Panel de filtros */}
                            <FilterPanel onFiltersChange={handleFiltersChange} />
                            
                            {/* Estadísticas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                <StatCard
                                    title="Total de Registros"
                                    value={filteredStats.total || 0}
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
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Mapa de Eventos</h2>
                                <div className="bg-white rounded-lg shadow-md p-4" style={{ height: '500px' }}>
                                    <MapComponent data={filteredData} />
                                </div>
                            </div>

                            {/* Tabla de datos */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Registros</h2>
                                <DataTable data={filteredData} />
                            </div>
                        </>
                    )}
                    {/* Aquí puedes agregar el contenido de las otras secciones */}
                    {activeNav === 'controles' && (
                        <div className="text-center text-2xl text-gray-700 py-20">Sección Controles (por implementar)</div>
                    )}
                    {activeNav === 'detenidos' && (
                        <div className="text-center text-2xl text-gray-700 py-20">Sección Detenidos (por implementar)</div>
                    )}
                    {activeNav === 'incautaciones' && (
                        <div className="text-center text-2xl text-gray-700 py-20">Sección Incautaciones (por implementar)</div>
                    )}
                </main>
            </div>
        </div>
    );
}
