import { useMemo, useState, useCallback } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { OPERATIVE_CODE_ENTRIES, OPERATIVE_CODE_MAP } from '../../constants/operativeCodes';
import DateInput from '../common/DateInput';
import { parseDateToISO, normalizeProvinceKey, getOperativoCodeFromItem } from '../../utils/dataUtils';

const ARGENTINE_PROVINCES = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autonoma de Buenos Aires',
    'Cordoba', 'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa',
    'La Rioja', 'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta',
    'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucuman'
].sort();

const getUnitFromItem = (item) => {
    const unit = item.UNIDAD_INTERVINIENTE ||
        item.unidad_interviniente ||
        item.UNIDAD ||
        item.FUERZA_INTERVINIENTE ||
        '';
    return String(unit || '').trim();
};

const logPatch = (prev, patch, next) => {
    console.groupCollapsed('[FilterPanel] Actualizacion de filtros');
    console.table({
        anterior: prev,
        cambio: patch,
        resultado: next
    });
    console.groupEnd();
};

export default function FilterPanel({ inline = false, className = '', compact = false }) {
    const {
        data,
        filters,
        setFilters,
        dataStats,
        availableOperativeCodes,
        unitsByProvince,
        availableUnits
    } = useDashboard();

    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = Boolean(filters.fromDate || filters.toDate || filters.province || filters.unidad || filters.operativoCodigo);

    const dateLimits = useMemo(() => {
        const { dateRange } = dataStats || {};
        if (!dateRange) return { min: null, max: null };
        const { earliest, latest } = dateRange;
        if (!earliest || !latest || earliest === '-' || latest === '-') {
            return { min: null, max: null };
        }
        return { min: earliest, max: latest };
    }, [dataStats]);

    const normalizedProvince = useMemo(
        () => (filters.province ? normalizeProvinceKey(filters.province) : ''),
        [filters.province]
    );

    const datasetForSelectors = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return [];
        return data.filter((item) => {
            const dateIso = item.FECHA_ISO || item.fecha_iso || parseDateToISO(item.FECHA || item.fecha || item['FECHA - DETALLE']);
            if (filters.fromDate && (!dateIso || dateIso < filters.fromDate)) return false;
            if (filters.toDate && (!dateIso || dateIso > filters.toDate)) return false;
            if (normalizedProvince) {
                const itemProvince = normalizeProvinceKey(
                    item.PROVINCIA ||
                    item.provincia ||
                    item.Provincia ||
                    item.province ||
                    item.PROV ||
                    item.prov
                );
                if (itemProvince !== normalizedProvince) return false;
            }
            return true;
        });
    }, [data, filters.fromDate, filters.toDate, normalizedProvince]);

    const unitOptions = useMemo(() => {
        if (filters.province && unitsByProvince?.[filters.province]?.length) {
            return unitsByProvince[filters.province];
        }
        const derived = datasetForSelectors.map(getUnitFromItem).filter(Boolean);
        const combined = derived.length ? derived : availableUnits;
        return Array.from(new Set(combined)).sort((a, b) => a.localeCompare(b, 'es'));
    }, [datasetForSelectors, filters.province, unitsByProvince, availableUnits]);

    const operativeOptions = useMemo(() => {
        const knownOptions = OPERATIVE_CODE_ENTRIES.map(({ code, name }) => ({ code, name }));
        const knownCodes = new Set(knownOptions.map((item) => item.code));

        const dynamicCodes = (availableOperativeCodes || [])
            .map((code) => String(code).trim())
            .filter((code) => code && !knownCodes.has(code));

        const inferredCodes = datasetForSelectors
            .map((item) => getOperativoCodeFromItem(item))
            .map((code) => String(code).trim())
            .filter((code) => code && !knownCodes.has(code) && !dynamicCodes.includes(code));

        const extras = [...dynamicCodes, ...inferredCodes].map((code) => ({
            code,
            name: OPERATIVE_CODE_MAP[code]?.name || code
        }));

        return [...knownOptions, ...extras];
    }, [availableOperativeCodes, datasetForSelectors]);

    const applyFilterPatch = useCallback((patch) => {
        const next = { ...filters, ...patch };
        logPatch(filters, patch, next);
        setFilters(patch);
    }, [filters, setFilters]);

    const handleFromDateChange = (e) => applyFilterPatch({ fromDate: e.target.value });
    const handleToDateChange = (e) => applyFilterPatch({ toDate: e.target.value });
    const handleProvinceChange = (e) => applyFilterPatch({ province: e.target.value });
    const handleUnitChange = (e) => applyFilterPatch({ unidad: e.target.value });
    const handleOperativoChange = (e) => applyFilterPatch({ operativoCodigo: e.target.value });

    const clearAllFilters = () => {
        console.warn('[FilterPanel] Restableciendo filtros manualmente');
        applyFilterPatch({ fromDate: '', toDate: '', province: '', unidad: '', operativoCodigo: '' });
    };

    const toggleFilterPanel = () => setIsOpen(!isOpen);

    const renderOperativoSelect = (props = {}) => (
        <div className={props.wrapperClassName ?? ''}>
            <label htmlFor={props.id ?? 'operativo-codigo'} className={props.labelClassName ?? 'block mb-1 text-xs font-medium text-gray-700'}>
                Codigo Operativo
            </label>
            <select
                id={props.id ?? 'operativo-codigo'}
                value={filters.operativoCodigo || ''}
                onChange={handleOperativoChange}
                className={props.selectClassName ?? 'w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500'}
            >
                <option value="">Todos los codigos</option>
                {operativeOptions.map(({ code, name }) => {
                    const description = OPERATIVE_CODE_MAP[code]?.description;
                    const label = name ? `${code} - ${name}` : code;
                    return (
                        <option key={code} value={code} title={description || label}>
                            {label}
                        </option>
                    );
                })}
            </select>
        </div>
    );

    const renderProvinceSelect = (props = {}) => (
        <div className={props.wrapperClassName ?? ''}>
            <label htmlFor={props.id ?? 'province'} className={props.labelClassName ?? 'block mb-1 text-xs font-medium text-gray-700'}>
                Provincia
            </label>
            <select
                id={props.id ?? 'province'}
                value={filters.province || ''}
                onChange={handleProvinceChange}
                className={props.selectClassName ?? 'w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500'}
            >
                <option value="">Todas las provincias</option>
                {ARGENTINE_PROVINCES.map((province) => (
                    <option key={province} value={province}>{province}</option>
                ))}
            </select>
        </div>
    );

    const renderUnitSelect = (props = {}) => (
        <div className={props.wrapperClassName ?? ''}>
            <label htmlFor={props.id ?? 'unidad'} className={props.labelClassName ?? 'block mb-1 text-xs font-medium text-gray-700'}>
                Unidad
            </label>
            <select
                id={props.id ?? 'unidad'}
                value={filters.unidad || ''}
                onChange={handleUnitChange}
                className={props.selectClassName ?? 'w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500'}
            >
                <option value="">Todas las unidades</option>
                {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                ))}
            </select>
        </div>
    );

    if (inline) {
        if (compact) {
            return (
                <div className={`flex items-center gap-2 ${className}`}>
                    {hasActiveFilters && (<span className="px-2 py-0.5 text-[10px] bg-green-500 text-white rounded-full">Filtros</span>)}
                    <div className="flex items-end gap-2">
                        {renderOperativoSelect({
                            id: 'operativo-inline',
                            wrapperClassName: 'flex flex-col',
                            labelClassName: 'block mb-1 text-[10px] font-medium text-white',
                            selectClassName: 'px-2 py-1 text-xs bg-primary-800 text-white border border-primary-600 rounded-md focus:ring-primary-400 focus:border-primary-400 max-w-[140px]'
                        })}
                        {renderProvinceSelect({
                            id: 'province-inline',
                            wrapperClassName: 'flex flex-col',
                            labelClassName: 'block mb-1 text-[10px] font-medium text-white',
                            selectClassName: 'px-2 py-1 text-xs bg-primary-800 text-white border border-primary-600 rounded-md focus:ring-primary-400 focus:border-primary-400'
                        })}
                        {renderUnitSelect({
                            id: 'unidad-inline',
                            wrapperClassName: 'flex flex-col',
                            labelClassName: 'block mb-1 text-[10px] font-medium text-white',
                            selectClassName: 'px-2 py-1 text-xs bg-primary-800 text-white border border-primary-600 rounded-md focus:ring-primary-400 focus:border-primary-400 max-w-[140px]'
                        })}
                        <div>
                            <label htmlFor="fromDate-inline" className="block mb-1 text-[10px] font-medium text-white">Desde</label>
                            <DateInput
                                id="fromDate-inline"
                                value={filters.fromDate || ''}
                                min={dateLimits.min || undefined}
                                max={dateLimits.max || undefined}
                                onChange={handleFromDateChange}
                                className="bg-primary-800 text-white border-primary-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="toDate-inline" className="block mb-1 text-[10px] font-medium text-white">Hasta</label>
                            <DateInput
                                id="toDate-inline"
                                value={filters.toDate || ''}
                                min={dateLimits.min || undefined}
                                max={dateLimits.max || undefined}
                                onChange={handleToDateChange}
                                className="bg-primary-800 text-white border-primary-600"
                            />
                        </div>
                        <button onClick={clearAllFilters} className="mt-auto px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700">
                            Limpiar
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className={`grid grid-cols-1 gap-3 md:grid-cols-5 ${className}`}>
                {renderOperativoSelect({
                    wrapperClassName: 'flex flex-col',
                    labelClassName: 'block mb-1 text-xs font-medium text-gray-200',
                    selectClassName: 'px-2 py-1.5 text-sm bg-primary-900 text-white border border-primary-700 rounded-md focus:ring-primary-400 focus:border-primary-400'
                })}
                {renderProvinceSelect({
                    wrapperClassName: 'flex flex-col',
                    labelClassName: 'block mb-1 text-xs font-medium text-gray-200',
                    selectClassName: 'px-2 py-1.5 text-sm bg-primary-900 text-white border border-primary-700 rounded-md focus:ring-primary-400 focus:border-primary-400'
                })}
                {renderUnitSelect({
                    wrapperClassName: 'flex flex-col',
                    labelClassName: 'block mb-1 text-xs font-medium text-gray-200',
                    selectClassName: 'px-2 py-1.5 text-sm bg-primary-900 text-white border border-primary-700 rounded-md focus:ring-primary-400 focus:border-primary-400'
                })}
                <div>
                    <label htmlFor="fromDate" className="block mb-1 text-xs font-medium text-gray-200">Desde</label>
                    <DateInput
                        id="fromDate"
                        value={filters.fromDate || ''}
                        min={dateLimits.min || undefined}
                        max={dateLimits.max || undefined}
                        onChange={handleFromDateChange}
                        className="py-1.5 text-sm bg-primary-900 text-white border-primary-700"
                    />
                </div>
                <div>
                    <label htmlFor="toDate" className="block mb-1 text-xs font-medium text-gray-200">Hasta</label>
                    <DateInput
                        id="toDate"
                        value={filters.toDate || ''}
                        min={dateLimits.min || undefined}
                        max={dateLimits.max || undefined}
                        onChange={handleToDateChange}
                        className="py-1.5 text-sm bg-primary-900 text-white border-primary-700"
                    />
                </div>
                <div className="md:col-span-5 flex gap-2">
                    <button onClick={clearAllFilters} className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300">
                        Limpiar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={toggleFilterPanel}
                className={`flex items-center px-3 py-2 border rounded-md transition-all ${hasActiveFilters ? 'bg-primary-600 text-white border-primary-700' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-72 space-y-3">
                    {renderOperativoSelect()}
                    {renderProvinceSelect()}
                    {renderUnitSelect()}

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="fromDate" className="block mb-1 text-xs font-medium text-gray-700">Desde</label>
                            <DateInput
                                id="fromDate"
                                value={filters.fromDate || ''}
                                min={dateLimits.min || undefined}
                                max={dateLimits.max || undefined}
                                onChange={handleFromDateChange}
                                className="w-full py-1.5 text-sm border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="toDate" className="block mb-1 text-xs font-medium text-gray-700">Hasta</label>
                            <DateInput
                                id="toDate"
                                value={filters.toDate || ''}
                                min={dateLimits.min || undefined}
                                max={dateLimits.max || undefined}
                                onChange={handleToDateChange}
                                className="w-full py-1.5 text-sm border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button onClick={clearAllFilters} className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300">
                            Limpiar
                        </button>
                        <button onClick={toggleFilterPanel} className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">
                            Aplicar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
