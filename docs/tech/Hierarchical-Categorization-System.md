# Sistema de Categorización Jerárquica - Dashboard de Operaciones de Seguridad

## Resumen Ejecutivo

El sistema implementa una **categorización jerárquica con exclusión mutua** que garantiza que cada registro operacional pertenece únicamente a la categoría de mayor prioridad que corresponda. Este enfoque elimina la ambigüedad en la clasificación de datos y proporciona métricas precisas para análisis operacional.

## Arquitectura del Sistema

### Jerarquía de Prioridades
```
1. detenidos      (Prioridad máxima)
2. incautaciones  
3. abatidos       
4. trata          
5. afectados      
6. controlados    
7. procedimientos (Prioridad mínima - fallback)
```

### Principios de Funcionamiento

#### 1. Exclusión Mutua
- **Un registro = Una categoría**: Cada item pertenece únicamente a una categoría principal
- **Prioridad jerárquica**: Se asigna la categoría de mayor prioridad que corresponda
- **No duplicación**: Elimina conteos duplicados en métricas y estadísticas

#### 2. Palabras Clave por Categoría

##### Detenidos (Prioridad 1)
- **Palabras clave**: `detenido`, `arrestado`, `capturado`, `aprehendido`
- **Casos de uso**: Arrestos, capturas, detenciones preventivas
- **Campos evaluados**: `DESCRIPCION`, `TIPO_INTERVENCION`, `OBSERVACIONES`

##### Incautaciones (Prioridad 2)
- **Palabras clave**: `incautado`, `decomisado`, `secuestrado`, `confiscado`
- **Casos de uso**: Decomisos de drogas, armas, mercancía ilegal
- **Campos evaluados**: `DESCRIPCION`, `TIPO_INTERVENCION`, `MATERIAL_INCAUTADO`

##### Abatidos (Prioridad 3)  
- **Palabras clave**: `abatido`, `enfrentamiento`, `tiroteo`, `baja`
- **Casos de uso**: Enfrentamientos armados, bajas en operativos
- **Campos evaluados**: `DESCRIPCION`, `TIPO_INTERVENCION`, `RESULTADO_OPERATIVO`

##### Trata (Prioridad 4)
- **Palabras clave**: `trata`, `tráfico`, `explotación`
- **Casos de uso**: Trata de personas, tráfico humano, explotación
- **Campos evaluados**: `DESCRIPCION`, `TIPO_DELITO`, `MODALIDAD`

##### Afectados (Prioridad 5)
- **Palabras clave**: `afectado`, `víctima`, `rescatado`
- **Casos de uso**: Víctimas rescatadas, personas afectadas
- **Campos evaluados**: `DESCRIPCION`, `VICTIMAS`, `PERSONAS_AFECTADAS`

##### Controlados (Prioridad 6)
- **Palabras clave**: `controlado`, `verificado`, `identificado`  
- **Casos de uso**: Controles de rutina, verificaciones, identificaciones
- **Campos evaluados**: `DESCRIPCION`, `TIPO_CONTROL`, `RESULTADO`

##### Procedimientos (Prioridad 7 - Fallback)
- **Condición**: Registros que no coinciden con ninguna categoría específica
- **Casos de uso**: Operativos generales, procedimientos administrativos
- **Función**: Categoría por defecto para mantener integridad de datos

## Implementación Técnica

### Funciones de Categorización (dataService.js)

```javascript
// Funciones helper para cada categoría
const isDetenido = (item) => {
    const keywords = ['detenido', 'arrestado', 'capturado', 'aprehendido'];
    return keywords.some(keyword => 
        checkFields(item, keyword, ['DESCRIPCION', 'TIPO_INTERVENCION', 'OBSERVACIONES'])
    );
};

const isIncautacion = (item) => {
    const keywords = ['incautado', 'decomisado', 'secuestrado', 'confiscado'];
    return keywords.some(keyword => 
        checkFields(item, keyword, ['DESCRIPCION', 'TIPO_INTERVENCION', 'MATERIAL_INCAUTADO'])
    );
};

// ... resto de funciones similares
```

### Algoritmo de Categorización

```javascript
export const getCategorizedData = (data) => {
    return data.map(item => {
        // Evaluación jerárquica por prioridad
        if (isDetenido(item)) return { ...item, categoria: 'detenidos' };
        if (isIncautacion(item)) return { ...item, categoria: 'incautaciones' };
        if (isAbatido(item)) return { ...item, categoria: 'abatidos' };
        if (isTrata(item)) return { ...item, categoria: 'trata' };
        if (isAfectado(item)) return { ...item, categoria: 'afectados' };
        if (isControlado(item)) return { ...item, categoria: 'controlados' };
        
        // Fallback a procedimientos
        return { ...item, categoria: 'procedimientos' };
    });
};
```

### Función de Verificación de Campos

```javascript
const checkFields = (item, keyword, fieldNames) => {
    return fieldNames.some(fieldName => {
        const fieldValue = item[fieldName];
        if (!fieldValue || fieldValue === '-') return false;
        return String(fieldValue).toLowerCase().includes(keyword.toLowerCase());
    });
};
```

## Casos de Uso y Ejemplos

