// Servicio para cargar y procesar los datos del archivo Excel
import * as XLSX from 'xlsx';
import { normalizeProvinceKey, parseDateToISO, getCoordinatesFromItem } from '../contexts/DashboardContext';

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
    // Función helper para convertir provincia a formato de display (Title Case)
    const toDisplayName = (prov) => {
        if (!prov && prov !== 0) return '';
        const s = String(prov).trim().replace(/\s+/g, ' ');
        return s.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // LOGGING TEMPORAL para diagnosticar pérdida de datos
    console.log(`🔍 DIAGNÓSTICO: Procesando ${jsonData.length} registros iniciales`);
    
    // Filtrar registros con datos válidos (sin valores "-" o vacíos en campos clave)
    const validData = jsonData.filter((item, index) => {
        // Criterio 1: Filtrar registros con fechas inválidas
        const fecha = item.FECHA || '';
        if (!fecha || fecha.toString().trim() === '-' || fecha.toString().trim() === '') {
            if (Math.random() < 0.01) console.log(`❌ Registro ${index} excluido por fecha vacía:`, fecha);
            return false;
        }
        
        // Criterio 2: Validar formato de fecha dd/MM/yyyy (día/mes/año)
        if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha.toString().trim())) {
            if (Math.random() < 0.01) console.log(`❌ Registro ${index} excluido por formato de fecha inválido:`, fecha);
            return false;
        }
        
        // Criterio 3: Filtrar registros sin descripción válida (SIENDO MENOS ESTRICTO)
        const desc = item.DESCRIPCIÓN || item.DESCRIPCION || '';
        if (!desc || desc.toString().trim() === '-') {
            if (Math.random() < 0.01) console.log(`❌ Registro ${index} excluido por descripción vacía`);
            return false;
        }
        
        // Criterio 4: Filtrar registros sin provincia válida (SIENDO MENOS ESTRICTO)
        const provincia = item.PROVINCIA || '';
        if (!provincia || provincia.toString().trim() === '-') {
            if (Math.random() < 0.01) console.log(`❌ Registro ${index} excluido por provincia vacía:`, provincia);
            return false;
        }
        
        return true;
    });

    console.log(`✅ DIAGNÓSTICO: ${validData.length}/${jsonData.length} registros pasaron validación (${((validData.length/jsonData.length)*100).toFixed(1)}%)`);

    return validData.map(item => {
        // Usar función centralizada para coordenadas
        const { lat, lng } = getCoordinatesFromItem(item);
        
        return {
            ...item,
            // Coordenadas normalizadas usando función centralizada
            LATITUD: lat || 0,
            LONGITUD: lng || 0,
            FECHA: item.FECHA || '',
            // FECHA_ISO: normalizada usando función centralizada del DashboardContext
            FECHA_ISO: parseDateToISO(item.FECHA || ''),
            HORA: item.HORA || '',
            DESCRIPCION: item.DESCRIPCIÓN || '',
            TIPO_INTERVENCION: item.TIPO_INTERVENCION || '',
            ID_OPERATIVO: item.ID_OPERATIVO || '',
            PROVINCIA: toDisplayName(item.PROVINCIA || ''),
            // Clave normalizada sin tildes para comparaciones robustas - FUNCIÓN CENTRALIZADA
            PROVINCIA_KEY: normalizeProvinceKey(item.PROVINCIA || ''),
            DEPARTAMENTO_O_PARTIDO: item['DEPARTAMENTO O PARTIDO'] || '',
            // Mapear campos de unidad interviniente
            UNIDAD_INTERVINIENTE: item.UNIDAD_INTERVINIENTE || item.unidad_interviniente || item.FUERZA_INTERVINIENTE || '',
        };
    });
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

