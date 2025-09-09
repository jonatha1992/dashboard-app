# Guía de Troubleshooting - Dashboard de Operaciones de Seguridad

## Resumen
Esta guía proporciona herramientas y metodologías para diagnosticar y resolver problemas comunes en el sistema de dashboard. El sistema incluye logging detallado y herramientas de debugging para facilitar la identificación rápida de problemas.

## 🔍 Sistema de Logging Implementado

### Logging de Consistencia de Datos
El sistema valida automáticamente la consistencia entre datasets filtrados:

```javascript
// En DashboardContext.jsx - Validación en tiempo real
const inconsistentCount = filteredData.length !== filteredCategorizedData.length;
if (inconsistentCount) {
    console.warn('⚠️ Inconsistencia detectada en datos filtrados:', {
        filteredData: filteredData.length,
        categorizedData: filteredCategorizedData.length,
        difference: Math.abs(filteredData.length - filteredCategorizedData.length),
        selectedProvinces: selectedProvinces,
        dateRange: { startDate, endDate },
        timestamp: new Date().toISOString()
    });
}
```

### Logging de Procesamiento de Provincias
Logging ocasional (1% de las veces) para monitorear el procesamiento de provincias:

```javascript
// En DashboardContext.jsx - Logging ocasional
if (Math.random() < 0.01) {
    const foundProvinces = [...new Set(processedData
        .map(item => getProvinceKeyFromItem(item))
        .filter(p => p && p !== 'UNKNOWN')
    )];
    
    console.log('🗺️ Provincias encontradas en dataset:', {
        count: foundProvinces.length,
        provinces: foundProvinces.sort(),
        timestamp: new Date().toISOString()
    });
}
```

### Logging de Coordenadas
Monitoring del procesamiento de coordenadas geográficas:

```javascript
// En procesamiento de coordenadas
if (Math.random() < 0.01) {
    const validCoordinates = processedData
        .map(item => getCoordinatesFromItem(item))
        .filter(coords => coords !== null);
    
    console.log('📍 Coordenadas procesadas:', {
        totalItems: processedData.length,
        validCoordinates: validCoordinates.length,
        percentage: ((validCoordinates.length / processedData.length) * 100).toFixed(1) + '%',
        sampleCoords: validCoordinates.slice(0, 3), // Muestra primeras 3
        timestamp: new Date().toISOString()
    });
}
```

### Logging de Categorización
Monitoreo de la distribución de categorías:

```javascript
// En CategoryCharts.jsx - Logging de debugging
if (Math.random() < 0.05) { // 5% de las veces
    const categoryStats = Object.entries(categorizedStats).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});
    
    console.log('📊 Estadísticas de categorización:', {
        totalRegistros: Object.values(categoryStats).reduce((sum, val) => sum + val, 0),
        distribución: categoryStats,
        timestamp: new Date().toISOString()
    });
}
```

## 🛠️ Problemas Comunes y Soluciones

### 1. Inconsistencia en Datos Filtrados

#### Síntomas
- Warning en consola: "⚠️ Inconsistencia detectada en datos filtrados"
- Diferencias entre conteos en tablas y gráficos
- Mapas que no coinciden con datos de tablas

#### Diagnóstico
```javascript
// Verificar en consola del navegador
console.log('Filtered Data:', filteredData.length);
console.log('Categorized Data:', filteredCategorizedData.length);
console.log('Difference:', Math.abs(filteredData.length - filteredCategorizedData.length));
```

#### Posibles Causas
1. **Filtros de provincia inconsistentes**: Datos con provincias no normalizadas
2. **Filtros de fecha mal aplicados**: Fechas en formatos no reconocidos
3. **Categorización fallida**: Items que no se categorizan correctamente

#### Soluciones
```javascript
// 1. Verificar normalización de provincias
const problematicProvinces = data.filter(item => {
    const provincia = getProvinceKeyFromItem(item);
    return provincia === 'UNKNOWN' && item.PROVINCIA; // Tiene provincia pero no se normaliza
});

// 2. Verificar parsing de fechas
const problematicDates = data.filter(item => {
    const fecha = parseDateToISO(item.FECHA);
    return !fecha && item.FECHA && item.FECHA !== '-';
});

// 3. Forzar recategorización
const recategorizedData = getCategorizedData(filteredData);
```

