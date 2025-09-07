// Servicio para cargar y procesar los datos del archivo Excel
import * as XLSX from 'xlsx';

// NOTE: This module intentionally does NOT provide sample/demo data.
// If no real data is available, `loadData` will return an empty processed array
// so the UI can render appropriate "no data" states without showing fabricated results.

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
                        console.error('Error al leer el archivo (FileReader):', error);
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

            try {
                // Cargar el archivo JSON como respaldo
                const response = await fetch('/data/bd.json');
                const jsonData = await response.json();

                // Si el JSON está vacío o no hay datos, devolver arreglo vacío procesado
                if (!jsonData || jsonData.length === 0) {
                    console.warn('Archivo JSON vacío: no hay datos reales disponibles');
                    return processJsonData([]);
                }

                // Procesar los datos reales
                return processJsonData(jsonData);
            } catch (jsonError) {
                console.warn('No se pudo cargar el archivo JSON:', jsonError);
                // Si no se puede cargar ningún archivo, devolver arreglo vacío procesado
                return processJsonData([]);
            }
        }
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        // Devolver arreglo vacío procesado para evitar inyectar datos de prueba
        return processJsonData([]);
    }
};

// Función para procesar los datos JSON
const processJsonData = (jsonData) => {
    // Normalizar nombres de provincia: crear un nombre para mostrar (Title Case)
    // y una clave (sin tildes, minúscula, espacios simples) para comparaciones.
    const removeDiacritics = (str) => {
        try {
            return String(str).normalize('NFD').replace(/\p{M}/gu, '');
        } catch {
            // Fallback si el entorno no soporta \p{M}
            return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
    };

    const toDisplayName = (prov) => {
        if (!prov && prov !== 0) return '';
        const s = String(prov).trim().replace(/\s+/g, ' ');
        return s.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const toKey = (prov) => {
        if (!prov && prov !== 0) return '';
        let s = String(prov).trim().replace(/\s+/g, ' ');
        s = removeDiacritics(s).toLowerCase();
        // Mapear abreviaturas y variantes comunes a una clave canónica
        if (s === 'caba' || s.includes('ciudad autonoma') || s.includes('ciudad autonoma de buenos aires') || s.includes('ciudad autonoma buenos aires')) {
            return 'ciudad autonoma de buenos aires';
        }
        return s;
    };

    // Filtrar registros con datos válidos (sin valores "-" o vacíos en campos clave)
    const validData = jsonData.filter(item => {
        // Filtrar registros con fechas inválidas
        const fecha = item.FECHA || '';
        if (!fecha || fecha.toString().trim() === '-' || fecha.toString().trim() === '') return false;
        
        // Validar formato de fecha dd/mm/yyyy
        if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha.toString().trim())) return false;
        
        // Filtrar registros sin descripción válida
        const desc = item.DESCRIPCIÓN || item.DESCRIPCION || '';
        if (!desc || desc.toString().trim() === '-' || desc.toString().trim() === '') return false;
        
        // Filtrar registros con coordenadas inválidas
        const lat = parseFloat(item.LATITUD || item['Latitud Decimal'] || 0);
        const lng = parseFloat(item.LONGITUD || 0);
        if (lat === 0 && lng === 0) return false; // Coordenadas (0,0) probablemente inválidas
        
        // Filtrar registros sin provincia válida
        const provincia = item.PROVINCIA || '';
        if (!provincia || provincia.toString().trim() === '-' || provincia.toString().trim() === '') return false;
        
        return true;
    });

    return validData.map(item => ({
        ...item,
        // Asegurarse de que las coordenadas sean números
        LATITUD: parseFloat(item.LATITUD || item['Latitud Decimal'] || 0),
        LONGITUD: parseFloat(item.LONGITUD || 0),
        FECHA: item.FECHA || '',
        // FECHA_ISO: normalizamos la fecha a yyyy-mm-dd cuando sea posible
        FECHA_ISO: (function () {
            const raw = item.FECHA || '';
            if (!raw) return '';
            // dd/mm/yyyy
            const dmy = String(raw).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (dmy) {
                const dd = dmy[1].padStart(2, '0');
                const mm = dmy[2].padStart(2, '0');
                const yyyy = dmy[3];
                return `${yyyy}-${mm}-${dd}`;
            }
            // ISO-like or other parseable formats
            const parsed = new Date(raw);
            if (!isNaN(parsed.getTime())) {
                const y = parsed.getFullYear();
                const m = String(parsed.getMonth() + 1).padStart(2, '0');
                const d = String(parsed.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }
            return '';
        })(),
        HORA: item.HORA || '',
        DESCRIPCION: item.DESCRIPCIÓN || '',
        TIPO_INTERVENCION: item.TIPO_INTERVENCION || '',
        ID_OPERATIVO: item.ID_OPERATIVO || '',
        PROVINCIA: toDisplayName(item.PROVINCIA || ''),
        // Clave normalizada sin tildes para comparaciones robustas
        PROVINCIA_KEY: toKey(item.PROVINCIA || ''),
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

// Función para categorizar datos por tipo de operativo - SOLO DATOS REALES
export const getCategorizedData = (data) => {
    if (!data || data.length === 0) return {};

    // Categorías basadas ÚNICAMENTE en contenido real de datos
    // Sin hash artificial - solo keywords reales
    const categories = {
        detenidos: data.filter(item => {
            const desc = (item.DESCRIPCION || '').toLowerCase();
            const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

            return desc.includes('detención') || desc.includes('detenido') ||
                desc.includes('arresto') || desc.includes('aprehendido') ||
                desc.includes('capturado') || desc.includes('arrestado') ||
                tipo.includes('detención') || tipo.includes('detenido') ||
                tipo.includes('aprehensión') || tipo.includes('arrestado');
        }),
        controlados: data.filter(item => {
            const desc = (item.DESCRIPCION || '').toLowerCase();
            const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

            return desc.includes('control') || tipo.includes('control') ||
                desc.includes('verificación') || desc.includes('despliegue') ||
                desc.includes('controlado') || desc.includes('revisión') ||
                desc.includes('inspección') || desc.includes('identificación') ||
                tipo.includes('preventivo');
        }),
        afectados: data.filter(item => {
            const desc = (item.DESCRIPCION || '').toLowerCase();
            const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

            return desc.includes('afectado') || desc.includes('víctima') ||
                desc.includes('damnificado') || desc.includes('herido') ||
                tipo.includes('afectado');
        }),
        procedimientos: data.filter(item => {
            const desc = (item.DESCRIPCION || '').toLowerCase();
            const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

            return desc.includes('procedimiento') || desc.includes('operativo') ||
                desc.includes('intervención') || tipo.includes('procedimiento') ||
                tipo.includes('orden policial') || tipo.includes('orden judicial') ||
                desc.includes('allanamiento') || desc.includes('mandato judicial');
        }),
        abatidos: data.filter(item => {
            const desc = (item.DESCRIPCION || '').toLowerCase();
            const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

            return desc.includes('abatido') || desc.includes('enfrentamiento') ||
                desc.includes('tiroteo') || desc.includes('baja') ||
                tipo.includes('abatido');
        }),
        trata: data.filter(item => {
            const desc = (item.DESCRIPCION || '').toLowerCase();
            const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

            return desc.includes('trata') || desc.includes('tráfico') ||
                desc.includes('explotación') || desc.includes('traficante') ||
                tipo.includes('trata');
        }),
        incautaciones: data.filter(item => {
            const desc = (item.DESCRIPCION || '').toLowerCase();
            const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

            return desc.includes('incautación') || desc.includes('secuestro') ||
                desc.includes('decomiso') || desc.includes('droga') ||
                desc.includes('arma') || desc.includes('narcótico') ||
                desc.includes('narcotrafico') || desc.includes('narcotráfico') ||
                desc.includes('sustancia') || desc.includes('estupefaciente') ||
                desc.includes('cocaína') || desc.includes('marihuana') ||
                desc.includes('cannabis') || desc.includes('heroína') ||
                desc.includes('arma de fuego') || desc.includes('pistola') ||
                desc.includes('revolver') || desc.includes('munición') ||
                tipo.includes('incautación') || tipo.includes('secuestro');
        }),
    };

    return categories;
};

// Función para generar datos de gráficos
export const getChartData = (data, category) => {
    if (!data || data.length === 0) return null;

    // Datos por mes: usamos FECHA_ISO para evitar parseos inconsistentes
    const monthlyMap = data.reduce((acc, item) => {
        const iso = item.FECHA_ISO || item.FECHA || '';
        if (!iso) return acc;
        // try to parse ISO or other parseable formats
        const date = new Date(iso);
        if (isNaN(date.getTime())) return acc;
        const year = date.getFullYear();
        const monthIndex = date.getMonth();
        const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`; // e.g. 2025-01
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    // Solo incluir meses con datos reales (filtrar enero 2025 únicamente basado en datos de DB)
    const monthlyKeys = Object.keys(monthlyMap)
        .filter(key => monthlyMap[key] > 0) // Solo períodos con datos
        .filter(key => key.startsWith('2025-01')) // Solo enero 2025
        .sort();
    const monthlyData = monthlyKeys.reduce((acc, key) => {
        const [y, m] = key.split('-');
        const date = new Date(Number(y), Number(m) - 1, 1);
        const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        acc[label] = monthlyMap[key];
        return acc;
    }, {});

    // Datos por provincia
    const provinceData = data.reduce((acc, item) => {
        const province = item.PROVINCIA || 'Sin especificar';
        acc[province] = (acc[province] || 0) + 1;
        return acc;
    }, {});

    // Datos por departamento
    const departmentData = data.reduce((acc, item) => {
        const department = item.DEPARTAMENTO_O_PARTIDO || 'Sin especificar';
        acc[department] = (acc[department] || 0) + 1;
        return acc;
    }, {});

    // Prepare top-10 department labels/values and a color palette so each department
    // is shown with a distinct color in charts (pie / bar)
    const departmentLabels = Object.keys(departmentData).slice(0, 10); // Top 10 departments
    const departmentValues = Object.values(departmentData).slice(0, 10);

    // Reusable color palette (background alpha 0.6) and derived border colors (alpha 1)
    const palette = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 205, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)',
        'rgba(83, 102, 255, 0.6)',
        'rgba(255, 99, 71, 0.6)',
        'rgba(60, 179, 113, 0.6)'
    ];

    const borderPalette = palette.map(c => c.replace(/0\.6\)$/, '1)'));

    const departmentBackgroundColors = departmentLabels.map((_, i) => palette[i % palette.length]);
    const departmentBorderColors = departmentLabels.map((_, i) => borderPalette[i % borderPalette.length]);

    return {
        monthly: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: `${category} por mes`,
                data: Object.values(monthlyData),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        byProvince: {
            labels: Object.keys(provinceData),
            datasets: [{
                label: `${category} por provincia`,
                data: Object.values(provinceData),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                    'rgba(83, 102, 255, 0.6)',
                ],
                borderWidth: 2
            }]
        },
        byDepartment: {
            labels: departmentLabels,
            datasets: [{
                label: `${category} por departamento`,
                data: departmentValues,
                backgroundColor: departmentBackgroundColors,
                borderColor: departmentBorderColors,
                borderWidth: 2
            }]
        }
    };
};
