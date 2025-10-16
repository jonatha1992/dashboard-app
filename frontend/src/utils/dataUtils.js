import { DEFAULT_OPERATIVE_CODE, OPERATIVE_CODE_MAP } from '../constants/operativeCodes';

// Utility functions for data processing
export const parseDateToISO = (dateStr) => {
  if (!dateStr) return null;
  
  const str = String(dateStr).trim();
  if (!str || str === '-') return null;
  
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  
  // dd/MM/yyyy format
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const dd = dmy[1].padStart(2, '0');
    const mm = dmy[2].padStart(2, '0');
    const yyyy = dmy[3];
    const isoDate = `${yyyy}-${mm}-${dd}`;
    
    const testDate = new Date(isoDate);
    if (!isNaN(testDate.getTime()) && parseInt(yyyy) > 1900 && parseInt(yyyy) < 2100) {
      return isoDate;
    }
  }
  
  // mm/dd/yyyy format
  const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const mm = mdy[1].padStart(2, '0');
    const dd = mdy[2].padStart(2, '0');
    const yyyy = mdy[3];
    const isoDate = `${yyyy}-${mm}-${dd}`;
    
    const testDate = new Date(isoDate);
    if (!isNaN(testDate.getTime()) && parseInt(mm) <= 12) {
      return isoDate;
    }
  }
  
  return null;
};

export const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-AR');
};

export const normalizeProvinceKey = (s) => {
  if (!s && s !== 0) return '';
  try {
    const str = String(s).trim().replace(/\s+/g, ' ');
    
    const removeDiacritics = (text) => {
      try {
        return text.normalize('NFD').replace(/\p{M}/gu, '');
      } catch {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
    };
    
    const normalized = removeDiacritics(str).toLowerCase();
    
    const provinceMap = {
      'caba': 'ciudad autonoma de buenos aires',
      'ciudad autonoma de buenos aires': 'ciudad autonoma de buenos aires',
      'capital federal': 'ciudad autonoma de buenos aires',
      'cap fed': 'ciudad autonoma de buenos aires',
      'bs as': 'buenos aires',
      'tierra del fuego antartida e islas del atlantico sur': 'tierra del fuego',
      'sgo del estero': 'santiago del estero',
      's fe': 'santa fe',
      'santa fé': 'santa fe',
      'entre rios': 'entre ríos',
      'neuquen': 'neuquén',
      'cordoba': 'córdoba',
      'tucuman': 'tucumán'
    };
    
    if (provinceMap[normalized]) {
      return provinceMap[normalized];
    }
    
    for (const [key, value] of Object.entries(provinceMap)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
    
    return normalized;
  } catch (error) {
    console.warn('⚠️ Error normalizando provincia:', s, error);
    return String(s).toLowerCase();
  }
};

export const getCoordinatesFromItem = (item) => {
  if (!item) return null;
  
  // Try different possible field names for coordinates
  const lat = item.lat || item.latitude || item.LATITUD || item.latitud;
  const lng = item.lng || item.longitude || item.long || item.LONGITUD || item.longitud;
  
  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  
  return null;
};

export const getProvinceKeyFromItem = (item) => {
  if (!item) return '';
  
  // Try different possible field names for province
  const province = item.province || item.PROVINCIA || item.Provincia || item.provincia || item.PROV || item.prov;
  return normalizeProvinceKey(province);
};

export const getDepartamentoFromItem = (item) => {
  if (!item) return '';
  
  // Try different possible field names for department
  const candidates = [
    item.departamento,
    item.DEPARTAMENTO,
    item.Departamento,
    item.departamento_o_partido,
    item.DEPARTAMENTO_O_PARTIDO,
    item['DEPARTAMENTO O PARTIDO'],
    item.departamentoPartido,
    item['departamento-partido'],
    item.depto,
    item.DEPTO,
    item.partido,
    item.PARTIDO,
    item.localidad,
    item.LOCALIDAD,
  ];

  const value = candidates.find((candidate) => {
    if (candidate === undefined || candidate === null) return false;
    const str = String(candidate).trim();
    return str.length > 0 && str !== '-';
  });

  return value ? String(value).trim() : '';
};

export const getOperativoCodeFromItem = (item) => {
  if (!item) return DEFAULT_OPERATIVE_CODE;

  const candidates = [
    item.CODIGO_OPERATIVO,
    item.codigo_operativo,
    item.CODIGO,
    item.codigo,
    item.NUMERO_OPERATIVO,
    item.numero_operativo,
    item.NRO_OPERATIVO,
    item['NRO OPERATIVO'],
    item.OPERATIVO,
    item.operativo
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    const str = String(candidate).trim();
    if (!str || str === '-') continue;
    if (OPERATIVE_CODE_MAP[str]) {
      return str;
    }
    const numeric = str.replace(/\D+/g, '');
    if (numeric && OPERATIVE_CODE_MAP[numeric]) {
      return numeric;
    }
    if (numeric) {
      return numeric;
    }
    return str;
  }

  return DEFAULT_OPERATIVE_CODE;
};
