// Test Categories and Georeference
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
    
    return await response.json();
  }

  categorizeData(data) {
    const categories = {
      procedimientos: data, // All data goes to procedures
      detenidos: data.filter(item => {
        const desc = (item.DESCRIPCIÓN || item.descripcion || '').toLowerCase();
        const tipo = (item.TIPO_INTERVENCION || item.tipo_intervencion || '').toLowerCase();
        return desc.includes('detención') || desc.includes('detenido') ||
               desc.includes('arresto') || desc.includes('aprehendido') ||
               tipo.includes('detención') || tipo.includes('detenido');
      }),
      incautaciones: data.filter(item => {
        const desc = (item.DESCRIPCIÓN || item.descripcion || '').toLowerCase();
        const tipo = (item.TIPO_INTERVENCION || item.tipo_intervencion || '').toLowerCase();
        return desc.includes('incautación') || desc.includes('secuestro') ||
               desc.includes('decomiso') || desc.includes('droga') ||
               desc.includes('arma') || tipo.includes('incautación');
      }),
      controlados: data.filter(item => {
        const desc = (item.DESCRIPCIÓN || item.descripcion || '').toLowerCase();
        const tipo = (item.TIPO_INTERVENCION || item.tipo_intervencion || '').toLowerCase();
        return desc.includes('control') || tipo.includes('control') ||
               desc.includes('controlado') || desc.includes('verificación') ||
               desc.includes('despliegue');
      }),
      afectados: data.filter(item => {
        const desc = (item.DESCRIPCIÓN || item.descripcion || '').toLowerCase();
        const tipo = (item.TIPO_INTERVENCION || item.tipo_intervencion || '').toLowerCase();
        return desc.includes('afectado') || desc.includes('víctima') ||
               desc.includes('herido') || tipo.includes('afectado');
      }),
      trata: data.filter(item => {
        const desc = (item.DESCRIPCIÓN || item.descripcion || '').toLowerCase();
        const tipo = (item.TIPO_INTERVENCION || item.tipo_intervencion || '').toLowerCase();
        return desc.includes('trata') || desc.includes('tráfico') ||
               desc.includes('explotación') || tipo.includes('trata');
      }),
      abatidos: data.filter(item => {
        const desc = (item.DESCRIPCIÓN || item.descripcion || '').toLowerCase();
        const tipo = (item.TIPO_INTERVENCION || item.tipo_intervencion || '').toLowerCase();
        return desc.includes('abatido') || desc.includes('enfrentamiento') ||
               desc.includes('tiroteo') || tipo.includes('abatido');
      })
    };
    return categories;
  }
}

async function testCategoriesAndGeoreference() {
  console.log('🔍 Testing Categories and Georeference...');
  
  const api = new ApiService();
  
  try {
    // Login
    console.log('🔑 Logging in...');
    await api.login('admin', 'admin123');
    
    // Get all data
    console.log('📄 Getting all data...');
    const allData = await api.request('/data');
    console.log(`✅ Loaded ${allData.length} records`);
    
    // Categorize data
    console.log('🏷️ Categorizing data...');
    const categories = api.categorizeData(allData);
    
    // Check each category
    const categoryNames = Object.keys(categories);
    for (const categoryName of categoryNames) {
      const categoryData = categories[categoryName];
      
      // Count records with valid coordinates
      const withCoordinates = categoryData.filter(item => 
        item.LATITUD && item.LONGITUD && 
        parseFloat(item.LATITUD) !== 0 && parseFloat(item.LONGITUD) !== 0
      );
      
      const geoPercentage = categoryData.length > 0 
        ? ((withCoordinates.length / categoryData.length) * 100).toFixed(1)
        : '0';
      
      console.log(`📍 ${categoryName.toUpperCase()}:`);
      console.log(`   Total: ${categoryData.length} registros`);
      console.log(`   Con georeferencia: ${withCoordinates.length} (${geoPercentage}%)`);
      
      if (withCoordinates.length > 0) {
        const sample = withCoordinates[0];
        console.log(`   Ejemplo: ${sample.PROVINCIA} (${sample.LATITUD}, ${sample.LONGITUD})`);
      }
      console.log('');
    }
    
    // Overall georeference statistics
    const totalWithCoords = allData.filter(item => 
      item.LATITUD && item.LONGITUD && 
      parseFloat(item.LATITUD) !== 0 && parseFloat(item.LONGITUD) !== 0
    );
    
    const overallGeoPercentage = ((totalWithCoords.length / allData.length) * 100).toFixed(1);
    
    console.log('🌍 RESUMEN GENERAL:');
    console.log(`   Total de registros: ${allData.length}`);
    console.log(`   Con georeferencia válida: ${totalWithCoords.length} (${overallGeoPercentage}%)`);
    
    // Province distribution
    const provinceCount = new Set(allData.map(item => item.PROVINCIA).filter(p => p)).size;
    console.log(`   Provincias cubiertas: ${provinceCount}`);
    
    // Date range
    const dates = allData.map(item => item.FECHA_ISO || item.FECHA).filter(d => d).sort();
    const dateRange = dates.length > 0 ? `${dates[0]} - ${dates[dates.length - 1]}` : 'No dates';
    console.log(`   Rango de fechas: ${dateRange}`);
    
    console.log('🎉 Verification complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCategoriesAndGeoreference();