// Servicio para generar datos de muestra de estadísticas de seguridad
// Por defecto este módulo genera datos aleatorios solo como respaldo.
// No debe usarse si hay datos reales disponibles: los consumidores
// deberían preferir las estadísticas calculadas a partir de `dataService`.

// Provincias del Ecuador (muestra)
const PROVINCES = [
  'Pichincha', 'Guayas', 'Azuay', 'Tungurahua', 'Manabí',
  'Los Ríos', 'El Oro', 'Esmeraldas', 'Imbabura', 'Santo Domingo'
];

// Demo data generators removed to avoid unused-code warnings. If demo generators
// are required in the future, reintroduce them and export explicitly.

// Función principal para obtener estadísticas de seguridad por categoría
// Por defecto no devolvemos datos demo automáticamente.
// Si en algún lugar queremos generar demo explícitamente, usar generateProvinceData / generateTrendData.
// Intentionally do NOT return demo data automatically.
// Consumers must compute stats from real data via `dataService`.
export const getSecurityStats = () => null;

// Obtener todas las estadísticas para el resumen
// getAllSecurityStats kept for compatibility; returns nulls to indicate no demo data
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