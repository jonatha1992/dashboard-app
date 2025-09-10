/**
 * Unit tests for DashboardContext utilities
 * These are critical functions that handle data processing
 */

import { describe, it, expect, vi } from 'vitest';
import {
  parseDateToISO,
  formatDateForDisplay,
  normalizeProvinceKey,
  getProvinceKeyFromItem,
  getCoordinatesFromItem
} from '../contexts/DashboardContext';

describe('DashboardContext Utilities', () => {
  describe('parseDateToISO', () => {
    it('should parse Argentine date format dd/MM/yyyy', () => {
      expect(parseDateToISO('15/03/2025')).toBe('2025-03-15');
      expect(parseDateToISO('01/01/2025')).toBe('2025-01-01');
      expect(parseDateToISO('31/12/2024')).toBe('2024-12-31');
    });

    it('should handle single digit days and months', () => {
      expect(parseDateToISO('5/3/2025')).toBe('2025-03-05');
      expect(parseDateToISO('15/3/2025')).toBe('2025-03-15');
      expect(parseDateToISO('5/12/2025')).toBe('2025-12-05');
    });

    it('should handle ISO date format', () => {
      expect(parseDateToISO('2025-03-15')).toBe('2025-03-15');
      expect(parseDateToISO('2025-03-15T10:30:00')).toBe('2025-03-15');
    });

    it('should reject invalid dates', () => {
      expect(parseDateToISO('32/13/2025')).toBe(null);
      expect(parseDateToISO('31/02/2025')).toBe(null);
      expect(parseDateToISO('29/02/2023')).toBe(null); // Not leap year
      expect(parseDateToISO('00/01/2025')).toBe(null);
      expect(parseDateToISO('01/00/2025')).toBe(null);
    });

    it('should reject dates outside reasonable range', () => {
      expect(parseDateToISO('01/01/1800')).toBe(null);
      expect(parseDateToISO('01/01/2200')).toBe(null);
      expect(parseDateToISO('01/01/1899')).toBe(null);
      expect(parseDateToISO('01/01/2101')).toBe(null);
    });

    it('should handle edge cases', () => {
      expect(parseDateToISO('')).toBe(null);
      expect(parseDateToISO('-')).toBe(null);
      expect(parseDateToISO(null)).toBe(null);
      expect(parseDateToISO(undefined)).toBe(null);
      expect(parseDateToISO('malformed')).toBe(null);
      expect(parseDateToISO('abc/def/ghij')).toBe(null);
    });

    it('should handle leap years correctly', () => {
      expect(parseDateToISO('29/02/2024')).toBe('2024-02-29'); // Leap year
      expect(parseDateToISO('29/02/2020')).toBe('2020-02-29'); // Leap year
    });
  });

  describe('formatDateForDisplay', () => {
    // Mock toLocaleDateString
    const mockToLocaleDateString = vi.fn();
    global.Date.prototype.toLocaleDateString = mockToLocaleDateString;

    beforeEach(() => {
      mockToLocaleDateString.mockReturnValue('15/03/2025');
    });

    it('should format valid dates for display', () => {
      const result = formatDateForDisplay('2025-03-15');
      expect(result).toBe('15/03/2025');
      expect(mockToLocaleDateString).toHaveBeenCalledWith('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    });

    it('should handle invalid dates gracefully', () => {
      expect(formatDateForDisplay('')).toBe('Sin fecha');
      expect(formatDateForDisplay(null)).toBe('Sin fecha');
      expect(formatDateForDisplay(undefined)).toBe('Sin fecha');
    });

    it('should return original string if parsing fails', () => {
      const invalidDate = 'invalid-date';
      expect(formatDateForDisplay(invalidDate)).toBe(invalidDate);
    });
  });

  describe('normalizeProvinceKey', () => {
    it('should normalize CABA variants', () => {
      const expectedKey = 'ciudad autonoma de buenos aires';
      
      expect(normalizeProvinceKey('CABA')).toBe(expectedKey);
      expect(normalizeProvinceKey('Ciudad Autónoma de Buenos Aires')).toBe(expectedKey);
      expect(normalizeProvinceKey('Ciudad Autonoma de Buenos Aires')).toBe(expectedKey);
      expect(normalizeProvinceKey('Capital Federal')).toBe(expectedKey);
      expect(normalizeProvinceKey('CAP FED')).toBe(expectedKey);
    });

    it('should remove diacritics', () => {
      expect(normalizeProvinceKey('Córdoba')).toBe('cordoba');
      expect(normalizeProvinceKey('Tucumán')).toBe('tucuman');
      expect(normalizeProvinceKey('Neuquén')).toBe('neuquen');
      expect(normalizeProvinceKey('Río Negro')).toBe('rio negro');
    });

    it('should handle case normalization', () => {
      expect(normalizeProvinceKey('BUENOS AIRES')).toBe('buenos aires');
      expect(normalizeProvinceKey('Buenos Aires')).toBe('buenos aires');
      expect(normalizeProvinceKey('buenos aires')).toBe('buenos aires');
    });

    it('should handle whitespace normalization', () => {
      expect(normalizeProvinceKey('  Buenos   Aires  ')).toBe('buenos aires');
      expect(normalizeProvinceKey('Buenos\t\tAires')).toBe('buenos aires');
      expect(normalizeProvinceKey('Buenos\nAires')).toBe('buenos aires');
    });

    it('should handle edge cases', () => {
      expect(normalizeProvinceKey('')).toBe('');
      expect(normalizeProvinceKey(null)).toBe('');
      expect(normalizeProvinceKey(undefined)).toBe('');
      expect(normalizeProvinceKey(0)).toBe('0');
      expect(normalizeProvinceKey(123)).toBe('123');
    });

    it('should be valid province key format', () => {
      expect(normalizeProvinceKey('Buenos Aires')).toBeValidProvinceKey();
      expect(normalizeProvinceKey('Córdoba')).toBeValidProvinceKey();
      expect(normalizeProvinceKey('CABA')).toBeValidProvinceKey();
    });
  });

  describe('getProvinceKeyFromItem', () => {
    it('should extract province from standard field', () => {
      const item = { PROVINCIA: 'Buenos Aires' };
      expect(getProvinceKeyFromItem(item)).toBe('buenos aires');
    });

    it('should try multiple field candidates', () => {
      const testCases = [
        { provincia: 'Córdoba' },
        { PROVINCIA_EVENTO: 'Santa Fe' },
        { Province: 'Mendoza' },
        { PROV: 'Salta' }
      ];

      testCases.forEach(item => {
        const result = getProvinceKeyFromItem(item);
        expect(result).toBeValidProvinceKey();
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should prefer PROVINCIA_KEY if available', () => {
      const item = {
        PROVINCIA_KEY: 'normalized_key',
        PROVINCIA: 'Buenos Aires'
      };
      expect(getProvinceKeyFromItem(item)).toBe('normalized_key');
    });

    it('should handle empty or invalid values', () => {
      expect(getProvinceKeyFromItem({})).toBe('');
      expect(getProvinceKeyFromItem({ PROVINCIA: '' })).toBe('');
      expect(getProvinceKeyFromItem({ PROVINCIA: '-' })).toBe('');
      expect(getProvinceKeyFromItem({ PROVINCIA: null })).toBe('');
      expect(getProvinceKeyFromItem(null)).toBe('');
      expect(getProvinceKeyFromItem(undefined)).toBe('');
    });
  });

  describe('getCoordinatesFromItem', () => {
    it('should extract coordinates from standard fields', () => {
      const item = {
        LATITUD: -34.6037,
        LONGITUD: -58.3816
      };
      
      const result = getCoordinatesFromItem(item);
      expect(result).toHaveValidCoordinates();
      expect(result.lat).toBe(-34.6037);
      expect(result.lng).toBe(-58.3816);
    });

    it('should try multiple field candidates', () => {
      const testCases = [
        { latitud: -34.6037, longitud: -58.3816 },
        { latitud_decimal: -34.6037, longitud_decimal: -58.3816 },
        { lat: -34.6037, lng: -58.3816 },
        { latitude: -34.6037, longitude: -58.3816 }
      ];

      testCases.forEach(item => {
        const result = getCoordinatesFromItem(item);
        expect(result).toHaveValidCoordinates();
      });
    });

    it('should validate coordinate ranges', () => {
      const invalidCases = [
        { LATITUD: 91, LONGITUD: -58.3816 },    // Invalid latitude
        { LATITUD: -91, LONGITUD: -58.3816 },   // Invalid latitude
        { LATITUD: -34.6037, LONGITUD: 181 },   // Invalid longitude
        { LATITUD: -34.6037, LONGITUD: -181 },  // Invalid longitude
      ];

      invalidCases.forEach(item => {
        const result = getCoordinatesFromItem(item);
        expect(result.lat).toBe(null);
        expect(result.lng).toBe(null);
      });
    });

    it('should filter (0,0) coordinates', () => {
      const item = { LATITUD: 0, LONGITUD: 0 };
      const result = getCoordinatesFromItem(item);
      expect(result.lat).toBe(null);
      expect(result.lng).toBe(null);
    });

    it('should require both coordinates', () => {
      const incompleteCases = [
        { LATITUD: -34.6037 },  // Missing longitude
        { LONGITUD: -58.3816 }, // Missing latitude
        {}                      // Missing both
      ];

      incompleteCases.forEach(item => {
        const result = getCoordinatesFromItem(item);
        expect(result.lat).toBe(null);
        expect(result.lng).toBe(null);
      });
    });

    it('should handle edge cases', () => {
      expect(getCoordinatesFromItem(null)).toEqual({ lat: null, lng: null });
      expect(getCoordinatesFromItem(undefined)).toEqual({ lat: null, lng: null });
      expect(getCoordinatesFromItem('not an object')).toEqual({ lat: null, lng: null });
    });

    it('should handle string coordinates', () => {
      const item = {
        LATITUD: '-34.6037',
        LONGITUD: '-58.3816'
      };
      
      const result = getCoordinatesFromItem(item);
      expect(result).toHaveValidCoordinates();
      expect(result.lat).toBe(-34.6037);
      expect(result.lng).toBe(-58.3816);
    });

    it('should handle non-numeric values', () => {
      const item = {
        LATITUD: 'invalid',
        LONGITUD: 'also invalid'
      };
      
      const result = getCoordinatesFromItem(item);
      expect(result.lat).toBe(null);
      expect(result.lng).toBe(null);
    });
  });

  describe('Integration tests', () => {
    it('should process complete data item correctly', () => {
      const dataItem = {
        ID_OPERATIVO: 'OP001',
        PROVINCIA: 'Ciudad Autónoma de Buenos Aires',
        FECHA: '15/03/2025',
        LATITUD: -34.6037,
        LONGITUD: -58.3816,
        DESCRIPCION: 'Operativo de control'
      };

      // Test all functions work together
      const provinceKey = getProvinceKeyFromItem(dataItem);
      const coordinates = getCoordinatesFromItem(dataItem);
      const isoDate = parseDateToISO(dataItem.FECHA);
      const displayDate = formatDateForDisplay(isoDate);

      expect(provinceKey).toBeValidProvinceKey();
      expect(coordinates).toHaveValidCoordinates();
      expect(isoDate).toBe('2025-03-15');
      expect(displayDate).toBeTruthy();
    });

    it('should handle malformed data gracefully', () => {
      const malformedItem = {
        ID_OPERATIVO: '',
        PROVINCIA: null,
        FECHA: 'invalid-date',
        LATITUD: 'not-a-number',
        LONGITUD: undefined
      };

      // Should not throw errors
      expect(() => {
        const _provinceKey = getProvinceKeyFromItem(malformedItem);
        const _coordinates = getCoordinatesFromItem(malformedItem);
        const _isoDate = parseDateToISO(malformedItem.FECHA);
      }).not.toThrow();

      // Should return safe default values
      expect(getProvinceKeyFromItem(malformedItem)).toBe('');
      expect(getCoordinatesFromItem(malformedItem)).toEqual({ lat: null, lng: null });
      expect(parseDateToISO(malformedItem.FECHA)).toBe(null);
    });
  });
});