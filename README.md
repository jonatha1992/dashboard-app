# Dashboard de Análisis de Operativos de Seguridad

## Descripción General

Este sistema está diseñado para la gestión, análisis y visualización de datos de operativos de seguridad. El objetivo principal es proveer un dashboard interactivo que permita a los usuarios explorar y analizar datos complejos de manera intuitiva, identificando tendencias, patrones geográficos y resultados clave de los procedimientos realizados.

La plataforma se centra en la visualización de datos a través de un mapa interactivo, tablas dinámicas y gráficos estadísticos.

---

## Arquitectura y Flujo de Datos

El sistema sigue un flujo de datos claro para transformar la información original en visualizaciones interactivas:

1.  **Fuente de Datos Original**: La información proviene de un único archivo Excel (`data/bd.xlsx`) que contiene múltiples hojas relacionadas.
2.  **Procesamiento y Conversión**: Un script de Python (`convert_excel.py`) se encarga de leer el archivo Excel, procesar cada hoja y convertirlas en archivos JSON individuales.
3.  **Datos para la Aplicación**: Los archivos JSON generados se almacenan en el directorio `public/data/json/` y son consumidos directamente por la aplicación web.
4.  **Frontend (Dashboard)**: La aplicación está construida con **React y Vite**. Se encarga de cargar los archivos JSON, vincular los datos y presentarlos a través de componentes interactivos como mapas, gráficos y tablas.

---

## Modelo de Datos

La relación entre los distintos conjuntos de datos se establece a través de una clave única:

-   **Clave de Enlace Principal**: `ID_OPERATIVO`. Este campo está presente en todos los archivos JSON y permite conectar la información de un operativo específico a través de las diferentes tablas (incautaciones, detenidos, etc.).

-   **Tabla Principal**: `GEOG._PROCEDIMIENTO.json`, que contiene la información central de cada operativo, incluyendo su ubicación y fecha.

---

## Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en un entorno de desarrollo.

### Prerrequisitos

-   [Node.js](https://nodejs.org/) (versión 18 o superior)
-   [Python](https://www.python.org/) (versión 3.8 o superior)
-   Las librerías de Python `pandas` y `openpyxl`. Puedes instalarlas con pip:
    ```bash
    pip install pandas openpyxl
    ```

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL-DEL-REPOSITORIO>
    cd dashboard-app
    ```

2.  **Procesar los Datos (si es necesario):**
    Si el archivo `data/bd.xlsx` ha sido actualizado, debes ejecutar el script de conversión para regenerar los archivos JSON.
    ```bash
    python convert_excel.py
    ```

3.  **Instalar Dependencias del Frontend:**
    ```bash
    npm install
    ```

4.  **Ejecutar la Aplicación:**
    Este comando iniciará el servidor de desarrollo de Vite.
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

---

## Funcionalidades Destacadas

-   Consulta georreferenciada de los operativos en un mapa interactivo.
-   Estadísticas detalladas sobre recursos, controles, incautaciones y personas detenidas.
-   Filtros dinámicos para analizar datos por tipo de intervención, provincia, fecha, etc.
-   Arquitectura flexible para incorporar nuevas métricas y visualizaciones en el futuro.
