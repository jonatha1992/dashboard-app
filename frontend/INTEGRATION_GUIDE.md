# 🔧 Guía de Integración - Data Warehouse Components

## ✅ Problema Resuelto

**Error Original**: 
```
Uncaught SyntaxError: The requested module '/src/services/apiService.js' does not provide an export named 'apiService'
```

**Solución Aplicada**:
- Cambiado `import { apiService } from './apiService'` → `import apiService from './apiService'`
- `apiService.js` usa `export default`, por lo tanto necesita default import

---

## 🚀 Cómo Integrar los Componentes de Análisis

### 1. **Agregar Rutas en tu Router Principal**

```jsx
// src/App.jsx o tu archivo de rutas principal
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AnalysisMain from './components/analysis/AnalysisMain';
import TimeAnalysis from './components/analysis/TimeAnalysis';
import GeographicAnalysis from './components/analysis/GeographicAnalysis';
import ComparisonDashboard from './components/analysis/ComparisonDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal del dashboard existente */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Nuevas rutas de análisis */}
        <Route path="/analysis" element={<AnalysisMain />} />
        <Route path="/analysis/temporal" element={<TimeAnalysis />} />
        <Route path="/analysis/geographic" element={<GeographicAnalysis />} />
        <Route path="/analysis/comparison" element={<ComparisonDashboard />} />
      </Routes>
    </Router>
  );
}
```

### 2. **Agregar Enlaces de Navegación**

```jsx
// En tu componente de navegación principal
<nav>
  <Link to="/" className="nav-link">
    🏠 Dashboard Principal
  </Link>
  <Link to="/analysis" className="nav-link">
    📊 Análisis Data Warehouse
  </Link>
</nav>
```

### 3. **Integrar en Dashboard Existente**

```jsx
// src/components/dashboard/Dashboard.jsx
import { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import TimeAnalysis from '../analysis/TimeAnalysis';

const Dashboard = () => {
  const { dwStatus, runETL } = useDashboard();
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div>
      {/* Tu dashboard existente */}
      
      {/* Botón para mostrar análisis DW */}
      <button 
        onClick={() => setShowAnalysis(!showAnalysis)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {showAnalysis ? 'Ocultar' : 'Mostrar'} Análisis DW
      </button>

      {/* Componente de análisis integrado */}
      {showAnalysis && (
        <div className="mt-6">
          <TimeAnalysis />
        </div>
      )}
    </div>
  );
};
```

---

## 🔄 Usar el Context del Data Warehouse

### **En cualquier componente:**

```jsx
import { useDashboard } from '../contexts/DashboardContext';

const MyComponent = () => {
  const {
    // Estado DW
    dwStatus,
    dwLoading,
    dwError,
    availableProvinces,
    availableYears,
    
    // Funciones DW
    runETL,
    loadAnalysisData,
    analysisService
  } = useDashboard();

  const handleRunETL = async () => {
    const result = await runETL();
    if (result.success) {
      console.log('ETL ejecutado exitosamente');
    }
  };

  return (
    <div>
      <button onClick={handleRunETL}>
        Ejecutar ETL
      </button>
      
      <p>Provincias disponibles: {availableProvinces.length}</p>
      <p>Estado DW: {dwStatus?.status || 'No disponible'}</p>
    </div>
  );
};
```

---

## 📡 Usar APIs Directamente

### **Ejemplo de llamadas API:**

```jsx
import { analysisService } from '../services/analysisService';

const MyAnalysisComponent = () => {
  useEffect(() => {
    const loadData = async () => {
      // Análisis temporal
      const temporalData = await analysisService.getAnalisisTemporal({
        provincia: 'buenos_aires',
        year: '2025',
        grain: 'monthly'
      });

      // Análisis geográfico
      const geoData = await analysisService.getAnalisisGeografico({
        periodo: '2025-01',
        nivel: 'provincia',
        top: 10
      });

      // Comparación
      const comparisonData = await analysisService.getComparisonAnalysis({
        provincias: ['buenos_aires', 'cordoba', 'santa_fe'],
        year: '2025',
        comparison_type: 'summary'
      });

      console.log({ temporalData, geoData, comparisonData });
    };

    loadData();
  }, []);

  return <div>Cargando análisis...</div>;
};
```

---

## 🎨 Personalizar Estilos

### **Clases CSS principales a personalizar:**

```css
/* Tabs de navegación */
.analysis-tab-active {
  @apply bg-blue-50 text-blue-700 border border-blue-200;
}

.analysis-tab-inactive {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-50;
}

/* Componentes de gráficos */
.analysis-chart-container {
  @apply h-96 mb-4 relative;
}

/* Estadísticas */
.analysis-stat-card {
  @apply bg-blue-50 p-3 rounded-lg text-center;
}
```

---

## 🔧 Configuración Backend Necesaria

### **Verificar que estos endpoints estén disponibles:**

```bash
# Probar endpoints
curl http://localhost:8000/api/dw/status/
curl http://localhost:8000/api/dw/analysis/temporal/?year=2025
curl http://localhost:8000/api/dw/provincias/
```

### **Si hay errores, ejecutar ETL:**

```bash
cd backend
python manage.py shell -c "
from dashboard_api.etl_dimensions import DimensionETLProcessor
processor = DimensionETLProcessor()
result = processor.run_full_etl()
print(result)
"
```

---

## 📊 Componentes Disponibles

| Componente | Ruta Sugerida | Descripción |
|------------|---------------|-------------|
| `AnalysisMain` | `/analysis` | Dashboard principal con pestañas |
| `TimeAnalysis` | `/analysis/temporal` | Análisis temporal por provincia |
| `GeographicAnalysis` | `/analysis/geographic` | Distribución geográfica |
| `ComparisonDashboard` | `/analysis/comparison` | Comparación multi-provincia |

---

## 🚨 Troubleshooting

### **Error: "analysisService is not defined"**
```jsx
// ✅ Correcto
import { analysisService } from '../services/analysisService';

// ❌ Incorrecto  
import analysisService from '../services/analysisService';
```

### **Error: "Cannot read property of undefined"**
```jsx
// Siempre verificar autenticación
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <div>Necesitas iniciar sesión</div>;
}
```

### **Error: "No data available"**
```jsx
// Verificar estado del DW
const { dwStatus } = useDashboard();

if (dwStatus?.status !== 'ready') {
  return <div>Data Warehouse no disponible. Ejecutar ETL.</div>;
}
```

---

## ✅ Checklist de Integración

- [ ] ✅ Rutas agregadas al router principal
- [ ] ✅ Enlaces de navegación actualizados  
- [ ] ✅ Context provider envuelve la aplicación
- [ ] ✅ Backend ejecutándose en puerto 8000
- [ ] ✅ ETL ejecutado al menos una vez
- [ ] ✅ Usuarios de prueba creados (admin/admin123)
- [ ] ✅ No hay errores de consola JavaScript

---

**🎯 ¡Los componentes de Data Warehouse están listos para integrar en tu aplicación!**

Para más ayuda, revisa:
- `frontend/src/components/analysis/` - Componentes de análisis
- `frontend/src/services/analysisService.js` - API del DW
- `frontend/src/contexts/DashboardContext.jsx` - Estado global