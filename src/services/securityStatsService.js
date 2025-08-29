// Servicio para generar datos de muestra de estadísticas de seguridad
// Esta será reemplazada con datos reales en el futuro

// Provincias del Ecuador (muestra)
const PROVINCES = [
  'Pichincha', 'Guayas', 'Azuay', 'Tungurahua', 'Manabí',
  'Los Ríos', 'El Oro', 'Esmeraldas', 'Imbabura', 'Santo Domingo'
];

// Generar datos aleatorios para gráficos por provincia
const generateProvinceData = (category) => {
  const data = {};
  
  // Asegurar que siempre haya al menos algunas provincias con datos
  const activeProvinces = [...PROVINCES];
  const numActive = Math.max(3, Math.floor(Math.random() * PROVINCES.length)); // Mínimo 3 provincias activas
  
  // Mezclar las provincias y tomar solo las activas
  const shuffledProvinces = [...PROVINCES]
    .sort(() => 0.5 - Math.random())
    .slice(0, numActive);

  shuffledProvinces.forEach(province => {
    // Generar números aleatorios apropiados para cada categoría
    let value;
    switch (category) {
      case 'controlados':
        value = Math.floor(Math.random() * 200) + 50; // 50-250
        break;
      case 'detenidos':
        value = Math.floor(Math.random() * 50) + 10; // 10-60
        break;
      case 'incautaciones':
        value = Math.floor(Math.random() * 100) + 20; // 20-120
        break;
      case 'afectados':
        value = Math.floor(Math.random() * 80) + 15; // 15-95
        break;
      case 'abatidos':
        value = Math.floor(Math.random() * 10) + 1; // 1-11
        break;
      default:
        value = Math.floor(Math.random() * 100) + 10;
    }
    data[province] = value > 0 ? value : 0; // Asegurar que no haya valores negativos
  });
  
  return data;
};

// Generar datos de tendencia temporal (últimos 12 meses)
const generateTrendData = (category) => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  // Valores base por categoría
  const baseValues = {
    controlados: { min: 800, range: 400 },
    detenidos: { min: 150, range: 100 },
    incautaciones: { min: 300, range: 200 },
    afectados: { min: 200, range: 150 },
    abatidos: { min: 20, range: 30 }
  };

  const baseConfig = baseValues[category] || { min: 100, range: 100 };
  let lastValue = baseConfig.min + Math.floor(Math.random() * baseConfig.range);

  return months.map((month, index) => {
    // Añadir variación aleatoria pero con cierta tendencia
    const variation = Math.floor(Math.random() * 20) - 10; // -10 a +10
    const trend = index * 2; // Tendencia creciente suave
    
    // Asegurar que el valor no sea negativo
    const value = Math.max(0, lastValue + variation + trend);
    lastValue = value;

    return {
      month,
      value: Math.round(value)
    };
  });
};

// Función principal para obtener estadísticas de seguridad por categoría
export const getSecurityStats = (category) => {
  // Generar datos una sola vez para mantener consistencia
  const provinceData = generateProvinceData(category);
  const trendData = generateTrendData(category);
  const total = Object.values(provinceData).reduce((sum, value) => sum + value, 0);
  const lastMonth = trendData[11]?.value || 0;

  return {
    provinceData,
    trendData,
    total,
    lastMonth,
    lastUpdated: new Date().toISOString()
  };
};

// Obtener todas las estadísticas para el resumen
export const getAllSecurityStats = () => {
  const categories = ['controlados', 'detenidos', 'incautaciones', 'afectados', 'abatidos'];
  const stats = {};

  categories.forEach(category => {
    stats[category] = getSecurityStats(category);
  });

  return stats;
};

// Configuración de colores para cada categoría
export const getCategoryConfig = (category) => {
  const configs = {
    controlados: {
      color: '#3B82F6', // blue-500
      bgColor: 'rgba(59, 130, 246, 0.1)',
      icon: '🔍',
      title: 'Controlados'
    },
    detenidos: {
      color: '#EF4444', // red-500
      bgColor: 'rgba(239, 68, 68, 0.1)',
      icon: '🚨',
      title: 'Detenidos'
    },
    incautaciones: {
      color: '#F59E0B', // amber-500
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: '📦',
      title: 'Incautaciones'
    },
    afectados: {
      color: '#8B5CF6', // violet-500
      bgColor: 'rgba(139, 92, 246, 0.1)',
      icon: '👥',
      title: 'Afectados'
    },
    abatidos: {
      color: '#DC2626', // red-600
      bgColor: 'rgba(220, 38, 38, 0.1)',
      icon: '💀',
      title: 'Abatidos'
    }
  };

  return configs[category] || configs.controlados;
};