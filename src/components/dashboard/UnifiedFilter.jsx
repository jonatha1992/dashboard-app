import { useState } from 'react';

const ARGENTINE_PROVINCES = [
    'Buenos Aires',
    'Catamarca', 
    'Chaco',
    'Chubut',
    'Ciudad Autónoma de Buenos Aires',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
].sort();

export default function UnifiedFilter({ onFiltersChange }) {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');

    const handleFromDateChange = (e) => {
        const newFromDate = e.target.value;
        setFromDate(newFromDate);
        onFiltersChange({
            fromDate: newFromDate,
            toDate,
            province: selectedProvince
        });
    };

    const handleToDateChange = (e) => {
        const newToDate = e.target.value;
        setToDate(newToDate);
        onFiltersChange({
            fromDate,
            toDate: newToDate,
            province: selectedProvince
        });
    };

    const handleProvinceChange = (e) => {
        const newProvince = e.target.value;
        setSelectedProvince(newProvince);
        onFiltersChange({
            fromDate,
            toDate,
            province: newProvince
        });
    };

    const clearAllFilters = () => {
        setFromDate('');
        setToDate('');
        setSelectedProvince('');
        onFiltersChange({
            fromDate: '',
            toDate: '',
            province: ''
        });
    };

    const hasActiveFilters = fromDate || toDate || selectedProvince;

    return (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                {/* Provincia */}
                <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia
                    </label>
                    <select
                        id="province"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="">Todas las provincias</option>
                        {ARGENTINE_PROVINCES.map((province) => (
                            <option key={province} value={province}>
                                {province}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Desde */}
                <div>
                    <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Desde
                    </label>
                    <input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        onChange={handleFromDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Hasta */}
                <div>
                    <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Hasta
                    </label>
                    <input
                        id="toDate"
                        type="date"
                        value={toDate}
                        onChange={handleToDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Limpiar */}
                {hasActiveFilters && (
                    <div>
                        <button
                            onClick={clearAllFilters}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                            Limpiar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}