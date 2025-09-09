# ADR-001: Centralización de Funciones de Procesamiento de Datos

## Estado
**Aceptado** - Implementado en versión 2.1.0 (2025-09-09)

## Contexto

El sistema dashboard-app había desarrollado múltiples implementaciones duplicadas de funciones críticas de procesamiento de datos, lo que resultaba en:

1. **Inconsistencias de datos**: Diferentes componentes aplicaban lógicas ligeramente distintas para normalización de provincias y coordenadas
2. **Duplicación de código**: Funciones como `toKey()` en dataService.js duplicaban lógica de normalización
3. **Problemas de sincronización**: Los mapas no se actualizaban correctamente debido a inconsistencias en el procesamiento
4. **Dificultad de mantenimiento**: Cambios en lógica de procesamiento requerían modificaciones en múltiples archivos
5. **Pérdida de datos**: Filtros inconsistentes causaban pérdida de registros válidos (reducción de 1257 a 812 registros)

## Decisión

Centralizar todas las funciones de procesamiento de datos en `DashboardContext.jsx` y exportarlas para uso consistente en toda la aplicación.

### Funciones Centralizadas Implementadas

#### 1. Normalización de Provincias
```javascript
export const normalizeProvinceKey(s)
export const getProvinceKeyFromItem(item)
```
- **Propósito**: Normalización consistente de nombres de provincias
- **Características**: Eliminación de diacríticos, manejo de casos especiales, búsqueda en múltiples campos candidatos

#### 2. Extracción de Coordenadas
```javascript
export const getCoordinatesFromItem(item)
```
- **Propósito**: Extracción unificada de coordenadas geográficas
- **Características**: Búsqueda en campos extensos, validación de rangos, exclusión de coordenadas (0,0)

#### 3. Procesamiento de Fechas
```javascript
export const parseDateToISO(dateStr)
export const formatDateForDisplay(dateStr)
```
- **Propósito**: Manejo estandarizado de fechas en formato argentino (dd/MM/yyyy)
- **Características**: Conversión a ISO, validación robusta, manejo de errores

## Alternativas Consideradas

### 1. Utilidades Separadas en `/utils/`
**Rechazado**: Menor cohesión, requería imports adicionales en múltiples lugares

### 2. Servicios Especializados
**Rechazado**: Complejidad excesiva para funciones que están estrechamente relacionadas con el contexto

### 3. Hooks Personalizados
**Rechazado**: Las funciones son utilities puras, no requieren estado de React

## Consecuencias

### Positivas
1. **Consistencia Garantizada**: Una sola fuente de verdad para procesamiento de datos
2. **Mantenibilidad Mejorada**: Cambios en una sola ubicación
3. **Eliminación de Duplicación**: Código más limpio y DRY
4. **Sincronización de Mapas**: Resolución del problema de re-renderización
5. **Recuperación de Datos**: Resolución de pérdida de registros por filtros inconsistentes
6. **Debugging Centralizado**: Logging unificado para troubleshooting

### Negativas
1. **Acoplamiento**: Dependencia en DashboardContext para utilities que podrían ser independientes
2. **Tamaño del Context**: Crecimiento del archivo DashboardContext.jsx

### Neutras
1. **Refactoring Requerido**: Actualización de imports en componentes existentes (completado)

## Implementación

### Migración Realizada
1. **DashboardContext.jsx**: Exportación de 5 funciones centralizadas
2. **dataService.js**: Eliminación de `toKey()`, uso de funciones centralizadas
3. **MapComponent.jsx**: Uso de `getCoordinatesFromItem()` centralizada, eliminación de React.memo problemático
4. **CategoryCharts.jsx**: Integración de logging centralizado

### Validaciones Agregadas
- Consistencia en tiempo real entre `filteredData` y `filteredCategorizedData`
- Logging detallado para debugging de filtros y categorización
- Detección automática de inconsistencias con alertas específicas

## Fecha
2025-09-09

## Autores
- Equipo de desarrollo dashboard-app
- Implementado con asistencia de Claude Code

## Notas Técnicas

### Jerarquía de Categorización Implementada
```
detenidos > incautaciones > abatidos > trata > afectados > controlados > procedimientos
```

### Campos Candidatos para Coordenadas
```javascript
const latCandidates = ['LATITUD', 'latitud', 'latitud_decimal', 'lat', 'latitude', 'Latitud'];
const lngCandidates = ['LONGITUD', 'longitud', 'longitud_decimal', 'lng', 'lon', 'longitude', 'Longitud'];
```

### Validaciones de Coordenadas
- Latitud: -90 a 90 grados
- Longitud: -180 a 180 grados  
- Exclusión de (0,0) como coordenada inválida
- Validación de tipos numéricos

## Referencias
- Issue: Inconsistencia en filtros de datos y sincronización de mapas
- PR: Centralización de funciones de procesamiento de datos
- Documentación actualizada: CLAUDE.md, STRUCTURE.md