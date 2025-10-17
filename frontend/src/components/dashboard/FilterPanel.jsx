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

const PROVINCE_DISPLAY_MAP = ARGENTINE_PROVINCES.reduce((acc, province) => {
    acc[normalizeProvinceKey(province)] = province;
    return acc;
}, {});

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
        dataStats
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

    const baseData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    const recordMatches = useCallback(
        (item, omitKeys = []) => {
            if (!item) return false;
            const shouldCheck = (key) => !omitKeys.includes(key);
            const dateIso =
                item.FECHA_ISO ||
                item.fecha_iso ||
                parseDateToISO(item.FECHA || item.fecha || item['FECHA - DETALLE']);

            if (shouldCheck('fromDate') && filters.fromDate) {
                if (!dateIso || dateIso < filters.fromDate) return false;
            }

            if (shouldCheck('toDate') && filters.toDate) {
                if (!dateIso || dateIso > filters.toDate) return false;
            }

            if (shouldCheck('operativoCodigo') && filters.operativoCodigo) {
                const itemCode = String(getOperativoCodeFromItem(item) || '').trim();
                if (!itemCode || itemCode !== String(filters.operativoCodigo).trim()) return false;
            }

            if (shouldCheck('province') && filters.province) {
                const itemProvince = normalizeProvinceKey(
                    item.PROVINCIA ||
                    item.provincia ||
                    item.Provincia ||
                    item.province ||
                    item.PROV ||
                    item.prov
                );
                if (!itemProvince || itemProvince !== normalizedProvince) return false;
            }

            if (shouldCheck('unidad') && filters.unidad) {
                const itemUnit = getUnitFromItem(item);
                if (!itemUnit || itemUnit !== filters.unidad) return false;
            }

            return true;
        },
        [
            filters.fromDate,
            filters.toDate,
            filters.operativoCodigo,
            filters.province,
            filters.unidad,
            normalizedProvince
        ]
    );

    const datasetWithoutOperativo = useMemo(
        () => baseData.filter((item) => recordMatches(item, ['operativoCodigo'])),
        [baseData, recordMatches]
    );

    const datasetWithoutProvince = useMemo(
        () => baseData.filter((item) => recordMatches(item, ['province'])),
        [baseData, recordMatches]
    );

    const datasetWithoutUnit = useMemo(
        () => baseData.filter((item) => recordMatches(item, ['unidad'])),
        [baseData, recordMatches]
    );

    const operativeOptions = useMemo(() => {
        const codes = new Set(
            datasetWithoutOperativo
                .map((item) => String(getOperativoCodeFromItem(item) || '').trim())
                .filter((code) => code && code !== '-')
        );

        if (filters.operativoCodigo) {
            codes.add(String(filters.operativoCodigo).trim());
        }

        if (codes.size === 0) {
            return [];
        }

        const knownOrdered = OPERATIVE_CODE_ENTRIES
            .filter(({ code }) => codes.has(code))
            .map(({ code, name }) => ({ code, name }));

        const remaining = Array.from(codes).filter((code) => !OPERATIVE_CODE_MAP[code]);
        remaining.sort((a, b) => a.localeCompare(b, 'es'));

        const dynamicOptions = remaining.map((code) => ({
            code,
            name: OPERATIVE_CODE_MAP[code]?.name || code
        }));

        return [...knownOrdered, ...dynamicOptions];
    }, [datasetWithoutOperativo, filters.operativoCodigo]);

    const unitOptions = useMemo(() => {
        const units = datasetWithoutUnit
            .map((item) => getUnitFromItem(item))
            .filter(Boolean);
        const uniqueUnits = Array.from(new Set(units)).sort((a, b) => a.localeCompare(b, 'es'));
        if (filters.unidad && filters.unidad !== '' && !uniqueUnits.includes(filters.unidad)) {
            uniqueUnits.unshift(filters.unidad);
        }
        return uniqueUnits;
    }, [datasetWithoutUnit, filters.unidad]);

    const provinceOptions = useMemo(() => {
        const entries = new Map();
        datasetWithoutProvince.forEach((item) => {
            const rawProvince =
                item.PROVINCIA ||
                item.provincia ||
                item.Provincia ||
                item.province ||
                item.PROV ||
                item.prov;
            if (!rawProvince || rawProvince === '-') return;
            const key = normalizeProvinceKey(rawProvince);
            if (!key) return;
            if (!entries.has(key)) {
                const display = PROVINCE_DISPLAY_MAP[key] || String(rawProvince).trim();
                entries.set(key, display);
            }
        });

        if (filters.province) {
            const currentKey = normalizeProvinceKey(filters.province);
            if (currentKey && !entries.has(currentKey)) {
                entries.set(currentKey, filters.province);
            }
        }

        return Array.from(entries.entries())
            .map(([key, label]) => ({ key, label }))
            .sort((a, b) => a.label.localeCompare(b.label, 'es'));
    }, [datasetWithoutProvince, filters.province]);

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
                className={props.selectClassName ?? 'w-[360px] min-w-[360px] flex-shrink-0 px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500'}
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
                className={props.selectClassName ?? 'min-w-[200px] px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500'}
            >
                <option value="">Todas las provincias</option>
                {provinceOptions.map(({ key, label }) => (
                    <option key={key} value={label}>{label}</option>
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
                className={props.selectClassName ?? 'min-w-[200px] px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500'}
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
                <div className={`flex flex-wrap items-end justify-center gap-3 ${className}`}>
                    {renderOperativoSelect({
                        id: 'operativo-inline',
                        wrapperClassName: 'flex flex-col',
                        labelClassName: 'block mb-1 text-[10px] font-medium text-white',
                        selectClassName: 'w-[360px] min-w-[360px] flex-shrink-0 px-3 py-1 text-xs bg-primary-800 text-white border border-primary-600 rounded-md focus:ring-primary-400 focus:border-primary-400'
                    })}
                    {renderProvinceSelect({
                        id: 'province-inline',
                        wrapperClassName: 'flex flex-col',
                        labelClassName: 'block mb-1 text-[10px] font-medium text-white',
                        selectClassName: 'px-2 py-1 text-xs bg-primary-800 text-white border border-primary-600 rounded-md focus:ring-primary-400 focus:border-primary-400 min-w-[170px]'
                    })}
                    {renderUnitSelect({
                        id: 'unidad-inline',
                        wrapperClassName: 'flex flex-col',
                        labelClassName: 'block mb-1 text-[10px] font-medium text-white',
                        selectClassName: 'px-2 py-1 text-xs bg-primary-800 text-white border border-primary-600 rounded-md focus:ring-primary-400 focus:border-primary-400 min-w-[170px]'
                    })}
                    <div className="flex flex-col">
                        <label htmlFor="fromDate-inline" className="block mb-1 text-[10px] font-medium text-white">Desde</label>
                        <DateInput
                            id="fromDate-inline"
                            value={filters.fromDate || ''}
                            min={dateLimits.min || undefined}
                            max={dateLimits.max || undefined}
                            onChange={handleFromDateChange}
                            className="w-[140px] py-1 text-xs bg-primary-800 text-white border border-primary-600 rounded-md focus:ring-primary-400 focus:border-primary-400"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="toDate-inline" className="block mb-1 text-[10px] font-medium text-white">Hasta</label>
                        <DateInput
                            id="toDate-inline"
                            value={filters.toDate || ''}
                            min={dateLimits.min || undefined}
                            max={dateLimits.max || undefined}
                            onChange={handleToDateChange}
                            className="w-[140px] py-1 text-xs bg-primary-800 text-white border border-primary-600 rounded-md focus:ring-primary-400 focus:border-primary-400"
                        />
                    </div>
                    <button
                        onClick={clearAllFilters}
                        className="px-2.5 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Limpiar
                    </button>
                </div>
            );
        }

        return (
            <div className={`grid grid-cols-1 gap-3 md:grid-cols-5 ${className}`}>
                {renderOperativoSelect({
                    wrapperClassName: 'flex flex-col',
                    labelClassName: 'block mb-1 text-xs font-medium text-gray-200',
                    selectClassName: 'w-[360px] min-w-[360px] flex-shrink-0 px-3 py-1.5 text-sm bg-primary-900 text-white border border-primary-700 rounded-md focus:ring-primary-400 focus:border-primary-400'
                })}
                {renderProvinceSelect({
                    wrapperClassName: 'flex flex-col',
                    labelClassName: 'block mb-1 text-xs font-medium text-gray-200',
                    selectClassName: 'px-2 py-1.5 text-sm bg-primary-900 text-white border border-primary-700 rounded-md focus:ring-primary-400 focus:border-primary-400 max-w-[200px]'
                })}
                {renderUnitSelect({
                    wrapperClassName: 'flex flex-col',
                    labelClassName: 'block mb-1 text-xs font-medium text-gray-200',
                    selectClassName: 'px-2 py-1.5 text-sm bg-primary-900 text-white border border-primary-700 rounded-md focus:ring-primary-400 focus:border-primary-400 max-w-[200px]'
                })}
                <div>
                    <label htmlFor="fromDate" className="block mb-1 text-xs font-medium text-gray-200">Desde</label>
                    <div className="w-full">
                        <DateInput
                            id="fromDate"
                            value={filters.fromDate || ''}
                            min={dateLimits.min || undefined}
                            max={dateLimits.max || undefined}
                            onChange={handleFromDateChange}
                            className="w-[140px] py-1.5 text-sm bg-primary-900 text-white border-primary-700"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="toDate" className="block mb-1 text-xs font-medium text-gray-200">Hasta</label>
                    <div className="w-full">
                        <DateInput
                            id="toDate"
                            value={filters.toDate || ''}
                            min={dateLimits.min || undefined}
                            max={dateLimits.max || undefined}
                            onChange={handleToDateChange}
                            className="w-[140px] py-1.5 text-sm bg-primary-900 text-white border-primary-700"
                        />
                    </div>
                </div>
                <div className="flex gap-2 md:col-span-5">
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
                <div className="absolute right-0 z-50 p-4 mt-2 space-y-3 bg-white border border-gray-200 rounded-lg shadow-lg w-72">
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










