```markdown
# Plan de Desarrollo del Proyecto

Este documento define las fases y los hitos para el desarrollo del dashboard de análisis de operativos.

## Fase 1: Configuración y Análisis de Datos (Completada)

-   [x] **Análisis de la Fuente de Datos**: Identificar la estructura del archivo `bd.xlsx`.
-   [x] **Creación de Script de Conversión**: Desarrollar `convert_excel.py` para transformar las hojas de Excel a formato JSON.
-   [x] **Definición del Modelo de Datos**: Establecer la relación entre los archivos JSON a través de la clave `ID_OPERATIVO`.
-   [x] **Configuración Inicial del Proyecto**: Inicializar un proyecto React con Vite y configurar las herramientas básicas (ESLint, Tailwind CSS).
-   [x] **Documentación Inicial**: Crear `README.md` y la estructura de la carpeta `docs`.

## Fase 2: Desarrollo del Dashboard - Componentes Principales

-   [ ] **Componente de Mapa Interactivo**:
    -   Mostrar los operativos como marcadores en el mapa usando las coordenadas de `GEOG._PROCEDIMIENTO.json`.
    -   Al hacer clic en un marcador, mostrar información básica del operativo (fecha, provincia, descripción).
-   [ ] **Componente de Tabla de Datos**:
    -   Mostrar una tabla con la lista de todos los operativos.
    -   Incluir columnas clave como `ID_OPERATIVO`, `FECHA`, `PROVINCIA`, `DESCRIPCION`.
    -   Implementar paginación y ordenamiento básico.
-   [ ] **Componente de Tarjetas de Estadísticas (StatCard)**:
    -   Crear tarjetas que muestren métricas clave:
        -   Total de Operativos.
        -   Total de Detenidos.
        -   Total de Incautaciones (en valor o cantidad).
-   [ ] **Servicio de Datos (`dataService.js`)**:
    -   Crear funciones para cargar y combinar los datos de los diferentes archivos JSON.
    -   Centralizar la lógica de acceso a datos para que los componentes sean más limpios.

## Fase 3: Desarrollo de Componentes de Análisis Detallado

-   [ ] **Gráficos por Categoría**:
    -   Gráfico de barras/torta mostrando el número de operativos por `PROVINCIA`.
    -   Gráfico de barras/torta mostrando la distribución de `DELITO_IMPUTADO` desde `DETENIDOS_Y_APREHENDIDOS.json`.
-   [ ] **Gráfico de Tendencias**:
    -   Gráfico de líneas que muestre la cantidad de operativos a lo largo del tiempo (por mes/año).
-   [ ] **Vista de Detalle del Operativo**:
    -   Al seleccionar un operativo en el mapa o la tabla, mostrar una vista detallada que combine información de todos los archivos relacionados (detenidos, incautaciones, etc.).

## Fase 4: Filtros Avanzados y Conexiones

-   [ ] **Panel de Filtros Unificado**:
    -   Crear un componente que permita filtrar todos los datos del dashboard por:
        -   Rango de fechas.
        -   Provincia.
        -   Tipo de delito.
-   [ ] **Interactividad entre Componentes**:
    -   Al filtrar los datos, todos los componentes (mapa, tablas, gráficos) deben actualizarse para reflejar la selección.
    -   Al hacer clic en una barra de un gráfico (ej. una provincia), filtrar el resto del dashboard por esa selección.

## Fase 5: Despliegue y Pruebas

-   [ ] **Pruebas de Funcionalidad**: Verificar que todos los componentes, filtros e interacciones funcionen como se espera.
-   [ ] **Optimización**: Revisar el rendimiento de la carga y procesamiento de datos.
-   [ ] **Build de Producción**: Generar la versión de producción de la aplicación.
-   [ ] **Despliegue**: Publicar la aplicación en una plataforma (ej. Vercel, Netlify, GitHub Pages).

```
