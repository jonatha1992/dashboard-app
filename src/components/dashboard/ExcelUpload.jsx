import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function ExcelUpload({ onDataUpload }) {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        // Validar que sea un archivo Excel
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            setMessage('Por favor seleccione un archivo Excel válido (.xlsx o .xls)');
            return;
        }

        setUploading(true);
        setMessage('');

        try {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Obtener la primera hoja
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    // Convertir a JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (jsonData.length === 0) {
                        setMessage('El archivo Excel está vacío o no contiene datos válidos');
                        setUploading(false);
                        return;
                    }

                    // Procesar los datos para que coincidan con el formato esperado
                    const processedData = jsonData.map(item => ({
                        ...item,
                        LATITUD: parseFloat(item.LATITUD || item['Latitud Decimal'] || item.latitud || item.lat) || null,
                        LONGITUD: parseFloat(item.LONGITUD || item.longitud || item.lng || item.lon) || null,
                        FECHA: item.FECHA || item.fecha || '',
                        HORA: item.HORA || item.hora || '',
                        DESCRIPCION: item.DESCRIPCIÓN || item.DESCRIPCION || item.descripcion || '',
                        TIPO_INTERVENCION: item.TIPO_INTERVENCION || item['TIPO INTERVENCION'] || item.tipo_intervencion || '',
                        ID_OPERATIVO: item.ID_OPERATIVO || item.id_operativo || '',
                        PROVINCIA: item.PROVINCIA || item.provincia || '',
                        DEPARTAMENTO_O_PARTIDO: item['DEPARTAMENTO O PARTIDO'] || item.DEPARTAMENTO_O_PARTIDO || item.departamento || '',
                    }));

                    // Filtrar registros que tengan al menos coordenadas válidas
                    const validData = processedData.filter(item =>
                        item.LATITUD && item.LONGITUD &&
                        !isNaN(item.LATITUD) && !isNaN(item.LONGITUD)
                    );

                    if (validData.length === 0) {
                        setMessage('No se encontraron registros con coordenadas válidas en el archivo');
                        setUploading(false);
                        return;
                    }

                    setMessage(`✅ Archivo cargado exitosamente. ${validData.length} registros procesados.`);
                    setUploading(false); // End loading state before uploading data

                    // Upload the processed data
                    onDataUpload(validData);

                    // Limpiar el input file
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }

                } catch (error) {
                    console.error('Error al procesar el archivo Excel:', error);
                    setMessage('Error al procesar el archivo Excel. Verifique el formato del archivo.');
                } finally {
                    setUploading(false);
                }
            };

            reader.onerror = () => {
                setMessage('Error al leer el archivo');
                setUploading(false);
            };

            reader.readAsArrayBuffer(file);

        } catch (error) {
            console.error('Error al cargar el archivo:', error);
            setMessage('Error al cargar el archivo');
            setUploading(false);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative group">
            <button
                onClick={handleButtonClick}
                disabled={uploading}
                className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors min-w-fit whitespace-nowrap ${uploading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                title="Subir datos desde Excel"
            >
                {uploading ? (
                    <>
                        <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Procesando...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Importar Excel
                    </>
                )}
            </button>

            {/* Tooltip */}
            <div className="absolute z-20 w-64 px-3 py-2 mb-2 text-xs text-white transition-all duration-200 transform -translate-x-1/2 bg-gray-900 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 scale-90 group-hover:opacity-100 group-hover:scale-100">
                Seleccione un archivo Excel (.xlsx o .xls) con datos de operativos.
                <div className="absolute w-0 h-0 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent top-full left-1/2 border-t-gray-900"></div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
            />

            {message && (
                <div className="absolute z-10 right-0 top-full mt-1 w-64">
                    <div className={`p-2 rounded-md text-xs shadow-lg ${message.includes('✅')
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {message}
                    </div>
                </div>
            )}
        </div>
    );
}