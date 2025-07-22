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

// Función para categorizar datos según los 7 tipos requeridos
export const categorizeData = (data) => {
    if (!data || data.length === 0) return {};

    const categories = {
        detenidos: [],
        controlados: [],
        afectados: [],
        procedimientos: [],
        abatidos: [],
        trata: [],
        incautaciones: []
    };

    data.forEach(item => {
        const description = (item.DESCRIPCION || '').toUpperCase();
        const type = (item.TIPO_INTERVENCION || '').toUpperCase();
        const id = item.ID_OPERATIVO || '';

        // Categorization logic based on description and type keywords
        if (description.includes('DETENIDO') || description.includes('DETENCIÓN') || description.includes('ARRESTADO')) {
            categories.detenidos.push(item);
        } else if (description.includes('CONTROL') || type.includes('CONTROL')) {
            categories.controlados.push(item);
        } else if (description.includes('AFECTADO') || description.includes('VÍCTIMA') || description.includes('PERSONA AFECTADA')) {
            categories.afectados.push(item);
        } else if (description.includes('PROCEDIMIENTO') || description.includes('PROCESO') || type.includes('PROCEDIMIENTO')) {
            categories.procedimientos.push(item);
        } else if (description.includes('ABATIDO') || description.includes('ELIMINADO') || description.includes('BAJA')) {
            categories.abatidos.push(item);
        } else if (description.includes('TRATA') || description.includes('TRÁFICO') || description.includes('TRAFFICKING')) {
            categories.trata.push(item);
        } else if (description.includes('INCAUTACIÓN') || description.includes('DECOMISO') || description.includes('CONFISCACIÓN')) {
            categories.incautaciones.push(item);
        } else {
            // Default categorization for common cases
            if (type.includes('POLICIAL')) {
                categories.controlados.push(item);
            } else {
                categories.procedimientos.push(item);
            }
        }
    });

    return categories;
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

    // Categorizar datos para los 7 tipos
    const categorizedData = categorizeData(data);
    const categoryStats = {};
    Object.keys(categorizedData).forEach(key => {
        categoryStats[key] = categorizedData[key].length;
    });

    return {
        total: data.length,
        interventionCounts,
        provinceCounts,
        categoryStats,
        categorizedData
    };
};

// Función para generar datos de gráficos para una categoría específica
export const getChartData = (categoryData, chartType = 'temporal') => {
    if (!categoryData || categoryData.length === 0) {
        return {
            labels: [],
            datasets: []
        };
    }

    switch (chartType) {
        case 'temporal':
            return getTemporalChartData(categoryData);
        case 'provincial':
            return getProvincialChartData(categoryData);
        case 'monthly':
            return getMonthlyChartData(categoryData);
        default:
            return getTemporalChartData(categoryData);
    }
};

// Datos temporales (por día)
const getTemporalChartData = (data) => {
    const dailyCounts = {};
    
    data.forEach(item => {
        const date = item.FECHA || '';
        if (date) {
            const dateKey = date.split(' ')[0]; // Get just the date part
            dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
        }
    });

    const sortedDates = Object.keys(dailyCounts).sort();
    const labels = sortedDates;
    const values = sortedDates.map(date => dailyCounts[date]);

    return {
        labels,
        datasets: [{
            label: 'Cantidad por Día',
            data: values,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            fill: false
        }]
    };
};

// Datos por provincia
const getProvincialChartData = (data) => {
    const provinceCounts = {};
    
    data.forEach(item => {
        const province = item.PROVINCIA || 'Sin especificar';
        provinceCounts[province] = (provinceCounts[province] || 0) + 1;
    });

    const labels = Object.keys(provinceCounts);
    const values = Object.values(provinceCounts);

    const colors = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(132, 204, 22, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(139, 92, 246, 0.8)'
    ];

    return {
        labels,
        datasets: [{
            label: 'Cantidad por Provincia',
            data: values,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
            borderWidth: 1
        }]
    };
};

// Datos mensuales
const getMonthlyChartData = (data) => {
    const monthlyCounts = {};
    
    data.forEach(item => {
        const date = item.FECHA || '';
        if (date) {
            const [day, month, year] = date.split('/');
            if (month && year) {
                const monthKey = `${month}/${year}`;
                monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
            }
        }
    });

    const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });

    const labels = sortedMonths;
    const values = sortedMonths.map(month => monthlyCounts[month]);

    return {
        labels,
        datasets: [{
            label: 'Cantidad por Mes',
            data: values,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            fill: true
        }]
    };
};
