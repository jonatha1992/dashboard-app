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

    const renderIncautacionesTable = () => {
        const incautaciones = data.incautaciones || [];
        
        if (incautaciones.length === 0) {
            return <div className="text-gray-500 text-center py-8">No hay incautaciones registradas</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left p-3 font-medium">ID Operativo</th>
                            <th className="text-left p-3 font-medium">Provincia</th>
                            <th className="text-left p-3 font-medium">Fecha</th>
                            <th className="text-left p-3 font-medium">Incautación</th>
                            <th className="text-left p-3 font-medium">Tipo</th>
                            <th className="text-right p-3 font-medium">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incautaciones.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-xs">{item.procedimiento_info?.ID_OPERATIVO || 'N/A'}</td>
                                <td className="p-3">{item.procedimiento_info?.PROVINCIA || 'N/A'}</td>
                                <td className="p-3">{item.procedimiento_info?.FECHA || 'N/A'}</td>
                                <td className="p-3">{item.incautaciones || 'N/A'}</td>
                                <td className="p-3">{item.tipo || 'N/A'}</td>
                                <td className="p-3 text-right">{item.cantidad || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderDetenidosTable = () => {
        const detenidos = data.detenidos || [];
        
        if (detenidos.length === 0) {
            return <div className="text-gray-500 text-center py-8">No hay detenidos registrados</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left p-3 font-medium">ID Operativo</th>
                            <th className="text-left p-3 font-medium">Provincia</th>
                            <th className="text-left p-3 font-medium">Fecha</th>
                            <th className="text-right p-3 font-medium">Edad</th>
                            <th className="text-left p-3 font-medium">Sexo</th>
                            <th className="text-left p-3 font-medium">Nacionalidad</th>
                            <th className="text-left p-3 font-medium">Situación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detenidos.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-xs">{item.procedimiento_info?.ID_OPERATIVO || 'N/A'}</td>
                                <td className="p-3">{item.procedimiento_info?.PROVINCIA || 'N/A'}</td>
                                <td className="p-3">{item.procedimiento_info?.FECHA || 'N/A'}</td>
                                <td className="p-3 text-right">{item.edad || 'N/A'}</td>
                                <td className="p-3">{item.sexo || 'N/A'}</td>
                                <td className="p-3">{item.nacionalidad || 'N/A'}</td>
                                <td className="p-3">{item.situacion_procesal || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderControladosTable = () => {
        const controlados = data.controlados || [];
        
        if (controlados.length === 0) {
            return <div className="text-gray-500 text-center py-8">No hay controles registrados</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left p-3 font-medium">ID Operativo</th>
                            <th className="text-left p-3 font-medium">Provincia</th>
                            <th className="text-left p-3 font-medium">Fecha</th>
                            <th className="text-right p-3 font-medium">Vehículos</th>
                            <th className="text-right p-3 font-medium">Personas</th>
                            <th className="text-right p-3 font-medium">Embarcaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {controlados.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-xs">{item.procedimiento_info?.ID_OPERATIVO || 'N/A'}</td>
                                <td className="p-3">{item.procedimiento_info?.PROVINCIA || 'N/A'}</td>
                                <td className="p-3">{item.procedimiento_info?.FECHA || 'N/A'}</td>
                                <td className="p-3 text-right">{item.vehiculos_controlados || 0}</td>
                                <td className="p-3 text-right">{item.personas_controladas || 0}</td>
                                <td className="p-3 text-right">{item.cant_embarcaciones_controladas || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderAfectadosTable = () => {
        const afectados = data.afectados || [];
        
        if (afectados.length === 0) {
            return <div className="text-gray-500 text-center py-8">No hay personal afectado registrado</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left p-3 font-medium">ID Operativo</th>
                            <th className="text-left p-3 font-medium">Provincia</th>
                            <th className="text-left p-3 font-medium">Fecha</th>
                            <th className="text-right p-3 font-medium">Efectivos</th>
                            <th className="text-right p-3 font-medium">Autos/Camionetas</th>
                            <th className="text-right p-3 font-medium">Motocicletas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {afectados.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-xs">{item.procedimiento_info?.ID_OPERATIVO || 'N/A'}</td>
                                <td className="p-3">{item.procedimiento_info?.PROVINCIA || 'N/A'}</td>
                                <td className="p-3">{item.procedimiento_info?.FECHA || 'N/A'}</td>
                                <td className="p-3 text-right font-semibold">{item.cant_efectivos || 0}</td>
                                <td className="p-3 text-right">{item.cant_autos_camionetas || 0}</td>
                                <td className="p-3 text-right">{item.cant_motocicletas || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderTable = () => {
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

        switch (activeTab) {
            case 'incautaciones':
                return renderIncautacionesTable();
            case 'detenidos':
                return renderDetenidosTable();
            case 'controlados':
                return renderControladosTable();
            case 'afectados':
                return renderAfectadosTable();
            default:
                return <div>Selecciona una tabla para ver</div>;
        }
    };

    if (!user) {
        return null;
    }

    const currentData = data[activeTab] || [];
    const recordCount = currentData.length;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    🗂️ Datos Filtrados por Tabla Especializada
                </h3>
                <p className="text-sm text-gray-600">
                    Visualización de datos reales después del filtrado inteligente
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

            {/* Record Count */}
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Mostrando {recordCount.toLocaleString()} registros con datos reales
                </div>
                <button
                    onClick={() => loadData(activeTab)}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                    Actualizar
                </button>
            </div>

            {/* Main Content Area - Mapa y Tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda - Mapa */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🗺️</span>
                        Mapa de {tabs.find(t => t.id === activeTab)?.label}
                    </h4>
                    <div style={{ height: '400px' }}>
                        <MapComponent data={currentData} />
                    </div>
                </div>

                {/* Columna derecha - Tabla */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <DataTable data={currentData} />
                </div>
            </div>

            {/* Tabla completa abajo */}
            <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">
                    Tabla Detallada
                </h4>
                {renderTable()}
            </div>
        </div>
    );
}