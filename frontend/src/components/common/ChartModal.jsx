import React from 'react';
import { formatValueWithPercentage } from '../../utils/chartUtils';

const ChartModal = ({ isOpen, onClose, data, title, type = 'bar' }) => {
    if (!isOpen || !data) return null;

    const { labels, datasets, clickedIndex, clickedLabel } = data;
    
    // Calcular totales y estadísticas
    const totalValues = datasets.reduce((acc, dataset) => {
        return acc + dataset.data.reduce((sum, val) => sum + val, 0);
    }, 0);

    const clickedData = clickedIndex !== undefined ? {
        label: clickedLabel || labels[clickedIndex],
        values: datasets.map(dataset => ({
            label: dataset.label,
            value: dataset.data[clickedIndex],
            color: Array.isArray(dataset.backgroundColor) 
                ? dataset.backgroundColor[clickedIndex] 
                : dataset.backgroundColor
        }))
    } : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal content */}
            <div className="relative z-10 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-800 rounded-lg shadow-xl border border-gray-600">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-600">
                    <h3 className="text-lg font-semibold text-white">
                        {title || 'Detalles del Gráfico'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Información del elemento clickeado */}
                    {clickedData && (
                        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                            <h4 className="text-md font-semibold text-white mb-3">
                                📊 Elemento Seleccionado
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-200">Categoría:</span>
                                    <span className="text-white font-medium">{clickedData.label}</span>
                                </div>
                                {clickedData.values.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-gray-200">{item.label}:</span>
                                        </div>
                                        <span className="text-white font-medium">
                                            {formatValueWithPercentage(item.value, totalValues)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resumen completo */}
                    <div className="mb-6">
                        <h4 className="text-md font-semibold text-white mb-3">
                            📈 Resumen Completo
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-700 rounded-lg">
                                <div className="text-sm text-gray-400">Total de Registros</div>
                                <div className="text-xl font-bold text-white">{totalValues}</div>
                            </div>
                            <div className="p-3 bg-gray-700 rounded-lg">
                                <div className="text-sm text-gray-400">Categorías</div>
                                <div className="text-xl font-bold text-white">{labels.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla detallada */}
                    <div>
                        <h4 className="text-md font-semibold text-white mb-3">
                            📋 Datos Detallados
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="text-left py-2 px-3 text-gray-200 font-medium">Categoría</th>
                                        {datasets.map((dataset, idx) => (
                                            <th key={idx} className="text-right py-2 px-3 text-gray-200 font-medium">
                                                {dataset.label}
                                            </th>
                                        ))}
                                        <th className="text-right py-2 px-3 text-gray-200 font-medium">% del Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labels.map((label, idx) => {
                                        const rowTotal = datasets.reduce((sum, dataset) => sum + dataset.data[idx], 0);
                                        const percentage = totalValues > 0 ? ((rowTotal / totalValues) * 100).toFixed(1) : '0';
                                        
                                        return (
                                            <tr 
                                                key={idx} 
                                                className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                                                    clickedIndex === idx ? 'bg-gray-600' : ''
                                                }`}
                                            >
                                                <td className="py-2 px-3 text-white font-medium">
                                                    {label}
                                                </td>
                                                {datasets.map((dataset, datasetIdx) => {
                                                    const value = dataset.data[idx];
                                                    const valuePercentage = totalValues > 0 ? ((value / totalValues) * 100).toFixed(1) : '0';
                                                    return (
                                                        <td key={datasetIdx} className="py-2 px-3 text-right text-gray-200">
                                                            {value} ({valuePercentage}%)
                                                        </td>
                                                    );
                                                })}
                                                <td className="py-2 px-3 text-right text-white font-medium">
                                                    {percentage}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-500 bg-gray-700">
                                        <td className="py-2 px-3 text-white font-bold">Total</td>
                                        {datasets.map((dataset, idx) => {
                                            const datasetTotal = dataset.data.reduce((sum, val) => sum + val, 0);
                                            return (
                                                <td key={idx} className="py-2 px-3 text-right text-white font-bold">
                                                    {datasetTotal}
                                                </td>
                                            );
                                        })}
                                        <td className="py-2 px-3 text-right text-white font-bold">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t border-gray-600">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChartModal;
