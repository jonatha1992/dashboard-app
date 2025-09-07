import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

export default function FilteringStatsDashboard() {
    const { user } = useAuth();
    const [filteringStats, setFilteringStats] = useState([]);
    const [specializedStats, setSpecializedStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadFilteringStats = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                const [filteringData, specializedData] = await Promise.all([
                    apiService.getFilteringStats(),
                    apiService.getSpecializedStats()
                ]);

                setFilteringStats(filteringData);
                setSpecializedStats(specializedData);
            } catch (err) {
                console.error('Error loading filtering stats:', err);
                setError('Error al cargar estadísticas de filtrado');
            } finally {
                setLoading(false);
            }
        };

        loadFilteringStats();
    }, [user]);

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                <div className="text-red-600 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            {specializedStats && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        📊 Resumen de Tablas Especializadas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {specializedStats.total_specialized_records?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Registros</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {specializedStats.incautaciones_count?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Incautaciones</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {specializedStats.detenidos_count?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Detenidos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {specializedStats.controlados_count?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Controlados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {specializedStats.afectados_count?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Afectados</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Filtering Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    🔍 Estadísticas Detalladas de Filtrado
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="text-left p-3 font-medium text-gray-700">Tabla</th>
                                <th className="text-right p-3 font-medium text-gray-700">Total Orig.</th>
                                <th className="text-right p-3 font-medium text-gray-700">Filtrados</th>
                                <th className="text-right p-3 font-medium text-gray-700">Omitidos</th>
                                <th className="text-right p-3 font-medium text-gray-700">% Reducción</th>
                                <th className="text-left p-3 font-medium text-gray-700">Criterio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteringStats.map((stat, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">
                                        {stat.tabla}
                                    </td>
                                    <td className="p-3 text-right text-gray-600">
                                        {stat.registros_total.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right">
                                        <span className="font-medium text-green-600">
                                            {stat.registros_filtrados.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <span className="font-medium text-red-600">
                                            {stat.registros_omitidos.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <span className={`font-medium ${
                                                stat.porcentaje_reduccion > 50 ? 'text-green-600' :
                                                stat.porcentaje_reduccion > 0 ? 'text-yellow-600' : 'text-gray-600'
                                            }`}>
                                                {stat.porcentaje_reduccion}%
                                            </span>
                                            {stat.porcentaje_reduccion > 0 && (
                                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            stat.porcentaje_reduccion > 50 ? 'bg-green-500' :
                                                            stat.porcentaje_reduccion > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                                                        }`}
                                                        style={{width: `${Math.min(stat.porcentaje_reduccion, 100)}%`}}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 text-xs text-gray-600">
                                        <code className="bg-gray-100 px-2 py-1 rounded">
                                            {stat.criterio_filtrado}
                                        </code>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Optimization Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    ✅ Resumen de Optimización
                </h3>
                <div className="text-sm text-gray-700">
                    <p>
                        El sistema de filtrado inteligente elimina registros vacíos e innecesarios, 
                        optimizando el rendimiento de la base de datos y mejorando la calidad de los datos.
                    </p>
                    <ul className="mt-3 space-y-1 ml-4">
                        <li>• <strong>Incautaciones:</strong> Solo registros con incautaciones reales</li>
                        <li>• <strong>Detenidos:</strong> Solo personas con datos de edad válidos</li>
                        <li>• <strong>Controlados:</strong> Solo controles efectivos de vehículos/personas</li>
                        <li>• <strong>Afectados:</strong> Solo registros con personal afectado &gt; 0</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}