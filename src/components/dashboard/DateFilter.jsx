import { useState } from 'react';

export default function DateFilter({ onDateChange }) {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleFromDateChange = (e) => {
        const newFromDate = e.target.value;
        setFromDate(newFromDate);
        onDateChange({ fromDate: newFromDate, toDate });
    };

    const handleToDateChange = (e) => {
        const newToDate = e.target.value;
        setToDate(newToDate);
        onDateChange({ fromDate, toDate: newToDate });
    };

    const clearFilters = () => {
        setFromDate('');
        setToDate('');
        onDateChange({ fromDate: '', toDate: '' });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtros de Fecha</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Desde:
                            </label>
                            <input
                                id="fromDate"
                                type="date"
                                value={fromDate}
                                onChange={handleFromDateChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Hasta:
                            </label>
                            <input
                                id="toDate"
                                type="date"
                                value={toDate}
                                onChange={handleToDateChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
                {(fromDate || toDate) && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                        Limpiar
                    </button>
                )}
            </div>
        </div>
    );
}