### 2. Problemas de Mapas No Actualizados

#### Síntomas
- Marcadores del mapa no cambian al aplicar filtros
- Mapas muestran datos antiguos
- Console warning sobre React.memo

#### Diagnóstico
```javascript
// Verificar en MapComponent
console.log('Map data received:', data?.length);
console.log('Valid coordinates:', data?.filter(item => 
    getCoordinatesFromItem(item) !== null
).length);
```

#### Solución Implementada
- **Eliminado React.memo**: Permite re-renderización completa del componente
- **Key única**: Forzar re-mount cuando cambian los datos filtrados
```javascript
<MapComponent 
    key={`map-${filteredData.length}-${selectedProvinces.join(',')}`}
    data={filteredData}
/>
```

### 3. Pérdida de Datos en Filtros

#### Síntomas
- Reducción drástica de registros (ej: 1257 → 812)
- Datos válidos no aparecen en resultados filtrados
- Warning sobre registros excluidos

#### Diagnóstico
```javascript
// Analizar filtros aplicados
const originalCount = allData.length;
const afterProvinceFilter = allData.filter(item => 
    selectedProvinces.length === 0 || 
    selectedProvinces.includes(getProvinceKeyFromItem(item))
).length;
const afterDateFilter = /* aplicar filtro de fechas */.length;

console.log('Data flow:', {
    original: originalCount,
    afterProvince: afterProvinceFilter,
    afterDate: afterDateFilter,
    lost: originalCount - afterDateFilter
});
```

#### Soluciones
1. **Filtros menos estrictos**: No excluir por coordenadas (0,0)
2. **Validación mejorada**: Solo excluir datos definitivamente inválidos
3. **Logging de exclusiones**: Registrar qué datos se excluyen y por qué

### 4. Problemas de Normalización de Provincias

#### Síntomas
- Provincias aparecen como "UNKNOWN" en filtros
- Datos no aparecen al filtrar por provincia específica
- Logging de provincias muestra inconsistencias

#### Diagnóstico
```javascript
// Verificar campos de provincia disponibles
const provinceFields = data.map(item => ({
    id: item.ID_OPERATIVO,
    PROVINCIA: item.PROVINCIA,
    provincia: item.provincia,
    province: item.province,
    normalized: getProvinceKeyFromItem(item)
})).filter(item => item.normalized === 'UNKNOWN');

console.log('Problematic provinces:', provinceFields.slice(0, 10));
```

#### Solución
- **Ampliar campos candidatos**: Agregar más variaciones de nombres de campo
- **Mejorar normalización**: Manejo de casos especiales y abreviaciones
- **Validación en carga**: Verificar datos en el momento de la importación

### 5. Problemas de Coordenadas

#### Síntomas
- Mapas vacíos o con pocos marcadores
- Warning sobre coordenadas inválidas
- Logging muestra bajo porcentaje de coordenadas válidas

#### Diagnóstico
```javascript
// Analizar coordenadas disponibles
const coordinateAnalysis = data.map(item => {
    const coords = getCoordinatesFromItem(item);
    return {
        id: item.ID_OPERATIVO,
        hasCoords: coords !== null,
        lat: coords?.lat,
        lng: coords?.lng,
        rawLat: item.LATITUD || item.latitud,
        rawLng: item.LONGITUD || item.longitud
    };
});

console.log('Coordinate analysis:', {
    total: coordinateAnalysis.length,
    withCoords: coordinateAnalysis.filter(c => c.hasCoords).length,
    zeroZero: coordinateAnalysis.filter(c => c.lat === 0 && c.lng === 0).length
});
```

## 🔧 Herramientas de Debug

### 1. Habilitar Debug Completo
```javascript
// En consola del navegador
localStorage.setItem('debug', 'true');
// Recargar página para activar logging adicional
```

### 2. Inspeccionar Estado del Dashboard
```javascript
// En consola, con el context disponible
const { data, filteredData, filteredCategorizedData } = useDashboard();
console.log('Dashboard State:', {
    totalData: data?.length,
    filteredData: filteredData?.length, 
    categorizedData: filteredCategorizedData?.length
});
```