// Funciones helper para categorización con jerarquía
const isDetenido = (item) => {
    const desc = (item.DESCRIPCION || item.DESCRIPCIÓN || '').toLowerCase();
    const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();
    const delito = (item.DELITO_IMPUTADO || '').toLowerCase();
    
    // CRITERIO PRINCIPAL: Si tiene campos específicos de detenido, es un detenido
    const tieneInfoDetenido = (item.EDAD !== undefined && item.EDAD !== null) ||
                             (item.SEXO && item.SEXO.trim() !== '') ||
                             (item.SITUACION_PROCESAL && item.SITUACION_PROCESAL.trim() !== '') ||
                             (item.DELITO_IMPUTADO && item.DELITO_IMPUTADO.trim() !== '') ||
                             (item.NACIONALIDAD && item.NACIONALIDAD.trim() !== '');
    
    // CRITERIO SECUNDARIO: Keywords en descripción/tipo
    const tieneKeywordsDetenido = desc.includes('detención') || desc.includes('detenido') ||
        desc.includes('arresto') || desc.includes('aprehendido') ||
        desc.includes('capturado') || desc.includes('arrestado') ||
        tipo.includes('detención') || tipo.includes('detenido') ||
        tipo.includes('aprehensión') || tipo.includes('arrestado') ||
        delito.includes('captura') || delito.includes('detención');
    
    return tieneInfoDetenido || tieneKeywordsDetenido;
};

const isIncautacion = (item) => {
    const desc = (item.DESCRIPCION || item.DESCRIPCIÓN || '').toLowerCase();
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
};

const isAbatido = (item) => {
    const desc = (item.DESCRIPCION || item.DESCRIPCIÓN || '').toLowerCase();
    const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

    return desc.includes('abatido') || desc.includes('enfrentamiento') ||
        desc.includes('tiroteo') || desc.includes('baja') ||
        tipo.includes('abatido');
};

const isTrata = (item) => {
    const desc = (item.DESCRIPCION || item.DESCRIPCIÓN || '').toLowerCase();
    const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();

    return desc.includes('trata') || desc.includes('tráfico') ||
        desc.includes('explotación') || desc.includes('traficante') ||
        tipo.includes('trata');
};

const isAfectado = (item) => {
    const desc = (item.DESCRIPCION || item.DESCRIPCIÓN || '').toLowerCase();
    const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();
    
    // CRITERIO PRINCIPAL: Si tiene campos específicos de personal afectado
    const tieneInfoAfectados = (item.CANT_EFECTIVOS !== undefined && item.CANT_EFECTIVOS !== null) ||
                              (item.CANT_AUTOS_CAMIONETAS !== undefined && item.CANT_AUTOS_CAMIONETAS !== null) ||
                              (item.CANT_MOTOCICLETAS !== undefined && item.CANT_MOTOCICLETAS !== null) ||
                              (item.cant_efectivos !== undefined && item.cant_efectivos !== null) ||
                              (item.cant_autos_camionetas !== undefined && item.cant_autos_camionetas !== null) ||
                              (item.cant_motocicletas !== undefined && item.cant_motocicletas !== null);
    
    // CRITERIO SECUNDARIO: Keywords de personal/recursos afectados  
    const tieneKeywordsAfectados = desc.includes('afectado') || desc.includes('efectivos') ||
        desc.includes('personal') || desc.includes('móviles') ||
        desc.includes('patrulleros') || desc.includes('recursos') ||
        tipo.includes('afectado') || tipo.includes('recursos');
    
    return tieneInfoAfectados || tieneKeywordsAfectados;
};

const isControlado = (item) => {
    const desc = (item.DESCRIPCION || item.DESCRIPCIÓN || '').toLowerCase();
    const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();
    
    // Solo considerar controlados si NO es detenido (jerarquía)
    if (isDetenido(item)) return false;
    
    const tieneKeywordsControl = desc.includes('control') || tipo.includes('control') ||
        desc.includes('verificación') || desc.includes('despliegue') ||
        desc.includes('controlado') || desc.includes('revisión') ||
        desc.includes('inspección') || desc.includes('identificación') ||
        tipo.includes('preventivo');
    
    return tieneKeywordsControl;
};

