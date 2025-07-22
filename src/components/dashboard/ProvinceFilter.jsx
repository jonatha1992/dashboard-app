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

export default function ProvinceFilter({ onProvinceChange }) {
    const [selectedProvince, setSelectedProvince] = useState('');

    const handleProvinceChange = (e) => {
        const newProvince = e.target.value;
        setSelectedProvince(newProvince);
        onProvinceChange(newProvince);
    };

    const clearFilter = () => {
        setSelectedProvince('');
        onProvinceChange('');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtro por Provincia</h3>
                    <div>
                        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                            Seleccionar Provincia:
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
                </div>
                {selectedProvince && (
                    <button
                        onClick={clearFilter}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                        Limpiar
                    </button>
                )}
            </div>
        </div>
    );
}