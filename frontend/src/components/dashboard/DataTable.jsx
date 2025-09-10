// Componente para mostrar los datos en formato de tabla especializada
import { useState, useMemo } from 'react';

export default function DataTable({ data }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
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

    const getDepartamento = (item) => pickFirstString(item, [
        'DEPARTAMENTO_O_PARTIDO', 'DEPARTAMENTO', 'departamento', 'DEPARTAMENTO O PARTIDO', 'PARTIDO', 'partido'
    ]) || 'Sin especificar';

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

    // Configuraciones específicas para cada tipo de tabla
    const tableConfigs = {
        incautaciones: {
            title: 'Incautaciones',
            searchFields: ['INCAUTACIONES', 'TIPO', 'SUBTIPO', 'CANTIDAD', 'PROVINCIA', 'DEPARTAMENTO_O_PARTIDO', 'ID_OPERATIVO', 'UNIDAD_INTERVINIENTE'],
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs' },
                { key: 'PROVINCIA', label: 'Provincia' },
                { key: 'DEPARTAMENTO_O_PARTIDO', label: 'Departamento', render: (item) => getDepartamento(item), className: 'max-w-xs truncate' },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item) },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'max-w-xs truncate' },
                { key: 'INCAUTACIONES', label: 'Incautación' },
                { key: 'TIPO', label: 'Tipo' },
                { key: 'CANTIDAD', label: 'Cantidad', className: 'text-right' },
                { key: 'MEDIDAS', label: 'Medidas' }
            ]
        },
        detenidos: {
            title: 'Detenidos',
            searchFields: ['DELITO_IMPUTADO', 'NACIONALIDAD', 'SITUACION_PROCESAL', 'PROVINCIA', 'DEPARTAMENTO_O_PARTIDO', 'ID_OPERATIVO', 'UNIDAD_INTERVINIENTE'],
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs' },
                { key: 'PROVINCIA', label: 'Provincia' },
                { key: 'DEPARTAMENTO_O_PARTIDO', label: 'Departamento', render: (item) => getDepartamento(item), className: 'max-w-xs truncate' },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item) },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'max-w-xs truncate' },
                { key: 'EDAD', label: 'Edad', className: 'text-right' },
                { key: 'SEXO', label: 'Sexo' },
                { key: 'NACIONALIDAD', label: 'Nacionalidad' },
                { key: 'SITUACION_PROCESAL', label: 'Situación' },
                { key: 'DELITO_IMPUTADO', label: 'Delito', className: 'max-w-xs truncate' }
            ]
        },
        controlados: {
            title: 'Controlados',
            searchFields: ['PROVINCIA', 'DEPARTAMENTO_O_PARTIDO', 'ID_OPERATIVO', 'DESCRIPCIÓN', 'UNIDAD_INTERVINIENTE'],
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs' },
                { key: 'PROVINCIA', label: 'Provincia' },
                { key: 'DEPARTAMENTO_O_PARTIDO', label: 'Departamento', render: (item) => getDepartamento(item), className: 'max-w-xs truncate' },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item) },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'max-w-xs truncate' },
                { key: 'vehiculos_controlados', label: 'Vehículos', className: 'text-right' },
                { key: 'personas_controladas', label: 'Personas', className: 'text-right' },
                { key: 'cant_averiguaciones_secuestro', label: 'Averiguaciones', className: 'text-right' },
                { key: 'cant_solicitudes_antecedentes', label: 'Antecedentes', className: 'text-right' }
            ]
        },
        afectados: {
            title: 'Personal Afectado',
            searchFields: ['PROVINCIA', 'DEPARTAMENTO_O_PARTIDO', 'ID_OPERATIVO', 'DESCRIPCIÓN', 'UNIDAD_INTERVINIENTE'],
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID Operativo', className: 'font-mono text-xs' },
                { key: 'PROVINCIA', label: 'Provincia' },
                { key: 'DEPARTAMENTO_O_PARTIDO', label: 'Departamento', render: (item) => getDepartamento(item), className: 'max-w-xs truncate' },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item) },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'max-w-xs truncate' },
                { key: 'CANT_EFECTIVOS', label: 'Efectivos', className: 'text-right font-semibold' },
                { key: 'CANT_AUTOS_CAMIONETAS', label: 'Autos/Cam', className: 'text-right' },
                { key: 'CANT_MOTOS', label: 'Motos', className: 'text-right' },
                { key: 'CANT_SCANNERS', label: 'Scanners', className: 'text-right' },
                { key: 'CANT_CANES', label: 'Canes', className: 'text-right' }
            ]
        },
        general: {
            title: 'Datos Generales',
            searchFields: ['DESCRIPCIÓN', 'TIPO_INTERVENCION', 'PROVINCIA', 'DEPARTAMENTO_O_PARTIDO', 'ID_OPERATIVO', 'UNIDAD_INTERVINIENTE'],
            columns: [
                { key: 'ID_OPERATIVO', label: 'ID' },
                { key: 'DESCRIPCIÓN', label: 'Descripción', render: (item) => getDescription(item) },
                { key: 'TIPO_INTERVENCION', label: 'Tipo', render: (item) => getType(item) },
                { key: 'FECHA_ISO', label: 'Fecha', render: (item) => getDateText(item) },
                { key: 'PROVINCIA', label: 'Provincia' },
                { key: 'DEPARTAMENTO_O_PARTIDO', label: 'Departamento', render: (item) => getDepartamento(item), className: 'max-w-xs truncate' },
                { key: 'UNIDAD_INTERVINIENTE', label: 'Unidad', render: (item) => getUnidadInterviniente(item), className: 'max-w-xs truncate' },
                { key: 'LATITUD', label: 'Coordenadas', render: (item) => getLatLng(item) }
            ]
        }
    };

    const config = tableConfigs[tableType];

    // Filtrar datos según la búsqueda usando los campos específicos de cada tabla
    const filteredData = data.filter(item => {
        if (!search.trim()) return true;
        
        const q = search.toLowerCase();
        return config.searchFields.some(field => {
            const value = item[field];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(q);
        });
    });

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Cambiar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="bg-white rounded-lg shadow-md p-4 overflow-auto">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-800">{config.title}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {filteredData.length} registros
                    </span>
                </div>
                <div className="w-64">
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder={`Buscar en ${config.title.toLowerCase()}...`}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1); // Reset a la primera página al buscar
                        }}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {config.columns.map((column) => (
                                <th 
                                    key={column.key} 
                                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
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
                                            className={`px-3 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                                            title={cellValue && cellValue.length > 50 ? cellValue : undefined}
                                        >
                                            {cellValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">
                            {Math.min(indexOfLastItem, filteredData.length)}
                        </span> de <span className="font-medium">{filteredData.length}</span> resultados
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