### 3. Verificar Funciones de Procesamiento
```javascript
// Testear funciones individualmente
import { normalizeProvinceKey, getProvinceKeyFromItem, getCoordinatesFromItem } from './contexts/DashboardContext';

// Testear normalización
console.log(normalizeProvinceKey('Córdoba')); // CORDOBA
console.log(normalizeProvinceKey('C.A.B.A.')); // CABA

// Testear extracción
const testItem = { PROVINCIA: 'Buenos Aires', LATITUD: -34.6118, LONGITUD: -58.3960 };
console.log(getProvinceKeyFromItem(testItem)); // BUENOS_AIRES
console.log(getCoordinatesFromItem(testItem)); // {lat: -34.6118, lng: -58.3960}
```

### 4. Monitoreo de Performance
```javascript
// Medir tiempo de procesamiento
console.time('Data Processing');
const processedData = processJsonData(rawData);
console.timeEnd('Data Processing');

console.time('Filtering');
const filtered = applyFilters(processedData);
console.timeEnd('Filtering');
```

## 📋 Checklist de Troubleshooting

### Al Reportar un Bug
- [ ] **Captura de consola**: Incluir todos los warnings/errors
- [ ] **Estado del dashboard**: Conteos de datos en diferentes etapas
- [ ] **Filtros aplicados**: Provincias seleccionadas, rango de fechas
- [ ] **Datos de muestra**: Ejemplos de registros problemáticos
- [ ] **Pasos para reproducir**: Secuencia específica de acciones

### Al Investigar Problemas de Datos
- [ ] **Verificar logging**: Revisar warnings de inconsistencia
- [ ] **Analizar distribución**: Conteos por categoría y provincia
- [ ] **Validar coordenadas**: Porcentaje de coordenadas válidas
- [ ] **Comprobar fechas**: Formatos de fecha reconocidos
- [ ] **Inspeccionar raw data**: Datos originales vs procesados

### Al Hacer Cambios en Funciones Centralizadas
- [ ] **Testear individualmente**: Cada función por separado
- [ ] **Verificar integración**: Impacto en componentes que las usan
- [ ] **Monitorear consistencia**: Warnings de inconsistencia tras cambios
- [ ] **Validar métricas**: Que los conteos sigan siendo correctos
- [ ] **Revisar logging**: Que la información de debug sea útil

## 🚨 Problemas Conocidos y Limitaciones

### 1. Filtros de Fecha
- **Limitación**: Solo acepta formato dd/MM/yyyy consistentemente
- **Workaround**: Normalizar fechas en la fuente de datos

### 2. Coordenadas (0,0)
- **Comportamiento**: Se consideran inválidas y se excluyen de mapas
- **Razón**: (0,0) está en el océano Atlántico, improbable para datos argentinos

### 3. Provincias con Caracteres Especiales
- **Problema**: Algunas variaciones de nombres no se normalizan correctamente
- **Solución**: Ampliar el mapeo de casos especiales en `normalizeProvinceKey()`

### 4. Performance con Datasets Grandes
- **Limitación**: Filtros en tiempo real pueden ser lentos con >10,000 registros
- **Futura mejora**: Implementar debounce y virtualización

## 📞 Escalación y Soporte

### Niveles de Severidad

#### 🔴 Crítico (Resolución inmediata)
- Sistema no carga datos
- Errores de autenticación
- Crash de la aplicación

#### 🟡 Alto (Resolución en 24h)
- Inconsistencias mayores en datos
- Funcionalidad clave no disponible
- Performance severamente degradada

#### 🟢 Medio (Resolución en 72h)
- Inconsistencias menores
- Funcionalidad opcional no disponible
- Problemas de UX

#### 🔵 Bajo (Próximo release)
- Mejoras de logging
- Optimizaciones menores
- Documentación

### Información para Soporte
Al reportar problemas, incluir:
1. **Logs de consola** (copiar texto completo)
2. **Pasos para reproducir** (secuencia específica)
3. **Datos de contexto** (conteos, filtros aplicados)
4. **Screenshots** si es problema visual
5. **Navegador y versión**
6. **Timestamp** del problema

---

*Esta guía es un documento vivo que se actualiza con nuevos problemas y soluciones identificados durante el uso del sistema.*