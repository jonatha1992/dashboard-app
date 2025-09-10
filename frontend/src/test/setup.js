/**
 * Test setup configuration for Vitest
 * This file configures the global test environment
 */

import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

// Auto cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock fetch
global.fetch = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Leaflet
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    eachLayer: vi.fn(),
    invalidateSize: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    bindPopup: vi.fn(),
    setLatLng: vi.fn(),
  })),
  icon: vi.fn(),
  divIcon: vi.fn(),
}));

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Bar: vi.fn(({ data }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} />
  )),
  Line: vi.fn(({ data }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} />
  )),
  Doughnut: vi.fn(({ data }) => (
    <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)} />
  )),
}));

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(({ children, ...props }) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  )),
  TileLayer: vi.fn(() => <div data-testid="tile-layer" />),
  Marker: vi.fn(({ children, position, ...props }) => (
    <div data-testid="map-marker" data-position={JSON.stringify(position)} {...props}>
      {children}
    </div>
  )),
  Popup: vi.fn(({ children }) => (
    <div data-testid="map-popup">{children}</div>
  )),
}));

// MSW server setup for API mocking
const server = setupServer(
  // Mock authentication endpoints
  http.post('http://localhost:8000/api/login/', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: 1,
        username: 'testuser',
        role: 'admin'
      }
    });
  }),

  // Mock data endpoints
  http.get('http://localhost:8000/api/data/categorized/', () => {
    return HttpResponse.json({
      general: [],
      detenidos: [],
      incautaciones: [],
      controlados: [],
      afectados: [],
      procedimientos: [],
      abatidos: [],
      trata: []
    });
  }),

  // Mock stats endpoint
  http.get('http://localhost:8000/api/data/stats/', () => {
    return HttpResponse.json({
      totalRecords: 0,
      dateRange: {
        earliest: null,
        latest: null
      },
      provinces: []
    });
  }),

  // Mock upload endpoint
  http.post('http://localhost:8000/api/upload-excel/', () => {
    return HttpResponse.json({
      status: 'success',
      message: 'File uploaded successfully',
      stats: {
        totalProcessed: 100,
        totalCreated: 95,
        totalUpdated: 5,
        totalErrors: 0
      }
    });
  })
);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Export server for custom test handlers
export { server };

// Custom matchers
expect.extend({
  toHaveValidCoordinates(received) {
    const { lat, lng } = received;
    const pass = 
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !(lat === 0 && lng === 0);

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to have valid coordinates`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to have valid coordinates`,
        pass: false,
      };
    }
  },

  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  toBeValidProvinceKey(received) {
    const pass = 
      typeof received === 'string' &&
      received.length > 0 &&
      received === received.toLowerCase() &&
      !/[áéíóúñü]/.test(received); // No diacritics

    if (pass) {
      return {
        message: () => `expected "${received}" not to be a valid province key`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to be a valid province key`,
        pass: false,
      };
    }
  }
});