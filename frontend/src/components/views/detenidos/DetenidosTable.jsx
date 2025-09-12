import React, { useMemo, useState } from 'react';
import { formatDateForDisplay } from '../../../utils/dataUtils';

const DetenidosTable = ({ data }) => {
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
        return sortOrder === 'asc' ? <span className="text-blue-400">▲</span> : <span className="text-blue-400">▼</span>;
    };

    if (!data || data.length === 0) {
        return (
            <div className="bg-background-secondary rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detalle de Detenidos</h3>
                <div className="text-gray-400 text-center py-8">
                    No hay datos de detenidos para mostrar
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-secondary rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                    Detalle de Detenidos ({sortedData.length})
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
                            <th className="text-left py-3 px-2 text-gray-300">Edad</th>
                            <th className="text-left py-3 px-2 text-gray-300">Sexo</th>
                            <th className="text-left py-3 px-2 text-gray-300">Nacionalidad</th>
                            <th 
                                className="text-left py-3 px-2 text-gray-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('DELITO_IMPUTADO')}
                            >
                                Delito <SortIcon field="DELITO_IMPUTADO" />
                            </th>
                            <th className="text-left py-3 px-2 text-gray-300">Situación Procesal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
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
                                <td className="py-3 px-2 text-gray-300">
                                    {item.EDAD || '-'}
                                </td>
                                <td className="py-3 px-2 text-gray-300">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        item.SEXO === 'M' ? 'bg-blue-500/20 text-blue-300' :
                                        item.SEXO === 'F' ? 'bg-pink-500/20 text-pink-300' :
                                        'bg-gray-500/20 text-gray-300'
                                    }`}>
                                        {item.SEXO === 'M' ? '♂ Masculino' :
                                         item.SEXO === 'F' ? '♀ Femenino' :
                                         item.SEXO || '-'}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-gray-300">
                                    {item.NACIONALIDAD || '-'}
                                </td>
                                <td className="py-3 px-2 text-gray-300">
                                    <div className="max-w-xs truncate" title={item.DELITO_IMPUTADO}>
                                        {item.DELITO_IMPUTADO || '-'}
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-gray-300">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        item.SITUACION_PROCESAL?.includes('PROCESADO') ? 'bg-red-500/20 text-red-300' :
                                        item.SITUACION_PROCESAL?.includes('LIBERTAD') ? 'bg-green-500/20 text-green-300' :
                                        'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                        {item.SITUACION_PROCESAL || 'Sin datos'}
                                    </span>
                                </td>
                            </tr>
                        ))}
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
                                            ? 'bg-blue-600 text-white'
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

export default DetenidosTable;