// Función para categorizar datos por tipo de operativo - JERARQUÍA IMPLEMENTADA
export const getCategorizedData = (data) => {
    if (!data || data.length === 0) {
        console.log('❌ getCategorizedData: No hay datos para categorizar');
        return {};
    }

    console.log(`🔄 getCategorizedData: Categorizando ${data.length} registros con jerarquía`);

    // JERARQUÍA DE CATEGORIZACIÓN: detenidos > incautaciones > abatidos > trata > afectados > controlados > procedimientos
    const categories = {
        // Categoría prioritaria: DETENIDOS
        detenidos: data.filter(item => isDetenido(item)),
        // Categoría: INCAUTACIONES (prioridad alta)
        incautaciones: data.filter(item => !isDetenido(item) && isIncautacion(item)),
        
        // Categoría: ABATIDOS (prioridad alta)
        abatidos: data.filter(item => !isDetenido(item) && !isIncautacion(item) && isAbatido(item)),
        
        // Categoría: TRATA (prioridad media-alta)
        trata: data.filter(item => !isDetenido(item) && !isIncautacion(item) && !isAbatido(item) && isTrata(item)),
        
        // Categoría: AFECTADOS (prioridad media)
        afectados: data.filter(item => !isDetenido(item) && !isIncautacion(item) && !isAbatido(item) && !isTrata(item) && isAfectado(item)),
        
        // Categoría: CONTROLADOS (prioridad media-baja, ya implementa jerarquía internamente)
        controlados: data.filter(item => isControlado(item)),
        
        // Categoría: PROCEDIMIENTOS GENERALES (prioridad más baja - solo casos que no entran en categorías específicas)
        procedimientos: data.filter(item => {
            // Solo considerar procedimientos si NO pertenece a ninguna categoría específica
            if (isDetenido(item) || isIncautacion(item) || isAbatido(item) || isTrata(item) || isAfectado(item) || isControlado(item)) {
                return false;
            }
            
            const desc = (item.DESCRIPCION || item.DESCRIPCIÓN || '').toLowerCase();
            const tipo = (item.TIPO_INTERVENCION || '').toLowerCase();
            
            // Criterios más específicos para procedimientos generales
            return desc.includes('procedimiento') || desc.includes('operativo') ||
                desc.includes('intervención') || tipo.includes('procedimiento') ||
                tipo.includes('orden policial') || tipo.includes('orden judicial') ||
                desc.includes('allanamiento') || desc.includes('mandato judicial') ||
                desc.includes('requisa') || desc.includes('inspección general') ||
                tipo.includes('diligencia judicial');
        }),
    };

    // Logging de resultados de categorización
    const summary = Object.keys(categories).reduce((acc, key) => {
        acc[key] = categories[key].length;
        return acc;
    }, {});
    
    console.log('📊 Resultados de categorización jerárquica:', summary);
    
    // Verificar integridad de la jerarquía
    const totalCategorized = Object.values(summary).reduce((sum, count) => sum + count, 0);
    if (totalCategorized > data.length) {
        console.warn('⚠️ ADVERTENCIA: Hay solapamiento en categorías (total categorizado > total datos)');
        console.warn(`Total datos: ${data.length}, Total categorizado: ${totalCategorized}`);
    }
    
    // Log específico con jerarquía implementada
    console.log('🔄 Jerarquía aplicada correctamente:', {
        prioridad_1_detenidos: summary.detenidos,
        prioridad_2_incautaciones: summary.incautaciones, 
        prioridad_3_abatidos: summary.abatidos,
        prioridad_4_trata: summary.trata,
        prioridad_5_afectados: summary.afectados,
        prioridad_6_controlados: summary.controlados,
        prioridad_7_procedimientos: summary.procedimientos
    });

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

    // Incluir todos los meses presentes con datos reales
    const monthlyKeys = Object.keys(monthlyMap)
        .filter(key => monthlyMap[key] > 0)
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
