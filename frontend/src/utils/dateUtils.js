/**
 * Utilidades para manejo de fechas en formato dd/MM/yyyy
 */

/**
 * Convierte una fecha del formato ISO (yyyy-MM-dd) al formato dd/MM/yyyy
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} - Fecha en formato dd/MM/yyyy
 */
export const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return '';
    
    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return '';
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Convierte una fecha del formato dd/MM/yyyy al formato ISO (yyyy-MM-dd)
 * @param {string} ddmmyyyyDate - Fecha en formato dd/MM/yyyy
 * @returns {string} - Fecha en formato ISO
 */
export const formatDateToISO = (ddmmyyyyDate) => {
    if (!ddmmyyyyDate) return '';
    
    try {
        const parts = ddmmyyyyDate.split('/');
        if (parts.length !== 3) return '';
        
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
        if (day < 1 || day > 31 || month < 1 || month > 12) return '';
        
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) return '';
        
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error parsing date:', error);
        return '';
    }
};

/**
 * Valida si una fecha en formato dd/MM/yyyy es válida
 * @param {string} ddmmyyyyDate - Fecha en formato dd/MM/yyyy
 * @returns {boolean} - True si es válida
 */
export const isValidDDMMYYYYDate = (ddmmyyyyDate) => {
    if (!ddmmyyyyDate) return false;
    
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = ddmmyyyyDate.match(dateRegex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    if (day < 1 || day > 31 || month < 1 || month > 12) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};

/**
 * Obtiene la fecha actual en formato dd/MM/yyyy
 * @returns {string} - Fecha actual en formato dd/MM/yyyy
 */
export const getCurrentDateDDMMYYYY = () => {
    const today = new Date();
    return formatDateToDDMMYYYY(today.toISOString().split('T')[0]);
};
