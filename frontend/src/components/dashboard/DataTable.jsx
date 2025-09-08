// Componente para mostrar los datos en formato de tabla
import { useState } from 'react';

export default function DataTable({ data }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const itemsPerPage = 10;

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

    // Filtrar datos según la búsqueda (aplicada a campos derivados también)
    const filteredData = data.filter(item => {
        const desc = getDescription(item).toLowerCase();
        const tipo = getType(item).toLowerCase();
        const prov = (item.PROVINCIA || '').toLowerCase();
        const id = (item.ID_OPERATIVO || '').toLowerCase();
        const q = search.toLowerCase();
        return desc.includes(q) || tipo.includes(q) || prov.includes(q) || id.includes(q);
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
            <div className="mb-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">Buscar</label>
                <input
                    type="text"
                    id="search"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar por descripción, tipo, provincia o ID..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1); // Reset a la primera página al buscar
                    }}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordenadas</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ID_OPERATIVO || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getDescription(item)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getType(item)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDateText(item)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.PROVINCIA || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getLatLng(item)}</td>
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
