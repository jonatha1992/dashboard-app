import { useDashboard } from '../../contexts/DashboardContext';

const ARGENTINE_PROVINCES = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Ciudad Aut\u00f3noma de Buenos Aires',
    'C\u00f3rdoba',
    'Corrientes',
    'Entre R\u00edos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuqu\u00e9n',
    'R\u00edo Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucum\u00e1n'
].sort();

export default function UnifiedFilter() {
    const { filters, setFilters, dataStats } = useDashboard();
    
    // Obtener límites de fechas reales desde dataStats
    const getDateLimits = () => {
        if (!dataStats || !dataStats.dateRange) return { min: null, max: null };
        
        const { earliest, latest } = dataStats.dateRange;
        
        if (!earliest || !latest || earliest === '-' || latest === '-') {
            return { min: null, max: null };
        }
        
        return {
            min: earliest,
            max: latest
        };
    };

    const dateLimits = getDateLimits();

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
        // Usar las fechas reales disponibles en lugar de vacío
        const realDateRange = dateLimits.min && dateLimits.max 
            ? { fromDate: dateLimits.min, toDate: dateLimits.max }
            : { fromDate: '', toDate: '' };
        
        setFilters({
            ...realDateRange,
            province: ''
        });
    };
    const hasActiveFilters = filters.fromDate || filters.toDate || filters.province;

    return (
        <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
            <div className="grid items-end grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {/* Provincia */}
                <div>
                    <label htmlFor="province" className="block mb-1 text-sm font-medium text-gray-700">
                        Provincia
                    </label>
                    <select
                        id="province"
                        value={filters.province || ''}
                        onChange={handleProvinceChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <label htmlFor="fromDate" className="block mb-1 text-sm font-medium text-gray-700">
                        Desde
                    </label>
                    <input
                        id="fromDate"
                        type="date"
                        value={filters.fromDate || ''}
                        min={dateLimits.min || undefined}
                        max={dateLimits.max || undefined}
                        onChange={handleFromDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Hasta */}
                <div>
                    <label htmlFor="toDate" className="block mb-1 text-sm font-medium text-gray-700">
                        Hasta
                    </label>
                    <input
                        id="toDate"
                        type="date"
                        value={filters.toDate || ''}
                        min={dateLimits.min || undefined}
                        max={dateLimits.max || undefined}
                        onChange={handleToDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Limpiar */}
                {hasActiveFilters && (
                    <div>
                        <button
                            onClick={clearAllFilters}
                            className="w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-500 rounded-md hover:bg-gray-600"
                        >
                            Limpiar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}