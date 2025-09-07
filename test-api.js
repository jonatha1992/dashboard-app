// Test API Service
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = null;
  }

  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    this.token = data.token;
    return data;
  }

  async request(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  }

  async getCategorizedData() {
    const allData = await this.request('/data');
    return {
      procedimientos: allData,
      totalRecords: allData.length
    };
  }

  async getDataStats() {
    return await this.request('/data/stats');
  }
}

async function testAPI() {
  console.log('🔍 Testing API Service...');
  
  const api = new ApiService();
  
  try {
    // Login
    console.log('🔑 Attempting login...');
    const loginResult = await api.login('admin', 'admin123');
    console.log('✅ Login successful:', loginResult.user);
    
    // Get stats
    console.log('📊 Getting data statistics...');
    const stats = await api.getDataStats();
    console.log('✅ Statistics:', {
      totalRecords: stats.totalRecords,
      dateRange: stats.dateRange,
      provinces: stats.provinces.length
    });
    
    // Get categorized data
    console.log('📄 Getting categorized data...');
    const categorizedData = await api.getCategorizedData();
    console.log('✅ Categorized data:', {
      totalProcedimientos: categorizedData.totalRecords,
      firstRecord: categorizedData.procedimientos[0] ? {
        ID_OPERATIVO: categorizedData.procedimientos[0].ID_OPERATIVO,
        FECHA: categorizedData.procedimientos[0].FECHA,
        PROVINCIA: categorizedData.procedimientos[0].PROVINCIA,
        LATITUD: categorizedData.procedimientos[0].LATITUD,
        LONGITUD: categorizedData.procedimientos[0].LONGITUD
      } : 'No data'
    });
    
    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();