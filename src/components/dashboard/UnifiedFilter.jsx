import { useDashboard } from '../../contexts/DashboardContext';

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

const { filters, setFilters } = useDashboard();
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
    setFilters({ fromDate: '', toDate: '', province: '' });
};
const hasActiveFilters = filters.fromDate || filters.toDate || filters.province;

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
                    value={filters.province || ''}
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
                    value={filters.fromDate || ''}
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
                    value={filters.toDate || ''}
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