/**
 * Utilidades para gráficos - abreviaciones y formateo
 */

// Mapeo de abreviaciones para provincias argentinas
export const PROVINCE_ABBREVIATIONS = {
    'CIUDAD AUTÓNOMA DE BUENOS AIRES': 'C.A.B.A',
    'CIUDAD AUTONOMA DE BUENOS AIRES': 'C.A.B.A',
    'BUENOS AIRES': 'Bs. As.',
    'SANTIAGO DEL ESTERO': 'Sgo. del Estero',
    'TIERRA DEL FUEGO': 'T. del Fuego',
    'TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR': 'T. del Fuego',
    'SAN LUIS': 'San Luis',
    'SAN JUAN': 'San Juan',
    'SANTA CRUZ': 'Sta. Cruz',
    'SANTA FE': 'Santa Fe',
    'RÍO NEGRO': 'Río Negro',
    'RIO NEGRO': 'Río Negro',
    'LA RIOJA': 'La Rioja',
    'LA PAMPA': 'La Pampa',
    'ENTRE RÍOS': 'Entre Ríos',
    'ENTRE RIOS': 'Entre Ríos',
    'CORRIENTES': 'Corrientes',
    'CÓRDOBA': 'Córdoba',
    'CORDOBA': 'Córdoba',
    'CHUBUT': 'Chubut',
    'CHACO': 'Chaco',
    'CATAMARCA': 'Catamarca',
    'TUCUMÁN': 'Tucumán',
    'TUCUMAN': 'Tucumán',
    'SALTA': 'Salta',
    'NEUQUÉN': 'Neuquén',
    'NEUQUEN': 'Neuquén',
    'MISIONES': 'Misiones',
    'MENDOZA': 'Mendoza',
    'JUJUY': 'Jujuy',
    'FORMOSA': 'Formosa'
};

/**
 * Abrevia nombres largos de provincias y departamentos
 * @param {string} name - Nombre completo
 * @param {number} maxLength - Longitud máxima (default: 12)
 * @returns {string} - Nombre abreviado
 */
export const abbreviateName = (name, maxLength = 12) => {
    if (!name || typeof name !== 'string') return name;
    
    const upperName = name.toUpperCase().trim();
    
    // Verificar si hay una abreviación específica
    if (PROVINCE_ABBREVIATIONS[upperName]) {
        return PROVINCE_ABBREVIATIONS[upperName];
    }
    
    // Si es corto, devolverlo tal como está
    if (name.length <= maxLength) {
        return name;
    }
    
    // Abreviaciones generales para departamentos
    let abbreviated = name
        .replace(/DEPARTAMENTO/gi, 'Dpto.')
        .replace(/PARTIDO/gi, 'Pdo.')
        .replace(/GENERAL/gi, 'Gral.')
        .replace(/CORONEL/gi, 'Cnel.')
        .replace(/ALMIRANTE/gi, 'Alte.')
        .replace(/COMANDANTE/gi, 'Cdte.')
        .replace(/PRESIDENTE/gi, 'Pte.')
        .replace(/DOCTOR/gi, 'Dr.')
        .replace(/INGENIERO/gi, 'Ing.')
        .replace(/PROFESOR/gi, 'Prof.')
        .replace(/CAPITAL/gi, 'Cap.')
        .replace(/FEDERAL/gi, 'Fed.')
        .replace(/NACIONAL/gi, 'Nac.')
        .replace(/INTERNACIONAL/gi, 'Int.')
        .replace(/METROPOLITANO/gi, 'Metro.')
        .replace(/MUNICIPAL/gi, 'Mpal.');
    
    // Si sigue siendo largo, truncar con puntos suspensivos
    if (abbreviated.length > maxLength) {
        abbreviated = abbreviated.substring(0, maxLength - 1) + '…';
    }
    
    return abbreviated;
};

/**
 * Calcula porcentajes para un dataset
 * @param {Array} data - Array de valores
 * @returns {Array} - Array de porcentajes
 */
export const calculatePercentages = (data) => {
    const total = data.reduce((sum, value) => sum + value, 0);
    if (total === 0) return data.map(() => 0);
    
    return data.map(value => ((value / total) * 100));
};

/**
 * Formatea un valor con su porcentaje
 * @param {number} value - Valor absoluto
 * @param {number} total - Total para calcular porcentaje
 * @returns {string} - Formato: "valor (porcentaje%)"
 */
export const formatValueWithPercentage = (value, total) => {
    if (total === 0) return `${value} (0%)`;
    const percentage = ((value / total) * 100).toFixed(1);
    return `${value} (${percentage}%)`;
};

/**
 * Configuración mejorada de tooltips para gráficos
 * @param {string} datasetLabel - Etiqueta del dataset
 * @returns {Object} - Configuración de tooltip
 */
export const getEnhancedTooltipConfig = (datasetLabel = '') => ({
    titleColor: 'rgba(255, 255, 255, 0.9)',
    bodyColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    cornerRadius: 8,
    padding: 12,
    titleFont: {
        size: 13,
        weight: 'bold'
    },
    bodyFont: {
        size: 12
    },
    callbacks: {
        label: function(context) {
            const value = context.parsed.y || context.parsed;
            const dataset = context.dataset;
            const total = dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            
            return `${datasetLabel || context.dataset.label}: ${value} (${percentage}%)`;
        },
        afterLabel: function(context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((sum, val) => sum + val, 0);
            return `Total: ${total}`;
        }
    }
});

/**
 * Configuración de onClick para abrir modal con detalles
 * @param {Function} onChartClick - Función callback para manejar el clic
 * @returns {Function} - Handler de onClick
 */
export const getChartClickHandler = (onChartClick) => {
    return (event, elements) => {
        console.log('Chart click event:', { event, elements }); // Debug
        if (elements && elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            
            console.log('Element clicked:', { datasetIndex, index, element }); // Debug
            
            if (onChartClick) {
                onChartClick({
                    datasetIndex,
                    index,
                    element,
                    event
                });
            }
        } else {
            console.log('No elements found in click'); // Debug
        }
    };
};
