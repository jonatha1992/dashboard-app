// Componente para mostrar los datos en formato de tabla especializada con layout estable
import { useState, useMemo } from 'react';
import { Tooltip } from '@mui/material';

export default function DataTable({ data }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
    const [columnFilters, setColumnFilters] = useState({});
    const [showFilterRow, setShowFilterRow] = useState(false);
    const itemsPerPage = 10;

    // Detectar tipo de tabla basado en campos únicos
    const tableType = useMemo(() => {
        if (!data || data.length === 0) return 'general';
        
        const firstItem = data[0];
        if (firstItem.INCAUTACIONES || firstItem.TIPO || firstItem.CANTIDAD) {
            return 'incautaciones';
        } else if (firstItem.EDAD !== undefined || firstItem.SEXO || firstItem.DELITO_IMPUTADO) {
            return 'detenidos';
        } else if (firstItem.vehiculos_controlados !== undefined || firstItem.personas_controladas !== undefined) {
            return 'controlados';
        } else if (firstItem.CANT_EFECTIVOS !== undefined || firstItem.cant_efectivos !== undefined) {
            return 'afectados';
        }
        return 'general';
    }, [data]);

    // Helpers de visualización
    const pickFirstString = (obj, keys) => {
        for (const k of keys) {
            const v = obj[k];
            if (typeof v === 'string' && v.trim() && v !== '-') return v.trim();
        }
        return '';
    };

    const getDescription = (item) => pickFirstString(item, [
        'DESCRIPCIÓN', 'descripcion', 'DESCRIPCION_HECHO', 'DETALLE', 'OBSERVACION', 'OBSERVACIONES'
    ]) || '-';

    const getType = (item) => pickFirstString(item, [
        'TIPO_INTERVENCION', 'TIPO', 'CATEGORIA'
    ]) || '-';

    const getUnidadInterviniente = (item) => pickFirstString(item, [
        'UNIDAD_INTERVINIENTE', 'unidad_interviniente', 'UNIDAD', 'FUERZA_INTERVINIENTE'
    ]) || '-';

    const getLatLng = (item) => {
        const lat = item.LATITUD ?? item.latitud ?? item.latitud_decimal ?? item['Latitud Decimal'];
        const lng = item.LONGITUD ?? item.longitud ?? item.longitud_decimal ?? item['Longitud Decimal'];
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
        }
        return '-';
    };

    const getDateText = (item) => {
        const iso = item.FECHA_ISO || item.FECHA;
        const time = item.HORA || '';
        return iso ? `${iso}${time ? ` ${time}` : ''}` : '-';
    };

    // Configuraciones específicas para cada tipo de tabla con anchos fijos
    const tableConfigs = {
        incautaciones: {
            title: 'Incautaciones',
            searchFields: ['INCAUTACIONES', 'TIPO', 'SUBTIPO', 'CANTIDAD', 'PROVINCIA', 'ID_OPERATIVO', 'UNIDAD_INTERVINIENTE'],
            containerWidth: '1400px', // Ancho fijo del contenedor
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs', width: '120px' },
                { key: 'PROVINCIA', label: 'Provincia', className: 'text-xs', width: '110px' },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item), className: 'text-xs', width: '100px' },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'text-xs', width: '200px', truncate: true },
                { key: 'INCAUTACIONES', label: 'Incautación', className: 'text-xs', width: '180px', truncate: true },
                { key: 'TIPO', label: 'Tipo', className: 'text-xs', width: '120px', truncate: true },
                { key: 'CANTIDAD', label: 'Cantidad', className: 'text-right text-xs', width: '80px' },
                { key: 'MEDIDAS', label: 'Medidas', className: 'text-xs', width: '100px', truncate: true }
            ]
        },
        detenidos: {
            title: 'Detenidos',
            searchFields: ['DELITO_IMPUTADO', 'NACIONALIDAD', 'SITUACION_PROCESAL', 'PROVINCIA', 'ID_OPERATIVO', 'UNIDAD_INTERVINIENTE'],
            containerWidth: '1500px', // Ancho fijo del contenedor
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs', width: '120px' },
                { key: 'PROVINCIA', label: 'Provincia', className: 'text-xs', width: '110px' },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item), className: 'text-xs', width: '100px' },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'text-xs', width: '200px', truncate: true },
                { key: 'EDAD', label: 'Edad', className: 'text-right text-xs', width: '60px' },
                { key: 'SEXO', label: 'Sexo', className: 'text-xs', width: '60px' },
                { key: 'NACIONALIDAD', label: 'Nacionalidad', className: 'text-xs', width: '120px', truncate: true },
                { key: 'SITUACION_PROCESAL', label: 'Situación', className: 'text-xs', width: '150px', truncate: true },
                { key: 'DELITO_IMPUTADO', label: 'Delito', className: 'text-xs', width: '250px', truncate: true }
            ]
        },
        controlados: {
            title: 'Controlados',
            searchFields: ['PROVINCIA', 'ID_OPERATIVO', 'DESCRIPCIÓN', 'UNIDAD_INTERVINIENTE'],
            containerWidth: '1300px', // Ancho fijo del contenedor
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs', width: '120px' },
                { key: 'PROVINCIA', label: 'Provincia', className: 'text-xs', width: '110px' },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item), className: 'text-xs', width: '100px' },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'text-xs', width: '200px', truncate: true },
                { key: 'vehiculos_controlados', label: 'Vehículos', className: 'text-right text-xs', width: '80px' },
                { key: 'personas_controladas', label: 'Personas', className: 'text-right text-xs', width: '80px' },
                { key: 'cant_averiguaciones_secuestro', label: 'Averig.', className: 'text-right text-xs', width: '80px' },
                { key: 'cant_solicitudes_antecedentes', label: 'Antec.', className: 'text-right text-xs', width: '80px' }
            ]
        },
        afectados: {
            title: 'Personal Afectado',
            searchFields: ['PROVINCIA', 'ID_OPERATIVO', 'DESCRIPCIÓN', 'UNIDAD_INTERVINIENTE'],
            containerWidth: '1300px', // Ancho fijo del contenedor
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs', width: '120px' },
                { key: 'PROVINCIA', label: 'Provincia', className: 'text-xs', width: '110px' },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item), className: 'text-xs', width: '100px' },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'text-xs', width: '200px', truncate: true },
                { key: 'CANT_EFECTIVOS', label: 'Efectivos', className: 'text-right font-semibold text-xs', width: '80px' },
                { key: 'CANT_AUTOS_CAMIONETAS', label: 'Autos/Cam', className: 'text-right text-xs', width: '90px' },
                { key: 'CANT_MOTOS', label: 'Motos', className: 'text-right text-xs', width: '70px' },
                { key: 'CANT_SCANNERS', label: 'Scanners', className: 'text-right text-xs', width: '80px' },
                { key: 'CANT_CANES', label: 'Canes', className: 'text-right text-xs', width: '70px' }
            ]
        },
        general: {
            title: 'Datos Generales',
            searchFields: ['DESCRIPCIÓN', 'TIPO_INTERVENCION', 'PROVINCIA', 'ID_OPERATIVO', 'UNIDAD_INTERVINIENTE'],
            containerWidth: '1400px', // Ancho fijo del contenedor
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs', width: '120px' },
                { key: 'DESCRIPCIÓN', label: 'Descripción', render: (item) => getDescription(item), className: 'text-xs', width: '250px', truncate: true },
                { key: 'TIPO_INTERVENCION', label: 'Tipo', render: (item) => getType(item), className: 'text-xs', width: '150px', truncate: true },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item), className: 'text-xs', width: '100px' },
                { key: 'PROVINCIA', label: 'Provincia', className: 'text-xs', width: '110px' },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'text-xs', width: '200px', truncate: true },
                { key: 'LATITUD', label: 'Coordenadas', render: (item) => getLatLng(item), className: 'text-xs', width: '150px' }
            ]
        }
    };

    const config = tableConfigs[tableType];

    // Función para aplicar filtros de columnas específicas
    const applyColumnFilters = (item) => {
        return Object.entries(columnFilters).every(([columnKey, filterValue]) => {
            if (!filterValue || !filterValue.trim()) return true;
            
            const column = config.columns.find(col => col.key === columnKey);
            if (!column) return true;
            
            let cellValue;
            if (column.render) {
                cellValue = column.render(item);
            } else {
                cellValue = item[column.key];
            }
            
            if (cellValue === null || cellValue === undefined) return false;
            return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
        });
    };

    // Filtrar datos según la búsqueda general y filtros de columna
    const filteredData = data.filter(item => {
        // Aplicar búsqueda general
        if (search.trim()) {
            const q = search.toLowerCase();
            const matchesGlobalSearch = config.searchFields.some(field => {
                const value = item[field];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(q);
            });
            if (!matchesGlobalSearch) return false;
        }
        
        // Aplicar filtros de columnas
        return applyColumnFilters(item);
    });

    // Ordenamiento
    const sortedData = useMemo(() => {
        if (!sortField) return filteredData;
        
        return [...filteredData].sort((a, b) => {
            const column = config.columns.find(col => col.key === sortField);
            let aValue, bValue;
            
            if (column && column.render) {
                aValue = column.render(a);
                bValue = column.render(b);
            } else {
                aValue = a[sortField];
                bValue = b[sortField];
            }
            
            // Manejar valores nulos/undefined
            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';
            
            // Convertir a string para comparación
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();
            
            // Intentar comparación numérica si es posible
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
            }
            
            // Comparación de strings
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortField, sortDirection, config.columns]);

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    // Cambiar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    // Manejar ordenamiento
    const handleSort = (fieldKey) => {
        if (sortField === fieldKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(fieldKey);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset a la primera página
    };
    
    // Manejar filtro de columna
    const handleColumnFilter = (columnKey, value) => {
        setColumnFilters(prev => ({
            ...prev,
            [columnKey]: value
        }));
        setCurrentPage(1); // Reset a la primera página
    };
    
    // Limpiar todos los filtros
    const clearAllFilters = () => {
        setSearch('');
        setColumnFilters({});
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
    };
    
    // Contar filtros activos
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (search.trim()) count++;
        count += Object.values(columnFilters).filter(v => v && v.trim()).length;
        return count;
    }, [search, columnFilters]);
    
    // Función para exportar datos filtrados (preparar para futuras extensiones)
    const getFilteredDataSummary = () => {
        return {
            total: data.length,
            filtered: sortedData.length,
            activeFilters: activeFiltersCount,
            sortField,
            sortDirection,
            searchTerm: search,
            columnFilters: Object.fromEntries(
                Object.entries(columnFilters).filter(([, value]) => value && value.trim())
            )
        };
    };

    // Si no hay datos, mostrar mensaje específico
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl text-gray-300 mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay datos disponibles</h3>
                <p className="text-gray-500">No se encontraron registros para mostrar en esta tabla.</p>
                <p className="text-xs text-gray-400 mt-2">Los datos aparecerán aquí cuando estén disponibles.</p>
            </div>
        );
    }

    // Función para truncar texto y crear tooltip
    const getTruncatedContent = (content, maxLength = 50) => {
        if (!content || content === '-') return content;
        const text = String(content);
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    };

    // Función para renderizar celda con tooltip si es necesario
    const renderCellWithTooltip = (column, item, cellValue) => {
        const shouldTruncate = column.truncate && cellValue && cellValue !== '-' && String(cellValue).length > 50;
        const displayValue = shouldTruncate ? getTruncatedContent(cellValue) : cellValue;
        
        if (shouldTruncate) {
            return (
                <Tooltip
                    title={(
                        <div className="p-2">
                            <div className="font-semibold text-sm mb-1">{column.label}</div>
                            <div className="text-xs">{cellValue}</div>
                            {item.ID_OPERATIVO && (
                                <div className="text-xs text-gray-300 mt-1 border-t border-gray-600 pt-1">
                                    ID: {item.ID_OPERATIVO}
                                </div>
                            )}
                        </div>
                    )}
                    arrow
                    placement="top"
                    classes={{
                        tooltip: 'bg-gray-800 text-white text-xs max-w-sm',
                        arrow: 'text-gray-800'
                    }}
                >
                    <div className="cursor-help">{displayValue}</div>
                </Tooltip>
            );
        }
        
        return displayValue;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4 space-y-4">
                {/* Header with title and controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-800">{config.title}</h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                            {sortedData.length} registros
                        </span>
                        {activeFiltersCount > 0 && (
                            <span className="px-2 py-1 text-xs bg-amber-100 text-amber-600 rounded-full">
                                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowFilterRow(!showFilterRow)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                showFilterRow 
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="Mostrar/ocultar filtros de columnas"
                        >
                            🔍 Filtros
                        </button>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                title="Limpiar todos los filtros"
                            >
                                ✕ Limpiar
                            </button>
                        )}
                        <div className="w-64">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder={`Buscar en ${config.title.toLowerCase()}...`}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Filter status */}
                {(search || Object.keys(columnFilters).some(k => columnFilters[k])) && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md flex items-center justify-between">
                        <div>
                            <span className="font-medium">Filtros activos:</span>
                            {search && <span className="ml-2 px-2 py-1 bg-white rounded border">Búsqueda: "{search}"</span>}
                            {Object.entries(columnFilters)
                                .filter(([, value]) => value && value.trim())
                                .map(([column, value]) => {
                                    const columnConfig = config.columns.find(c => c.key === column);
                                    return (
                                        <span key={column} className="ml-2 px-2 py-1 bg-white rounded border">
                                            {columnConfig?.label}: "{value}"
                                        </span>
                                    );
                                })
                            }
                        </div>
                        <div className="text-xs text-gray-500">
                            {sortField && (
                                <span className="px-2 py-1 bg-white rounded border">
                                    Ordenado por: {config.columns.find(c => c.key === sortField)?.label} 
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Contenedor con ancho fijo para evitar movimiento durante ordenamiento */}
            <div className="overflow-x-auto">
                <div style={{ width: config.containerWidth, minWidth: '100%' }}>
                    <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead className="bg-gray-50">
                        <tr>
                            {config.columns.map((column) => (
                                <th 
                                    key={column.key} 
                                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    style={{ width: column.width }}
                                    onClick={() => handleSort(column.key)}
                                    title={`Ordenar por ${column.label}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{column.label}</span>
                                        <div className="ml-2 flex flex-col">
                                            {sortField === column.key ? (
                                                sortDirection === 'asc' ? (
                                                    <span className="text-blue-600">▲</span>
                                                ) : (
                                                    <span className="text-blue-600">▼</span>
                                                )
                                            ) : (
                                                <span className="text-gray-300 hover:text-gray-500 text-xs">⇅</span>
                                            )}
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                        {/* Fila de filtros de columnas */}
                        {showFilterRow && (
                            <tr className="bg-gray-50 border-t">
                                {config.columns.map((column) => (
                                    <th key={`filter-${column.key}`} className="px-3 py-2" style={{ width: column.width }}>
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={`Filtrar ${column.label.toLowerCase()}...`}
                                            value={columnFilters[column.key] || ''}
                                            onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </th>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {config.columns.map((column) => {
                                    let cellValue;
                                    if (column.render) {
                                        cellValue = column.render(item);
                                    } else {
                                        cellValue = item[column.key] !== null && item[column.key] !== undefined 
                                            ? String(item[column.key]) 
                                            : '-';
                                    }
                                    
                                    return (
                                        <td 
                                            key={column.key}
                                            className={`px-3 py-4 text-sm text-gray-900 ${column.className || ''}`}
                                            style={{ 
                                                width: column.width,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: column.truncate ? 'nowrap' : 'normal'
                                            }}
                                        >
                                            {renderCellWithTooltip(column, item, cellValue)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">
                            {Math.min(indexOfLastItem, sortedData.length)}
                        </span> de <span className="font-medium">{sortedData.length}</span> resultados
                        {data.length !== sortedData.length && (
                            <span className="ml-2 text-xs text-gray-500">
                                (filtrado de {data.length} total)
                            </span>
                        )}
                    </p>
                    <nav className="flex justify-end">
                        <ul className="flex items-center">
                            <li>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    Anterior
                                </button>
                            </li>
                            <li className="mx-2">
                                <span className="text-gray-700">
                                    Página {currentPage} de {totalPages}
                                </span>
                            </li>
                            <li>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    Siguiente
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
}
