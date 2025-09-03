import { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const ARGENTINE_PROVINCES = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa',
    'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta',
    'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
].sort();

// Función para obtener las fechas del mes actual
const getCurrentMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const fromDate = new Date(year, month, 1).toISOString().split('T')[0];
    const toDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    return { fromDate, toDate };
};

export default function FilterPanel() {
    const { filters, setFilters, data } = useDashboard();
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = Boolean(filters.fromDate || filters.toDate || filters.province);

    // Obtener rango de fechas de los datos
    const getDataDateRange = () => {
        if (!data || data.length === 0) return null;
        
        const dates = data
            .filter(item => item.FECHA_ISO)
            .map(item => new Date(item.FECHA_ISO))
            .sort((a, b) => a - b);
        
        if (dates.length === 0) return null;
        
        return {
            from: dates[0].toLocaleDateString('es-AR'),
            to: dates[dates.length - 1].toLocaleDateString('es-AR')
        };
    };

    const dateRange = getDataDateRange();

    const handleFromDateChange = (e) => {
        setFilters({ ...filters, fromDate: e.target.value });
    };
    const handleToDateChange = (e) => {
        setFilters({ ...filters, toDate: e.target.value });
    };
    const handleProvinceChange = (e) => {
        setFilters({ ...filters, province: e.target.value });
    };
    const clearAllFilters = () => {
        const currentMonth = getCurrentMonthDates();
        setFilters({
            fromDate: currentMonth.fromDate,
            toDate: currentMonth.toDate,
            province: ''
        });
    };
    const toggleFilterPanel = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <button
                onClick={toggleFilterPanel}
                className={`flex items-center px-3 py-2 border rounded-md transition-all ${hasActiveFilters
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-72">
                    <div className="mb-3">
                        <label htmlFor="province" className="block mb-1 text-xs font-medium text-gray-700">
                            Provincia
                        </label>
                        <select
                            id="province"
                            value={filters.province || ''}
                            onChange={handleProvinceChange}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todas las provincias</option>
                            {ARGENTINE_PROVINCES.map((province) => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Información de rango de fechas disponibles */}
                    {dateRange && (
                        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="text-xs font-medium text-blue-800 mb-1">
                                📅 Datos disponibles:
                            </div>
                            <div className="text-xs text-blue-700">
                                {dateRange.from} - {dateRange.to}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                            <label htmlFor="fromDate" className="block mb-1 text-xs font-medium text-gray-700">
                                Desde
                            </label>
                            <input
                                id="fromDate"
                                type="date"
                                value={filters.fromDate || ''}
                                onChange={handleFromDateChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="toDate" className="block mb-1 text-xs font-medium text-gray-700">
                                Hasta
                            </label>
                            <input
                                id="toDate"
                                type="date"
                                value={filters.toDate || ''}
                                onChange={handleToDateChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={clearAllFilters}
                            className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={toggleFilterPanel}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}