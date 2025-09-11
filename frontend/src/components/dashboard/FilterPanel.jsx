import { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const ARGENTINE_PROVINCES = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa',
    'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta',
    'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
].sort();

export default function FilterPanel({ inline = false, className = '' }) {
    const { filters, setFilters, dataStats, filteredData } = useDashboard();
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = Boolean(filters.fromDate || filters.toDate || filters.province);

    // Se removió el banner informativo; no es necesario calcular 'dateRange'

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
        setFilters({ ...filters, province: e.target.value, departamento: '' });
    };
    const clearAllFilters = () => {
        // Si hay rango de fechas, fijar al último mes disponible (según latest)
        const latest = dataStats?.dateRange?.latest;
        if (latest && latest !== '-') {
            try {
                const d = new Date(latest);
                if (!isNaN(d.getTime())) {
                    const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
                    const firstISO = firstOfMonth.toISOString().slice(0,10);
                    // último día del mes
                    const lastOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                    const lastISO = lastOfMonth.toISOString().slice(0,10);
                    setFilters({ fromDate: firstISO, toDate: lastISO, province: '' });
                    return;
                }
            } catch {
                // si no es parseable, seguir con fallback
            }
        }
        // Fallback: sin rango válido
        setFilters({ fromDate: '', toDate: '', province: '', departamento: '', unidad: '' });
    };
    const toggleFilterPanel = () => {
        setIsOpen(!isOpen);
    };

    // Listas dinámicas: Departamentos y Unidades desde filteredData (según provincia si aplica)
    const computeUniqueSorted = (arr) => {
        return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
    };
    const deptList = computeUniqueSorted(
        (filteredData || [])
            .filter(item => !filters.province || (item.PROVINCIA && item.PROVINCIA.trim() !== '-'))
            .map(item => item.DEPARTAMENTO_O_PARTIDO || item.DEPARTAMENTO || item.departamento || item['DEPARTAMENTO O PARTIDO'] || item.PARTIDO || item.partido)
    );
    const unitList = computeUniqueSorted(
        (filteredData || [])
            .map(item => item.UNIDAD_INTERVINIENTE || item.unidad_interviniente || item.UNIDAD || item.FUERZA_INTERVINIENTE)
    );

    // Render inline (visible) controls next to the title in the navbar
    if (inline) {
        return (
            <div className={`flex items-end gap-2 ${className}`}>
                <div>
                    <label htmlFor="province-inline" className="block mb-1 text-xs font-medium text-gray-700">Provincia</label>
                    <select
                        id="province-inline"
                        value={filters.province || ''}
                        onChange={handleProvinceChange}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todas</option>
                        {ARGENTINE_PROVINCES.map((province) => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="fromDate-inline" className="block mb-1 text-xs font-medium text-gray-700">Desde</label>
                    <input
                        id="fromDate-inline"
                        type="date"
                        value={filters.fromDate || ''}
                        min={dateLimits.min || undefined}
                        max={dateLimits.max || undefined}
                        onChange={handleFromDateChange}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="toDate-inline" className="block mb-1 text-xs font-medium text-gray-700">Hasta</label>
                    <input
                        id="toDate-inline"
                        type="date"
                        value={filters.toDate || ''}
                        min={dateLimits.min || undefined}
                        max={dateLimits.max || undefined}
                        onChange={handleToDateChange}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="departamento-inline" className="block mb-1 text-xs font-medium text-gray-700">Departamento</label>
                    <select
                        id="departamento-inline"
                        value={filters.departamento || ''}
                        onChange={(e) => setFilters({ ...filters, departamento: e.target.value })}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todos</option>
                        {deptList.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="unidad-inline" className="block mb-1 text-xs font-medium text-gray-700">Unidad</label>
                    <select
                        id="unidad-inline"
                        value={filters.unidad || ''}
                        onChange={(e) => setFilters({ ...filters, unidad: e.target.value })}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todas</option>
                        {unitList.map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
                <div className="pb-0.5">
                    <button
                        onClick={clearAllFilters}
                        className="mt-5 px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                        title="Limpiar filtros"
                    >
                        Limpiar
                    </button>
                </div>
            </div>
        );
    }

    // Default: button + dropdown panel
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

                    <div className="mb-3">
                        <label htmlFor="departamento" className="block mb-1 text-xs font-medium text-gray-700">Departamento</label>
                        <select
                            id="departamento"
                            value={filters.departamento || ''}
                            onChange={(e) => setFilters({ ...filters, departamento: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos los departamentos</option>
                            {deptList.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="unidad" className="block mb-1 text-xs font-medium text-gray-700">Unidad</label>
                        <select
                            id="unidad"
                            value={filters.unidad || ''}
                            onChange={(e) => setFilters({ ...filters, unidad: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todas las unidades</option>
                            {unitList.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                            <label htmlFor="fromDate" className="block mb-1 text-xs font-medium text-gray-700">
                                Desde
                            </label>
                            <input
                                id="fromDate"
                                type="date"
                                value={filters.fromDate || ''}
                                min={dateLimits.min || undefined}
                                max={dateLimits.max || undefined}
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
                                min={dateLimits.min || undefined}
                                max={dateLimits.max || undefined}
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