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
  PROVINCES.forEach(province => {
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
    data[province] = value;
  });
  return data;
};

// Generar datos de tendencia temporal (últimos 12 meses)
const generateTrendData = (category) => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const data = months.map((month, index) => {
    let baseValue;
    switch (category) {
      case 'controlados':
        baseValue = 800 + Math.floor(Math.random() * 400); // 800-1200
        break;
      case 'detenidos':
        baseValue = 150 + Math.floor(Math.random() * 100); // 150-250
        break;
      case 'incautaciones':
        baseValue = 300 + Math.floor(Math.random() * 200); // 300-500
        break;
      case 'afectados':
        baseValue = 200 + Math.floor(Math.random() * 150); // 200-350
        break;
      case 'abatidos':
        baseValue = 20 + Math.floor(Math.random() * 30); // 20-50
        break;
      default:
        baseValue = 100 + Math.floor(Math.random() * 100);
    }

    // Añadir algo de tendencia
    const trend = Math.floor(index * 2);
    return {
      month,
      value: baseValue + trend
    };
  });

  return data;
};

// Función principal para obtener estadísticas de seguridad por categoría
export const getSecurityStats = (category) => {
  return {
    provinceData: generateProvinceData(category),
    trendData: generateTrendData(category),
    total: Object.values(generateProvinceData(category)).reduce((sum, value) => sum + value, 0),
    lastMonth: generateTrendData(category)[11].value // Datos recientes
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