const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const REQUIRE_AUTH = (import.meta.env.VITE_REQUIRE_AUTH || 'false').toLowerCase() === 'true';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    // Auto-login solo si está habilitado explícitamente
    if (REQUIRE_AUTH) {
      this.ensureAuthentication();
    } else {
      // Si no requerimos auth, asegurarnos de no enviar tokens previos
      this.setAuthToken(null);
    }
  }

  async ensureAuthentication() {
    if (!this.token || this.isTokenExpired()) {
      try {
        // Try auto-login with admin credentials for development
        await this.login('admin', 'admin123');
      } catch (error) {
        console.warn('Auto-login failed:', error);
      }
    }
  }

  isTokenExpired() {
    if (!this.token) return true;
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  logout() {
    this.setAuthToken(null);
  }

  // Data operations - Using existing endpoints
  async getDataRaw() {
    // Lectura directa del endpoint maestro
    return await this.request('/data');
  }

  // eliminado duplicado getDataStats

  // Legacy method for backward compatibility: devuelve el dataset maestro sin categorizar
  async getData() {
    return await this.getDataRaw();
  }

  async uploadData(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/data/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  }

  async clearAllData() {
    return await this.request('/data/clear', {
      method: 'DELETE',
    });
  }

  async getDataStats() {
    return await this.request('/data/stats');
  }

  // Specialized filtering endpoints
  async getSpecializedStats() {
    return await this.request('/data/specialized-stats');
  }

  async getFilteringStats() {
    return await this.request('/data/filtering-stats');
  }

  async getFilteredIncautaciones() {
    return await this.request('/data/filtered/incautaciones');
  }

  async getFilteredDetenidos() {
    return await this.request('/data/filtered/detenidos');
  }

  async getFilteredControlados() {
    return await this.request('/data/filtered/controlados');
  }

  async getFilteredAfectados() {
    return await this.request('/data/filtered/afectados');
  }

  // Specialized table data endpoints
  async getDetenidos() {
    return await this.request('/data/detenidos');
  }

  async getIncautaciones() {
    return await this.request('/data/incautaciones');
  }

  async getTrata() {
    return await this.request('/data/trata');
  }

  async getFallecidos() {
    return await this.request('/data/fallecidos');
  }

  async getAbatidos() {
    return await this.request('/data/abatidos');
  }

  // Get all categorized data at once (sin recursión)
  async getCategorizedData() {
    try {
      const [general, detenidos, incautaciones, trata, fallecidos, abatidos, controlados, afectados] = await Promise.all([
        this.getDataRaw(), // Tabla maestra
        this.getDetenidos(),
        this.getIncautaciones(), 
        this.getTrata(),
        this.getFallecidos(),
        this.getAbatidos(),
        this.getFilteredControlados(),
        this.getFilteredAfectados()
      ]);

      return {
        general: general || [],
        detenidos: detenidos || [],
        incautaciones: incautaciones || [],
        trata: trata || [],
        fallecidos: fallecidos || [],
        abatidos: abatidos || [],
        controlados: controlados || [],
        afectados: afectados || [],
        procedimientos: general || [],
      };
    } catch (error) {
      console.error('Error obteniendo datos categorizados:', error);
      return {
        general: [],
        detenidos: [],
        incautaciones: [],
        trata: [],
        fallecidos: [],
        abatidos: [],
        controlados: [],
        afectados: [],
        procedimientos: []
      };
    }
  }

  // HTTP method shortcuts
  async get(endpoint) {
    return await this.request(endpoint, {
      method: 'GET',
    });
  }

  async post(endpoint, data = null) {
    return await this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put(endpoint, data = null) {
    return await this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete(endpoint) {
    return await this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;