import React, { useMemo, useState } from 'react';
import { formatDateForDisplay } from '../../../utils/dataUtils';

const IncautacionesTable = ({ data }) => {
    const [sortField, setSortField] = useState('FECHA');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Ordenar y paginar datos
    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const sorted = [...data].sort((a, b) => {
            let aValue = a[sortField] || '';
            let bValue = b[sortField] || '';
            
            if (sortField === 'FECHA' || sortField === 'FECHA_ISO') {
                aValue = new Date(a.FECHA_ISO || a.FECHA || 0);
                bValue = new Date(b.FECHA_ISO || b.FECHA || 0);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
        });

        return sorted;
    }, [data, sortField, sortOrder]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="text-gray-500">⇅</span>;
        return sortOrder === 'asc' ? <span className="text-yellow-400">▲</span> : <span className="text-yellow-400">▼</span>;
    };

    const getIncautationType = (item) => {
        // Determinar tipo de incautación basado en los datos
        const desc = (item.DESCRIPCION || item.DESCRIPCIÓN || '').toLowerCase();
        const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();
        
        if (desc.includes('droga') || desc.includes('narcótico') || desc.includes('cocaína') || desc.includes('marihuana')) {
            return { type: 'Drogas', icon: '💊', color: 'bg-red-500/20 text-red-300' };
        } else if (desc.includes('arma') || desc.includes('pistola') || desc.includes('revolver') || desc.includes('munición')) {
            return { type: 'Armas', icon: '🔫', color: 'bg-orange-500/20 text-orange-300' };
        } else if (desc.includes('dinero') || desc.includes('efectivo') || desc.includes('divisas')) {
            return { type: 'Dinero', icon: '💰', color: 'bg-green-500/20 text-green-300' };
        } else if (desc.includes('vehículo') || desc.includes('auto') || desc.includes('camioneta')) {
            return { type: 'Vehículos', icon: '🚗', color: 'bg-blue-500/20 text-blue-300' };
        } else {
            return { type: 'Otros', icon: '📦', color: 'bg-gray-500/20 text-gray-300' };
        }
    };

    if (!data || data.length === 0) {
        return (
            <div className="bg-background-secondary rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detalle de Incautaciones</h3>
                <div className="text-gray-400 text-center py-8">
                    No hay datos de incautaciones para mostrar
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-secondary rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                    Detalle de Incautaciones ({sortedData.length})
                </h3>
                <div className="text-sm text-gray-400">
                    Página {currentPage} de {totalPages}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-600">
                            <th 
                                className="text-left py-3 px-2 text-gray-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('ID_OPERATIVO')}
                            >
                                ID Operativo <SortIcon field="ID_OPERATIVO" />
                            </th>
                            <th 
                                className="text-left py-3 px-2 text-gray-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('FECHA')}
                            >
                                Fecha <SortIcon field="FECHA" />
                            </th>
                            <th 
                                className="text-left py-3 px-2 text-gray-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('PROVINCIA')}
                            >
                                Provincia <SortIcon field="PROVINCIA" />
                            </th>
                            <th className="text-left py-3 px-2 text-gray-300">Tipo</th>
                            <th className="text-left py-3 px-2 text-gray-300">Descripción</th>
                            <th className="text-left py-3 px-2 text-gray-300">Cantidad</th>
                            <th className="text-left py-3 px-2 text-gray-300">Unidad</th>
                            <th className="text-left py-3 px-2 text-gray-300">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => {
                            const incautationType = getIncautationType(item);
                            
                            return (
                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                                    <td className="py-3 px-2 text-white font-mono text-xs">
                                        {item.ID_OPERATIVO || '-'}
                                    </td>
                                    <td className="py-3 px-2 text-gray-300">
                                        {formatDateForDisplay(item.FECHA_ISO || item.FECHA)}
                                        {item.HORA && (
                                            <div className="text-xs text-gray-500">{item.HORA}</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-2 text-gray-300">
                                        {item.PROVINCIA || '-'}
                                        {(item.DEPARTAMENTO_O_PARTIDO || item.DEPARTAMENTO) && (
                                            <div className="text-xs text-gray-500">
                                                {item.DEPARTAMENTO_O_PARTIDO || item.DEPARTAMENTO}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${incautationType.color} flex items-center gap-1 w-fit`}>
                                            <span>{incautationType.icon}</span>
                                            {incautationType.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-gray-300">
                                        <div className="max-w-xs">
                                            {item.DESCRIPCION || item.DESCRIPCIÓN || item.INCAUTACIONES || item.TIPO || '-'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 text-gray-300 text-center">
                                        <span className="font-semibold text-yellow-400">
                                            {item.CANTIDAD || item.CANT_INCAUTACIONES || '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-gray-300 text-center">
                                        {item.MEDIDAS || item.UNIDAD || '-'}
                                    </td>
                                    <td className="py-3 px-2 text-gray-300">
                                        <div className="max-w-xs truncate" title={item.OBSERVACIONES_INCAUTACION || item.OBSERVACIONES}>
                                            {item.OBSERVACIONES_INCAUTACION || item.OBSERVACIONES || '-'}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ← Anterior
                    </button>
                    
                    <div className="flex space-x-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === pageNum
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    );
};

export default IncautacionesTable;