### Ejemplo 1: Registro con Múltiples Categorías
```javascript
// Registro de entrada
{
    ID_OPERATIVO: "OP-001",
    DESCRIPCION: "Operativo con detenido y droga incautada",
    TIPO_INTERVENCION: "Detención con incautación de estupefacientes",
    MATERIAL_INCAUTADO: "50kg cocaína"
}

// Resultado: categoria = "detenidos" (prioridad 1)
// Aunque también califica como "incautación", se asigna la categoría de mayor prioridad
```

### Ejemplo 2: Registro de Control Rutinario
```javascript
// Registro de entrada
{
    ID_OPERATIVO: "OP-002", 
    DESCRIPCION: "Control de rutina vehicular",
    TIPO_CONTROL: "Verificación de documentación",
    RESULTADO: "Personas controladas sin infracciones"
}

// Resultado: categoria = "controlados" (prioridad 6)
```

### Ejemplo 3: Registro sin Categoría Específica
```javascript
// Registro de entrada
{
    ID_OPERATIVO: "OP-003",
    DESCRIPCION: "Patrullaje preventivo en zona comercial",
    TIPO_INTERVENCION: "Presencia policial preventiva"
}

// Resultado: categoria = "procedimientos" (fallback)
```

## Validación y Consistencia

### Validaciones Implementadas

#### 1. Validación de Integridad
```javascript
// Verificar que todos los registros tienen categoría asignada
const uncategorized = data.filter(item => !item.categoria);
if (uncategorized.length > 0) {
    console.warn('Registros sin categoría:', uncategorized.length);
}
```

#### 2. Validación de Distribución
```javascript
// Análisis de distribución por categorías
const categoryDistribution = data.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + 1;
    return acc;
}, {});

console.log('Distribución por categorías:', categoryDistribution);
```

#### 3. Validación de Jerarquía
```javascript
// Verificar que la jerarquía se respeta correctamente
const priorityOrder = ['detenidos', 'incautaciones', 'abatidos', 'trata', 'afectados', 'controlados', 'procedimientos'];
const isHierarchyRespected = validateHierarchy(data, priorityOrder);
```

### Logging de Debug
```javascript
// Logging ocasional de estadísticas de categorización
if (Math.random() < 0.05) { // 5% de las veces
    console.log('📊 Categorización aplicada:', {
        totalRegistros: data.length,
        distribución: categoryDistribution,
        timestamp: new Date().toISOString()
    });
}
```

## Métricas y Analytics

### KPIs Generados
- **Total por Categoría**: Conteo preciso sin duplicaciones
- **Distribución Porcentual**: Porcentaje de cada categoría sobre el total
- **Tendencias Temporales**: Evolución de categorías por período
- **Distribución Geográfica**: Categorías por provincia/ubicación

### Visualizaciones Soportadas
1. **Gráficos de Barras**: Distribución por categoría
2. **Gráficos de Torta**: Porcentajes por categoría  
3. **Mapas de Calor**: Distribución geográfica por categoría
4. **Series Temporales**: Evolución de categorías en el tiempo

## Impacto en el Sistema

### Beneficios Obtenidos

#### 1. Precisión en Métricas
- **Antes**: Posible duplicación de conteos
- **Después**: Conteos precisos y mutuamente exclusivos

#### 2. Claridad Analítica
- **Antes**: Ambigüedad en clasificaciones múltiples
- **Después**: Clasificación clara y unívoca

#### 3. Consistencia de Reportes
- **Antes**: Inconsistencias entre diferentes vistas de datos
- **Después**: Consistencia garantizada en todos los componentes

#### 4. Optimización de Performance
- **Antes**: Múltiples evaluaciones redundantes
- **Después**: Evaluación secuencial optimizada con early return

### Casos Edge Manejados

#### 1. Registros Vacíos o con "-"
```javascript
// Manejo de campos vacíos
if (!fieldValue || fieldValue === '-') return false;
```

#### 2. Variaciones en Mayúsculas/Minúsculas
```javascript
// Comparación case-insensitive  
return String(fieldValue).toLowerCase().includes(keyword.toLowerCase());
```

#### 3. Campos Faltantes
```javascript
// Verificación de existencia de campos
return fieldNames.some(fieldName => {
    const fieldValue = item[fieldName];
    // Verificación robusta...
});
```

## Mantenimiento y Evolución

### Agregar Nueva Categoría
1. **Definir prioridad** en la jerarquía
2. **Implementar función `isNewCategory(item)`**
3. **Agregar keywords específicas**
4. **Actualizar algoritmo de categorización**
5. **Agregar tests de validación**

### Modificar Prioridades
1. **Actualizar orden en `getCategorizedData()`**
2. **Actualizar documentación de prioridades**
3. **Verificar impacto en reportes existentes**
4. **Ejecutar tests de regresión**

### Optimizaciones Futuras
- **Cache de categorización** para grandes datasets
- **Categorización asíncrona** para mejor UX
- **Machine learning** para clasificación automática mejorada
- **Configuración dinámica** de keywords por admin

## Conclusión

El sistema de categorización jerárquica proporciona una base sólida para el análisis preciso de datos operacionales, eliminando ambigüedades y garantizando métricas consistentes. La implementación modular y bien documentada facilita futuras extensiones y mantenimiento del sistema.