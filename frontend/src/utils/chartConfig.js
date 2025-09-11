/**
 * Configuración estándar para gráficos Chart.js
 * Centraliza opciones comunes para mantener consistencia visual
 */

// Paleta de colores estándar
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  quinary: '#8B5CF6',
  senary: '#06B6D4',
  septenary: '#F97316',
  octonary: '#84CC16',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
};

// Configuración estándar para leyendas
export const LEGEND_CONFIG = {
  display: true,
  position: 'top',
  align: 'center',
  labels: {
    color: CHART_COLORS.gray[700], // #374151
    font: {
      size: 12,
      family: 'Inter, system-ui, -apple-system, sans-serif'
    },
    padding: 20,
    usePointStyle: true,
    pointStyle: 'circle'
  }
};

// Configuración estándar para tooltips
export const TOOLTIP_CONFIG = {
  enabled: true,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  titleColor: CHART_COLORS.gray[800],
  bodyColor: CHART_COLORS.gray[700],
  borderColor: CHART_COLORS.gray[200],
  borderWidth: 1,
  cornerRadius: 8,
  displayColors: true,
  titleFont: {
    size: 13,
    weight: '600',
    family: 'Inter, system-ui, -apple-system, sans-serif'
  },
  bodyFont: {
    size: 12,
    family: 'Inter, system-ui, -apple-system, sans-serif'
  },
  padding: 12,
  caretPadding: 8,
  boxPadding: 4
};

// Configuración estándar para escalas
export const SCALE_CONFIG = {
  x: {
    grid: {
      color: CHART_COLORS.gray[200],
      lineWidth: 1
    },
    ticks: {
      color: CHART_COLORS.gray[600],
      font: {
        size: 11,
        family: 'Inter, system-ui, -apple-system, sans-serif'
      }
    }
  },
  y: {
    grid: {
      color: CHART_COLORS.gray[200],
      lineWidth: 1
    },
    ticks: {
      color: CHART_COLORS.gray[600],
      font: {
        size: 11,
        family: 'Inter, system-ui, -apple-system, sans-serif'
      }
    },
    beginAtZero: true
  }
};

// Configuración base para gráficos
export const BASE_CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: LEGEND_CONFIG,
    tooltip: TOOLTIP_CONFIG
  },
  scales: SCALE_CONFIG,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2
    },
    line: {
      borderWidth: 2,
      tension: 0.1
    },
    bar: {
      borderWidth: 0,
      borderRadius: 4
    }
  }
};

// Función para obtener configuración específica por tipo de gráfico
export const getChartConfig = (type = 'default', customConfig = {}) => {
  const baseConfig = { ...BASE_CHART_CONFIG };
  
  // Configuraciones específicas por tipo
  switch (type) {
    case 'line':
      return {
        ...baseConfig,
        elements: {
          ...baseConfig.elements,
          point: {
            ...baseConfig.elements.point,
            radius: 3,
            hoverRadius: 5
          }
        },
        ...customConfig
      };
      
    case 'bar':
      return {
        ...baseConfig,
        elements: {
          ...baseConfig.elements,
          bar: {
            ...baseConfig.elements.bar,
            borderRadius: 6
          }
        },
        ...customConfig
      };
      
    case 'doughnut':
    case 'pie':
      return {
        ...baseConfig,
        cutout: type === 'doughnut' ? '60%' : '0%',
        plugins: {
          ...baseConfig.plugins,
          legend: {
            ...LEGEND_CONFIG,
            position: 'bottom'
          }
        },
        ...customConfig
      };
      
    default:
      return {
        ...baseConfig,
        ...customConfig
      };
  }
};

// Función para generar paleta de colores automática
export const generateColorPalette = (count) => {
  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.tertiary,
    CHART_COLORS.quaternary,
    CHART_COLORS.quinary,
    CHART_COLORS.senary,
    CHART_COLORS.septenary,
    CHART_COLORS.octonary
  ];
  
  // Si necesitamos más colores de los disponibles, generamos variaciones
  if (count > colors.length) {
    const additional = [];
    for (let i = 0; i < count - colors.length; i++) {
      const baseColor = colors[i % colors.length];
      const opacity = 0.7 - (i * 0.1);
      additional.push(baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
    }
    return [...colors, ...additional];
  }
  
  return colors.slice(0, count);
};

// Función para crear dataset con configuración estándar
export const createDataset = (label, data, options = {}) => {
  const defaultOptions = {
    backgroundColor: CHART_COLORS.primary,
    borderColor: CHART_COLORS.primary,
    borderWidth: 2,
    fill: false
  };
  
  return {
    label,
    data,
    ...defaultOptions,
    ...options
  };
};