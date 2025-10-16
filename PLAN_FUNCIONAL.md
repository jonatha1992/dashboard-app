# 🔧 PLAN DE CORRECCIÓN FUNCIONAL - Dashboard App

> **Documento generado:** 2025-10-16
> **Enfoque:** Hacer que la aplicación funcione correctamente
> **Prioridad:** Bugs funcionales > Refactoring > Seguridad
> **Tiempo estimado:** 2-3 días

---

## 🎯 OBJETIVO

**Corregir 15 problemas funcionales identificados** que impiden que la aplicación funcione correctamente, priorizando funcionalidad sobre optimización y seguridad.

---

## 📋 RESUMEN DE PROBLEMAS

| Severidad | Cantidad | Tiempo estimado |
|-----------|----------|-----------------|
| 🔴 **CRÍTICA** | 3 problemas | ~1 hora |
| 🟡 **ALTA** | 5 problemas | ~2 horas |
| 🟢 **MEDIA** | 5 problemas | ~1.5 horas |
| ⚪ **BAJA** | 2 problemas | ~30 min |
| **TOTAL** | **15 problemas** | **~5 horas** |

---

# 🔴 PRIORIDAD CRÍTICA (1 hora)

## PROBLEMA #1: Estado Global Incompleto - availableDepartments/availableUnits

