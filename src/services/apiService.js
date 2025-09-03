const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
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

  // Data operations
  async getData() {
    return await this.request('/data');
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