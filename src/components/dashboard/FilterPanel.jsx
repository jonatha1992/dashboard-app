import { useState, useEffect } from 'react';

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

export default function FilterPanel({ onFiltersChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const currentMonthDates = getCurrentMonthDates();
    const [fromDate, setFromDate] = useState(currentMonthDates.fromDate);
    const [toDate, setToDate] = useState(currentMonthDates.toDate);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [hasActiveFilters, setHasActiveFilters] = useState(true); // Inicializar como true porque tenemos fechas por defecto

    // Inicializar filtros con las fechas del mes actual
    useEffect(() => {
        onFiltersChange({
            fromDate: currentMonthDates.fromDate,
            toDate: currentMonthDates.toDate,
            province: ''
        });
    }, [onFiltersChange, currentMonthDates.fromDate, currentMonthDates.toDate]);

    const handleFromDateChange = (e) => {
        const newFromDate = e.target.value;
        setFromDate(newFromDate);
        updateFilters(newFromDate, toDate, selectedProvince);
    };

    const handleToDateChange = (e) => {
        const newToDate = e.target.value;
        setToDate(newToDate);
        updateFilters(fromDate, newToDate, selectedProvince);
    };

    const handleProvinceChange = (e) => {
        const newProvince = e.target.value;
        setSelectedProvince(newProvince);
        updateFilters(fromDate, toDate, newProvince);
    };

    const updateFilters = (from, to, province) => {
        const hasFilters = from || to || province;
        setHasActiveFilters(hasFilters);
        onFiltersChange({
            fromDate: from,
            toDate: to,
            province: province
        });
    };

    const clearAllFilters = () => {
        const currentMonth = getCurrentMonthDates();
        setFromDate(currentMonth.fromDate);
        setToDate(currentMonth.toDate);
        setSelectedProvince('');
        setHasActiveFilters(true); // Mantener activo porque tenemos las fechas del mes actual
        onFiltersChange({
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros {hasActiveFilters && <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">•</span>}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4 w-72 border border-gray-200">
                    <div className="mb-3">
                        <label htmlFor="province" className="block text-xs font-medium text-gray-700 mb-1">
                            Provincia
                        </label>
                        <select
                            id="province"
                            value={selectedProvince}
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

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                            <label htmlFor="fromDate" className="block text-xs font-medium text-gray-700 mb-1">
                                Desde
                            </label>
                            <input
                                id="fromDate"
                                type="date"
                                value={fromDate}
                                onChange={handleFromDateChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="toDate" className="block text-xs font-medium text-gray-700 mb-1">
                                Hasta
                            </label>
                            <input
                                id="toDate"
                                type="date"
                                value={toDate}
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