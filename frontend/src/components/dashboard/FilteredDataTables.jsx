import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import MapComponent from '../map/MapComponent';
import DataTable from './DataTable';

export default function FilteredDataTables() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('incautaciones');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState({});
    const [errors, setErrors] = useState({});

    const tabs = [
        { id: 'incautaciones', label: 'Incautaciones', icon: '🔍' },
        { id: 'detenidos', label: 'Detenidos', icon: '👤' },
        { id: 'controlados', label: 'Controlados', icon: '🚗' },
        { id: 'afectados', label: 'Afectados', icon: '👮' }
    ];

    const loadData = async (dataType) => {
        if (!user) return;

        try {
            setLoading(prev => ({ ...prev, [dataType]: true }));
            setErrors(prev => ({ ...prev, [dataType]: null }));

            let response;
            switch (dataType) {
                case 'incautaciones':
                    response = await apiService.getFilteredIncautaciones();
                    break;
                case 'detenidos':
                    response = await apiService.getFilteredDetenidos();
                    break;
                case 'controlados':
                    response = await apiService.getFilteredControlados();
                    break;
                case 'afectados':
                    response = await apiService.getFilteredAfectados();
                    break;
                default:
                    return;
            }

            setData(prev => ({ ...prev, [dataType]: response }));
        } catch (err) {
            console.error(`Error loading ${dataType}:`, err);
            setErrors(prev => ({ ...prev, [dataType]: `Error al cargar ${dataType}` }));
        } finally {
            setLoading(prev => ({ ...prev, [dataType]: false }));
        }
    };

    useEffect(() => {
        if (user) {
            loadData(activeTab);
        }
    }, [activeTab, user]);

    const renderContent = () => {
        if (loading[activeTab]) {
            return (
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            );
        }

        if (errors[activeTab]) {
            return (
                <div className="text-red-600 text-center py-8 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors[activeTab]}
                </div>
            );
        }

        const currentData = data[activeTab] || [];
        
        if (currentData.length === 0) {
            return (
                <div className="text-gray-500 text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <div className="text-lg font-medium mb-2">No hay {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} registrados</div>
                    <div className="text-sm">Los datos aparecerán aquí cuando estén disponibles</div>
                </div>
            );
        }

        return <DataTable data={currentData} />;
    };

    if (!user) {
        return null;
    }

    const currentData = data[activeTab] || [];
    const recordCount = currentData.length;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="mr-2">🗺️</span>
                    Datos Filtrados por Tabla Especializada
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        Con Filtros y Ordenamiento Avanzado
                    </span>
                </h3>
                <p className="text-sm text-gray-600">
                    Visualización de datos reales con funcionalidades completas de filtrado, ordenamiento y búsqueda por columnas.
                    Cada tabla incluye filtros específicos y capacidades de exportación.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                            {data[tab.id] && (
                                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    {data[tab.id].length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Record Count and Actions */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{recordCount.toLocaleString()}</span> registros con datos reales
                    </div>
                    {recordCount > 0 && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ✨ Datos cargados desde API autenticada
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => loadData(activeTab)}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center"
                        disabled={loading[activeTab]}
                    >
                        {loading[activeTab] ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cargando...
                            </>
                        ) : (
                            <>
                                🔄 Actualizar
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Area - Mapa y Tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda - Mapa */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🗺️</span>
                        Mapa de {tabs.find(t => t.id === activeTab)?.label}
                    </h4>
                    <div className="text-sm text-gray-600 mb-3">
                        {recordCount > 0 ? (
                            `Visualizando ${recordCount.toLocaleString()} puntos de datos en el mapa`
                        ) : (
                            'No hay datos con coordenadas para mostrar en el mapa'
                        )}
                    </div>
                    <div style={{ height: '400px' }}>
                        <MapComponent data={currentData} />
                    </div>
                </div>

                {/* Columna derecha - Vista previa de tabla */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">📋</span>
                        Vista Previa de {tabs.find(t => t.id === activeTab)?.label}
                    </h4>
                    <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
                        <span>Mostrando los primeros 5 registros. Ver tabla completa abajo.</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            ✨ Layout Estable
                        </span>
                    </div>
                    {currentData.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <DataTable data={currentData.slice(0, 5)} />
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-4">Sin datos disponibles</div>
                    )}
                </div>
            </div>

            {/* Tabla completa con todas las funciones */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-800 flex items-center">
                        <span className="mr-2">📋</span>
                        Tabla Completa - {tabs.find(t => t.id === activeTab)?.label}
                        <span className="ml-3 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                            🔒 Anchos Fijos
                        </span>
                    </h4>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600">
                            Tabla completa con filtros, ordenamiento y búsqueda avanzada
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            💬 Tooltips Enriquecidos
                        </div>
                    </div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}