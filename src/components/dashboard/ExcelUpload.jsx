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
                        LATITUD: parseFloat(item.LATITUD || item['Latitud Decimal'] || item.latitud || item.lat || 0),
                        LONGITUD: parseFloat(item.LONGITUD || item.longitud || item.lng || item.lon || 0),
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
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Cargar Archivo Excel</h3>
                <button
                    onClick={handleButtonClick}
                    disabled={uploading}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        uploading
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    {uploading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Procesando...
                        </div>
                    ) : (
                        '📊 Subir Excel'
                    )}
                </button>
            </div>
            
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
            />
            
            <p className="text-sm text-gray-600 mb-2">
                Seleccione un archivo Excel (.xlsx o .xls) con datos de operativos. 
                El archivo debe contener columnas como LATITUD, LONGITUD, FECHA, HORA, DESCRIPCIÓN, etc.
            </p>
            
            {message && (
                <div className={`p-3 rounded-md text-sm ${
                    message.includes('✅') 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
}