### 📍 Ubicación
- **Archivo**: [frontend/src/contexts/DashboardContext.jsx:268](frontend/src/contexts/DashboardContext.jsx#L268)

### 🐛 Descripción del Bug
```javascript
// LÍNEA 268-269 - Estado nunca se popula
availableDepartments: [], // TODO: Populate this
availableUnits: [], // TODO: Populate this
```

**Impacto**: Los filtros de departamento y unidad no muestran opciones dinámicas porque los arrays están siempre vacíos.

### ✅ Solución

Agregar lógica para extraer departamentos y unidades únicos de los datos:

```javascript
// Después de cargar datos (línea ~200)
useEffect(() => {
  if (data && data.length > 0) {
    // Extraer departamentos únicos
    const departments = [...new Set(
      data
        .map(item => getDepartamentoFromItem(item))
        .filter(dept => dept && dept !== '-')
    )].sort();

    // Extraer unidades únicas
    const units = [...new Set(
      data
        .map(item => item.UNIDAD_INTERVINIENTE || item.unidad_interviniente)
        .filter(unit => unit && unit !== '-')
    )].sort();

    setAvailableDepartments(departments);
    setAvailableUnits(units);
  }
}, [data]);

// Agregar state para estos valores (línea ~60)
const [availableDepartments, setAvailableDepartments] = useState([]);
const [availableUnits, setAvailableUnits] = useState([]);
```

### 🧪 Verificación
```bash
# 1. Cargar aplicación
npm run dev

# 2. Ir a FilterPanel
# 3. Verificar que selectores de Departamento y Unidad muestran opciones
# 4. Seleccionar departamento y verificar que filtra datos
```

**Tiempo estimado: 20 minutos**

---

## PROBLEMA #2: Función refreshData Vacía

### 📍 Ubicación
- **Archivo**: [frontend/src/contexts/DashboardContext.jsx:239](frontend/src/contexts/DashboardContext.jsx#L239)

### 🐛 Descripción del Bug
```javascript
const refreshData = useCallback(async () => {
  try {
    setLoading(true);
    // Implementation of refresh logic
    // ...  ❌ VACÍO - NO HAY LÓGICA
  } catch (error) {
    console.error('Error refreshing data:', error);
    setError('Error al actualizar los datos');
  } finally {
    setLoading(false);
  }
}, []);
```

**Impacto**: El botón de refresh no hace nada cuando se presiona.

### ✅ Solución

Implementar la lógica de refresh completa:

```javascript
const refreshData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    // Intentar cargar desde API
    try {
      console.log('🔄 Refrescando datos desde API...');
      const allCategorizedData = await apiService.getCategorizedData();

      if (allCategorizedData && Object.keys(allCategorizedData).length > 0) {
        console.log('✅ Datos actualizados desde API');
        const rawData = allCategorizedData.general || [];
        setData(rawData);
        setCategorizedData(allCategorizedData);

        const stats = await apiService.getDataStats();
        setDataStats(stats);
        return;
      }
    } catch (apiError) {
      console.warn('⚠️ Error API, cargando datos locales:', apiError.message);
    }

    // Fallback a datos locales
    console.log('🔄 Cargando datos locales...');
    const localData = await loadData();

    if (localData && localData.length > 0) {
      setData(localData);

      const categorizedDataLocal = getCategorizedData(localData);
      setCategorizedData(categorizedDataLocal);

      // Crear stats básicas
      const dates = localData
        .map(item => parseDateToISO(item.FECHA))
        .filter(date => date)
        .sort();

      const provinces = [...new Set(localData
        .map(item => item.PROVINCIA)
        .filter(prov => prov && prov !== '-')
      )];

      const basicStats = {
        totalRecords: localData.length,
        dateRange: {
          earliest: dates.length > 0 ? dates[0] : null,
          latest: dates.length > 0 ? dates[dates.length - 1] : null
        },
        provinces: provinces
      };

      setDataStats(basicStats);
    }
  } catch (error) {
    console.error('❌ Error refrescando datos:', error);
    setError('Error al actualizar los datos');
  } finally {
    setLoading(false);
  }
}, []);
```

### 🧪 Verificación
```bash
# 1. Agregar botón de refresh en Dashboard:
<button onClick={refreshData}>🔄 Actualizar Datos</button>

# 2. Click en el botón
# 3. Verificar en consola que se ejecuta la carga
# 4. Verificar que datos se actualizan
```

**Tiempo estimado: 25 minutos**

---

## PROBLEMA #3: Sort Order Invertido en Tablas

### 📍 Ubicación
- **Archivo**: [frontend/src/components/views/detenidos/DetenidosTable.jsx:26](frontend/src/components/views/detenidos/DetenidosTable.jsx#L26)

### 🐛 Descripción del Bug
```javascript
// LÍNEA 26 - Lógica invertida
if (sortOrder === 'asc') {
    return aValue > bValue ? 1 : -1;  // ❌ INVERTIDO
}
return aValue < bValue ? 1 : -1;  // ❌ INVERTIDO
```

**Impacto**: Ordenamiento funciona al revés - ascendente ordena descendente y viceversa.

### ✅ Solución

Corregir la lógica de comparación:

```javascript
// CORRECTO
if (sortOrder === 'asc') {
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
}
return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
```

O más limpio:

```javascript
const compareValues = (a, b) => {
  if (a < b) return sortOrder === 'asc' ? -1 : 1;
  if (a > b) return sortOrder === 'asc' ? 1 : -1;
  return 0;
};

// Usar en sort
sorted.sort((a, b) => {
  const aValue = a[sortField];
  const bValue = b[sortField];
  return compareValues(aValue, bValue);
});
```

### 🧪 Verificación
```bash
# 1. Ir a tabla de Detenidos
# 2. Click en header "Edad" para ordenar
# 3. Verificar orden ascendente: 18, 20, 25, 30...
# 4. Click de nuevo para descendente
# 5. Verificar orden descendente: 65, 60, 55, 50...
```

**Tiempo estimado: 15 minutos**

---

# 🟡 PRIORIDAD ALTA (2 horas)

## PROBLEMA #4: Validación de Coordenadas Defectuosa

### 📍 Ubicación
- **Archivo**: [frontend/src/utils/dataUtils.js:95](frontend/src/utils/dataUtils.js#L95)

### 🐛 Descripción del Bug
```javascript
export const getCoordinatesFromItem = (item) => {
  if (!item) return null;

  const lat = item.lat || item.latitude || item.LATITUD || item.latitud;
  const lng = item.lng || item.longitude || item.long || item.LONGITUD || item.longitud;

  // ❌ No valida rangos correctos ni maneja strings
  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }

  return null;
};
```

**Impacto**: Coordenadas inválidas pueden causar errores en el mapa o mostrar ubicaciones incorrectas.

### ✅ Solución

Agregar validación robusta:

```javascript
export const getCoordinatesFromItem = (item) => {
  if (!item) return null;

  // Buscar campos de latitud
  const latCandidates = [
    item.LATITUD, item.latitud, item.latitud_decimal,
    item.lat, item.latitude, item.LAT
  ];
  const lat = latCandidates.find(val => val !== undefined && val !== null && val !== '' && val !== '-');

  // Buscar campos de longitud
  const lngCandidates = [
    item.LONGITUD, item.longitud, item.longitud_decimal,
    item.lng, item.longitude, item.long, item.LON, item.LONG
  ];
  const lng = lngCandidates.find(val => val !== undefined && val !== null && val !== '' && val !== '-');

  // Validar que existen
  if (lat === undefined || lng === undefined) return null;

  // Convertir a número
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  // Validar que son números válidos
  if (isNaN(latNum) || isNaN(lngNum)) {
    console.warn(`Coordenadas inválidas (NaN): lat=${lat}, lng=${lng}`);
    return null;
  }

  // Validar rangos geográficos
  if (latNum < -90 || latNum > 90) {
    console.warn(`Latitud fuera de rango: ${latNum}`);
    return null;
  }

  if (lngNum < -180 || lngNum > 180) {
    console.warn(`Longitud fuera de rango: ${lngNum}`);
    return null;
  }

  // Excluir (0, 0) - coordenada inválida común
  if (latNum === 0 && lngNum === 0) {
    return null;
  }

  // Validar que esté en Argentina aproximadamente
  // Argentina: lat -55 a -21, lng -73 a -53
  if (latNum < -56 || latNum > -20 || lngNum < -74 || lngNum > -52) {
    console.warn(`Coordenadas fuera de Argentina: lat=${latNum}, lng=${lngNum}`);
    // No retornar null, solo advertir - puede ser útil para testing
  }

  return {
    lat: latNum,
    lng: lngNum
  };
};
```

### 🧪 Verificación
```javascript
// Test cases
console.assert(getCoordinatesFromItem({ LATITUD: '-34.6037', LONGITUD: '-58.3816' }) !== null, 'Buenos Aires');
console.assert(getCoordinatesFromItem({ LATITUD: 0, LONGITUD: 0 }) === null, 'Origin invalid');
console.assert(getCoordinatesFromItem({ LATITUD: 'invalid', LONGITUD: '-58' }) === null, 'Invalid lat');
console.assert(getCoordinatesFromItem({ LATITUD: 91, LONGITUD: -58 }) === null, 'Lat out of range');
```

**Tiempo estimado: 30 minutos**

---

## PROBLEMA #5: Date Filtering con Null Values

### 📍 Ubicación
- **Archivo**: [frontend/src/contexts/DashboardContext.jsx:84](frontend/src/contexts/DashboardContext.jsx#L84)

### 🐛 Descripción del Bug
```javascript
const itemISO = parseDateToISO(item.FECHA);
// ❌ Si itemISO es null, comparación es impredecible
if (filters.fromDate && itemISO < filters.fromDate) return false;
if (filters.toDate && itemISO > filters.toDate) return false;
```

**Impacto**: Registros sin fecha válida pueden filtrarse incorrectamente.

### ✅ Solución

Validar fecha antes de comparar:

```javascript
// Date filtering con validación explícita
const itemISO = parseDateToISO(item.FECHA);

// Si no tiene fecha válida, decidir comportamiento
if (!itemISO) {
  // Opción 1: Excluir items sin fecha cuando hay filtro de fecha
  if (filters.fromDate || filters.toDate) {
    return false; // No mostrar si estamos filtrando por fecha
  }
  // Si no hay filtro de fecha, incluir el item
}

// Comparar solo si fecha es válida
if (itemISO) {
  if (filters.fromDate && itemISO < filters.fromDate) return false;
  if (filters.toDate && itemISO > filters.toDate) return false;
}
```

### 🧪 Verificación
```bash
# 1. Cargar datos con registros sin fecha
# 2. No aplicar filtro de fecha - verificar que se muestran todos
# 3. Aplicar filtro "desde 01/01/2025"
# 4. Verificar que registros sin fecha NO se muestran
```

**Tiempo estimado: 20 minutos**

---

## PROBLEMA #6: Optional Chaining en Análisis

### 📍 Ubicación
- **Archivo**: [frontend/src/components/views/procedimientos/ProcedimientosCharts.jsx:38](frontend/src/components/views/procedimientos/ProcedimientosCharts.jsx#L38)

### 🐛 Descripción del Bug
```javascript
// ❌ Si analysis es null, falla antes del ||
labels: analysis.tiposProcedimientos?.slice(0, 8).map(item => item.tipo) || [],
```

**Impacto**: Error de runtime si `analysis` es null/undefined.

### ✅ Solución

Usar optional chaining correctamente:

```javascript
// CORRECTO - validar analysis primero
labels: analysis?.tiposProcedimientos?.slice(0, 8)?.map(item => item.tipo) || [],

// O mejor, con guard clause
const getTiposProcedimientosLabels = (analysis) => {
  if (!analysis?.tiposProcedimientos) return [];
  return analysis.tiposProcedimientos
    .slice(0, 8)
    .map(item => item?.tipo || 'Sin tipo')
    .filter(Boolean);
};

// Uso
labels: getTiposProcedimientosLabels(analysis),
```

### 🧪 Verificación
```javascript
// Test con diferentes inputs
getTiposProcedimientosLabels(null); // []
getTiposProcedimientosLabels({}); // []
getTiposProcedimientosLabels({ tiposProcedimientos: null }); // []
getTiposProcedimientosLabels({ tiposProcedimientos: [{ tipo: 'A' }] }); // ['A']
```

**Tiempo estimado: 25 minutos**

---

## PROBLEMA #7: API Fallback Incorrecto

### 📍 Ubicación
- **Archivo**: [frontend/src/services/apiService.js:218](frontend/src/services/apiService.js#L218)

### 🐛 Descripción del Bug
```javascript
// ❌ 'general' es tabla maestra, no procedimientos
procedimientos: general || [],
```

**Impacto**: Datos incorrectamente categorizados - confusión en el estado.

### ✅ Solución

Corregir el fallback para usar datos correctos:

```javascript
// En getCategorizedData()
try {
  const response = await this.get('/data/categorized');
  return response;
} catch (error) {
  console.warn('Error obteniendo datos categorizados, usando fallback');

  // Opción 1: Categorizar localmente desde general
  const general = await this.get('/data').catch(() => []);
  if (general && general.length > 0) {
    return {
      general: general,
      detenidos: general.filter(item => isDetenido(item)),
      incautaciones: general.filter(item => isIncautacion(item)),
      // ... resto de categorías
    };
  }

  // Opción 2: Retornar estructura vacía correcta
  return {
    general: [],
    detenidos: [],
    incautaciones: [],
    abatidos: [],
    trata: [],
    afectados: [],
    controlados: [],
    procedimientos: []
  };
}
```

### 🧪 Verificación
```bash
# 1. Simular error API (desconectar backend)
# 2. Verificar que fallback retorna estructura correcta
# 3. Verificar que cada categoría tiene array (no undefined)
```

**Tiempo estimado: 20 minutos**

---

## PROBLEMA #8: Backend Date ISO Error

### 📍 Ubicación
- **Archivo**: [backend/dashboard_api/views.py:1499](backend/dashboard_api/views.py#L1499)

### 🐛 Descripción del Bug
```python
# ❌ Si fecha_iso es string, .isoformat() falla
'FECHA_ISO': procedimiento.fecha_iso.isoformat() if procedimiento.fecha_iso else None,
```

**Impacto**: API puede lanzar error 500 si fecha_iso no es date object.

### ✅ Solución

Validar tipo antes de llamar isoformat():

```python
# En views.py línea 1499
def get_fecha_iso_formatted(fecha_iso):
    """Convertir fecha_iso a string ISO de forma segura"""
    if not fecha_iso:
        return None

    # Si ya es string, retornar directamente
    if isinstance(fecha_iso, str):
        return fecha_iso

    # Si es date/datetime, usar isoformat()
    if hasattr(fecha_iso, 'isoformat'):
        return fecha_iso.isoformat()

    # Fallback: convertir a string
    return str(fecha_iso)

# Uso
'FECHA_ISO': get_fecha_iso_formatted(procedimiento.fecha_iso),
```

### 🧪 Verificación
```bash
# Test en Django shell
python manage.py shell

from dashboard_api.models import GeografiaProcedimiento
from datetime import date

proc = GeografiaProcedimiento.objects.first()
print(get_fecha_iso_formatted(proc.fecha_iso))  # No debe fallar
```

**Tiempo estimado: 25 minutos**

---

# 🟢 PRIORIDAD MEDIA (1.5 horas)

## PROBLEMA #9: Key Prop en Pagination

### 📍 Ubicación
- **Archivo**: [frontend/src/components/views/detenidos/DetenidosTable.jsx:179](frontend/src/components/views/detenidos/DetenidosTable.jsx#L179)

### 🐛 Descripción del Bug
```javascript
{[...Array(Math.min(5, totalPages))].map((_, i) => {
    let pageNum;
    // ... lógica compleja
    return (
        <button key={pageNum}...  // ❌ pageNum puede ser undefined
```

**Impacto**: Warnings en consola sobre keys duplicadas o undefined.

### ✅ Solución

Garantizar key único siempre:

```javascript
{[...Array(Math.min(5, totalPages))].map((_, i) => {
    let pageNum;

    if (currentPage <= 3) {
        pageNum = i + 1;
    } else if (currentPage >= totalPages - 2) {
        pageNum = totalPages - 4 + i;
    } else {
        pageNum = currentPage - 2 + i;
    }

    // Asegurar que pageNum es válido
    if (!pageNum || pageNum < 1 || pageNum > totalPages) {
        return null;
    }

    return (
        <button
            key={`page-${pageNum}`}  // ✅ Key único y descriptivo
            onClick={() => setCurrentPage(pageNum)}
            className={currentPage === pageNum ? 'active' : ''}
        >
            {pageNum}
        </button>
    );
}).filter(Boolean)}  {/* Filtrar nulls */}
```

### 🧪 Verificación
```bash
# 1. Abrir consola del navegador
# 2. Ir a tabla con paginación
# 3. Verificar que NO hay warnings sobre keys
# 4. Navegar entre páginas
# 5. Verificar funcionamiento correcto
```

**Tiempo estimado: 20 minutos**

---

## PROBLEMA #10: Logging Inconsistente en Data Service

### 📍 Ubicación
- **Archivo**: [frontend/src/services/dataService.js:104](frontend/src/services/dataService.js#L104)

### 🐛 Descripción del Bug
```javascript
// ❌ Log aleatorio - dificulta diagnóstico
if (!tieneDataMinima && Math.random() < 0.01) {
    console.log(`❌ Registro ${index} excluido...`);
}
```

**Impacto**: No se registran todos los rechazos, diagnóstico incompleto.

### ✅ Solución

Logging consistente con contador:

```javascript
// Al inicio de processJsonData
let stats = {
  processed: 0,
  excluded: 0,
  reasons: {}
};

// Al procesar cada item
data.forEach((item, index) => {
  stats.processed++;

  const tieneDataMinima = /* validación */;

  if (!tieneDataMinima) {
    stats.excluded++;
    const reason = 'Sin datos mínimos';
    stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;

    // Log solo en modo debug
    if (window.DEBUG_MODE) {
      console.log(`❌ Registro ${index} excluido: ${reason}`);
    }
    return;
  }

  processedData.push(item);
});

// Al final, log de resumen siempre
console.log(`
📊 Procesamiento completado:
  - Total procesados: ${stats.processed}
  - Aceptados: ${stats.processed - stats.excluded}
  - Excluidos: ${stats.excluded}
  - Razones: ${JSON.stringify(stats.reasons, null, 2)}
`);
```

### 🧪 Verificación
```bash
# 1. Cargar datos
# 2. Ver consola - debe mostrar resumen de procesamiento
# 3. Activar DEBUG_MODE para ver detalles
# window.DEBUG_MODE = true
```

**Tiempo estimado: 15 minutos**

---

## PROBLEMA #11: Map Component Access Unsafe

### 📍 Ubicación
- **Archivo**: [frontend/src/components/map/MapComponent.jsx:293](frontend/src/components/map/MapComponent.jsx#L293)

### 🐛 Descripción del Bug
```javascript
// ❌ No valida si data es array
provinciasUnicas: [...new Set(data.map(item => item.PROVINCIA))].filter(Boolean)
```

**Impacto**: Falla si `data` es null o no es array.

### ✅ Solución

Validar antes de usar:

```javascript
// Guard clause al inicio de función/useEffect
const getProvinciasUnicas = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  return [...new Set(
    data
      .map(item => item?.PROVINCIA)
      .filter(prov => prov && prov !== '-' && prov !== '')
  )].sort();
};

// Uso
const provinciasUnicas = getProvinciasUnicas(data);
```

### 🧪 Verificación
```javascript
// Tests
console.assert(getProvinciasUnicas(null).length === 0, 'null');
console.assert(getProvinciasUnicas([]).length === 0, 'empty array');
console.assert(getProvinciasUnicas([{ PROVINCIA: 'BA' }]).length === 1, 'valid');
```

**Tiempo estimado: 15 minutos**

---

## PROBLEMA #12: Clasificaciones No Mutuamente Excluyentes

### 📍 Ubicación
- **Archivo**: [frontend/src/services/dataService.js:286](frontend/src/services/dataService.js#L286)

### 🐛 Descripción del Bug
```javascript
// ❌ Múltiples clasificaciones pueden ser true
const detenido = isDetenido(item);
const incautacion = isIncautacion(item);
// ... si ambos son true, ¿qué categoría?
```

**Impacto**: Registros pueden clasificarse en múltiples categorías causando inconsistencias.

### ✅ Solución

Implementar jerarquía estricta:

```javascript
const categorizeItem = (item) => {
  // Jerarquía de prioridad explícita
  if (isDetenido(item)) return 'detenidos';
  if (isIncautacion(item)) return 'incautaciones';
  if (isAbatido(item)) return 'abatidos';
  if (isTrata(item)) return 'trata';
  if (isAfectado(item)) return 'afectados';
  if (isControlado(item)) return 'controlados';

  // Default
  return 'procedimientos';
};

// Usar en getCategorizedData
export const getCategorizedData = (data) => {
  const categorized = {
    detenidos: [],
    incautaciones: [],
    abatidos: [],
    trata: [],
    afectados: [],
    controlados: [],
    procedimientos: []
  };

  data.forEach(item => {
    const category = categorizeItem(item);
    categorized[category].push(item);
  });

  return categorized;
};
```

### 🧪 Verificación
```javascript
// Test que suma de categorías = total
const categorized = getCategorizedData(allData);
const sum = Object.values(categorized).reduce((acc, arr) => acc + arr.length, 0);
console.assert(sum === allData.length, 'All items categorized exactly once');
```

**Tiempo estimado: 25 minutos**

---

## PROBLEMA #13: Pagination Bounds Check

### 📍 Ubicación
- **Archivo**: [frontend/src/components/views/detenidos/DetenidosTable.jsx:179](frontend/src/components/views/detenidos/DetenidosTable.jsx#L179)

### 🐛 Descripción del Bug
```javascript
// ❌ Si totalPages es 0, genera error
{[...Array(Math.min(5, totalPages))].map((_, i) => {
```

**Impacto**: Error si no hay datos para paginar.

### ✅ Solución

Validar antes de generar paginación:

```javascript
// Pagination component con validación
const renderPagination = () => {
  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay 1 página
  }

  const maxButtons = Math.min(5, totalPages);

  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(1)}
      >
        Primera
      </button>

      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Anterior
      </button>

      {[...Array(maxButtons)].map((_, i) => {
        let pageNum = calculatePageNumber(i, currentPage, totalPages);

        return (
          <button
            key={`page-${pageNum}`}
            onClick={() => setCurrentPage(pageNum)}
            className={currentPage === pageNum ? 'active' : ''}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Siguiente
      </button>

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(totalPages)}
      >
        Última
      </button>
    </div>
  );
};
```

### 🧪 Verificación
```bash
# 1. Filtrar datos para que quede 1 página
# 2. Verificar que no se muestra paginación
# 3. Filtrar para 0 resultados
# 4. Verificar que no hay error
```

**Tiempo estimado: 20 minutos**

---

# ⚪ PRIORIDAD BAJA (30 minutos)

## PROBLEMA #14: UI Inconsistencia - Abatidos No Visible

### 📍 Ubicación
- **Archivo**: [frontend/src/components/views/main/MainDashboard.jsx:60](frontend/src/components/views/main/MainDashboard.jsx#L60)

### 🐛 Descripción del Bug
La categoría "Abatidos" existe en el menú pero no se muestra en el dashboard principal.

### ✅ Solución

Agregar card de Abatidos al dashboard principal:

```javascript
// En MainDashboard.jsx
const classifications = [
  {
    category: 'detenidos',
    title: 'Detenidos',
    icon: <PersonIcon />
  },
  {
    category: 'incautaciones',
    title: 'Incautaciones',
    icon: <InventoryIcon />
  },
  {
    category: 'abatidos',  // ✅ Agregar
    title: 'Abatidos',
    icon: <DangerousIcon />
  },
  {
    category: 'trata',
    title: 'Trata de Personas',
    icon: <GavelIcon />
  },
  // ... resto
];
```

**Tiempo estimado: 10 minutos**

---

## PROBLEMA #15: Print en Código de Producción

### 📍 Ubicación
- **Archivo**: [backend/dashboard_api/views.py](backend/dashboard_api/views.py) (varios lugares)

### 🐛 Descripción del Bug
```python
# ❌ print() en lugar de logger
print(f"Error creando datos especializados: {e}")
```

### ✅ Solución

Reemplazar todos los prints por logger:

```python
# Buscar y reemplazar
import logging
logger = logging.getLogger(__name__)

# ANTES
print(f"Error: {e}")

# DESPUÉS
logger.error(f"Error: {e}", exc_info=True)

# ANTES
print(f"Procesando sheet: {sheet_name}")

# DESPUÉS
logger.info(f"Procesando sheet: {sheet_name}")
```

```bash
# Script de reemplazo automático
cd backend
grep -r "print(" dashboard_api/views.py

# Reemplazar manualmente o con sed
```

**Tiempo estimado: 20 minutos**

---

# 📊 PLAN DE EJECUCIÓN

## Día 1: Problemas Críticos y Altos (3 horas)

### Mañana (2 horas)
- ✅ [20 min] Problema #1: availableDepartments/Units
- ✅ [25 min] Problema #2: refreshData vacío
- ✅ [15 min] Problema #3: Sort order invertido
- ✅ [30 min] Problema #4: Validación coordenadas
- ✅ [30 min] Problema #5: Date filtering null

### Tarde (1 hora)
- ✅ [25 min] Problema #6: Optional chaining
- ✅ [20 min] Problema #7: API fallback
- ✅ [25 min] Problema #8: Backend date ISO

**Testing al final del día:** Verificar que todos los problemas críticos y altos están resueltos

---

## Día 2: Problemas Medios (1.5 horas)

### Mañana (1.5 horas)
- ✅ [20 min] Problema #9: Key prop pagination
- ✅ [15 min] Problema #10: Logging inconsistente
- ✅ [15 min] Problema #11: Map access unsafe
- ✅ [25 min] Problema #12: Clasificaciones no excluyentes
- ✅ [20 min] Problema #13: Pagination bounds

**Testing al final:** Verificar integridad de datos y UI

---

## Día 2: Problemas Bajos (30 minutos)

### Tarde (30 min)
- ✅ [10 min] Problema #14: UI Abatidos
- ✅ [20 min] Problema #15: Prints en producción

**Testing final:** Smoke test completo de la aplicación

---

# ✅ CHECKLIST DE VERIFICACIÓN

## Frontend
- [ ] Filtros funcionan correctamente (provincia, departamento, unidad, fecha)
- [ ] Refresh data actualiza información
- [ ] Tablas ordenan correctamente (asc/desc)
- [ ] Mapas muestran marcadores válidos
- [ ] No hay warnings en consola
- [ ] Paginación funciona en todos los escenarios
- [ ] Todas las categorías visibles en dashboard

## Backend
- [ ] API retorna datos correctos
- [ ] Fechas se serializan correctamente
- [ ] No hay prints, solo logger
- [ ] Sin errores 500 en endpoints

## Integración
- [ ] Filtros frontend se sincronizan con datos
- [ ] Categorización consistente
- [ ] Refresh funciona con API y fallback
- [ ] Loading states correctos

---

# 🚀 COMANDOS ÚTILES

```bash
# Frontend
cd frontend
npm run dev          # Desarrollo
npm run lint         # Linting
npm run build        # Build producción

# Backend
cd backend
python manage.py runserver
python manage.py shell  # Testing manual

# Testing completo
cd frontend && npm run lint && npm run build
cd ../backend && python manage.py check

# Git workflow
git checkout -b fix/functional-issues
git add .
git commit -m "fix: corregir 15 problemas funcionales identificados

- Estado global incompleto (availableDepartments/Units)
- Función refreshData implementada
- Sort order corregido en tablas
- Validación de coordenadas robusta
- Date filtering con null handling
- Optional chaining correcto en análisis
- API fallback corregido
- Backend date ISO error fixed
- Key props en pagination
- Logging consistente
- Map access con validación
- Clasificaciones mutuamente excluyentes
- Pagination bounds check
- UI Abatidos visible
- Prints reemplazados por logger

Refs: PLAN_FUNCIONAL.md"
```

---

**Siguiente paso después de este plan:**
Una vez la aplicación funcione correctamente, proceder con:
1. Refactoring (PLAN_DE_MEJORAS.md Fase 3)
2. Testing (PLAN_DE_MEJORAS.md Fase 4)
3. Seguridad (PLAN_DE_MEJORAS.md Fase 1)

**Documento creado por:** Claude Code
**Fecha:** 2025-10-16
**Tiempo estimado:** 2-3 días (5 horas efectivas)
**Estado:** 🟢 Ready to Execute
