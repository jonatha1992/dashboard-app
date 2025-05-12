// Servicio para cargar y procesar los datos del archivo Excel
import * as XLSX from 'xlsx';

// Procesamiento de datos
export const loadData = async () => {
    try {
        try {
            // Intentar cargar el archivo Excel primero
            const response = await fetch('/data/bd.xlsx');

            if (response.ok) {
                const blob = await response.blob();
                const reader = new FileReader();

                return new Promise((resolve, reject) => {
                    reader.onload = (e) => {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: 'array' });

                            // Asumimos que los datos están en la primera hoja
                            const sheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[sheetName];

                            // Convertir a JSON
                            const jsonData = XLSX.utils.sheet_to_json(worksheet);

                            // Procesar los datos
                            const processedData = processJsonData(jsonData);
                            resolve(processedData);
                        } catch (error) {
                            console.error('Error al procesar el archivo Excel:', error);
                            reject(error);
                        }
                    };

                    reader.onerror = (error) => {
                        console.error('Error al leer el archivo:', error);
                        reject(error);
                    };

                    reader.readAsArrayBuffer(blob);
                });
            } else {
                // Si el archivo Excel no está disponible, cargar el JSON de respaldo
                throw new Error('Excel file not available');
            }
        } catch (excelError) {
            console.log('No se pudo cargar el archivo Excel, intentando con JSON', excelError);

            // Cargar el archivo JSON como respaldo
            const response = await fetch('/data/bd.json');
            const jsonData = await response.json();

            // Procesar los datos
            return processJsonData(jsonData);
        }
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        throw error;
    }
};

// Función para procesar los datos JSON
const processJsonData = (jsonData) => {
    return jsonData.map(item => ({
        ...item,
        // Asegurarse de que las coordenadas sean números
        LATITUD: parseFloat(item.LATITUD || item['Latitud Decimal'] || 0),
        LONGITUD: parseFloat(item.LONGITUD || 0),
        FECHA: item.FECHA || '',
        HORA: item.HORA || '',
        DESCRIPCION: item.DESCRIPCIÓN || '',
        TIPO_INTERVENCION: item.TIPO_INTERVENCION || '',
        ID_OPERATIVO: item.ID_OPERATIVO || '',
        PROVINCIA: item.PROVINCIA || '',
        DEPARTAMENTO_O_PARTIDO: item['DEPARTAMENTO O PARTIDO'] || '',
    }));
};

// Función para obtener estadísticas
export const getStatistics = (data) => {
    if (!data || data.length === 0) return {};

    // Contadores por tipo de intervención
    const interventionCounts = data.reduce((acc, item) => {
        const type = item.TIPO_INTERVENCION || 'Sin especificar';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    // Contadores por provincia
    const provinceCounts = data.reduce((acc, item) => {
        const province = item.PROVINCIA || 'Sin especificar';
        acc[province] = (acc[province] || 0) + 1;
        return acc;
    }, {});

    return {
        total: data.length,
        interventionCounts,
        provinceCounts
    };
};
