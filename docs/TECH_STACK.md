```markdown
# Tech Stack

Este documento detalla las tecnologías, librerías y herramientas utilizadas en el proyecto.

## Frontend

-   **Framework**: [React](https://reactjs.org/) (v18+)
    -   Utilizado para construir la interfaz de usuario de manera declarativa y basada en componentes.
-   **Bundler/Build Tool**: [Vite](https://vitejs.dev/)
    -   Proporciona un entorno de desarrollo extremadamente rápido con Hot Module Replacement (HMR) y optimiza el build para producción.
-   **Lenguaje**: JavaScript (ES6+) con JSX
    -   El estándar para el desarrollo en React.
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
    -   Un framework CSS "utility-first" que permite construir diseños complejos directamente en el HTML/JSX sin escribir CSS personalizado.

## Visualización de Datos

-   **Mapas Interactivos**: [Leaflet](https://leafletjs.com/) con [React-Leaflet](https://react-leaflet.js.org/)
    -   **Sugerencia**: Es una librería de mapas de código abierto, ligera y muy popular. Ideal para mostrar marcadores georreferenciados.
    -   **Alternativa**: [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js) para mapas más complejos y con mayor personalización.
-   **Gráficos Estadísticos**: [Chart.js](https://www.chartjs.org/) con [react-chartjs-2](https://react-chartjs-2.js.org/)
    -   **Sugerencia**: Es una librería versátil y fácil de usar para crear gráficos de barras, líneas, tortas, etc.
    -   **Alternativa**: [D3.js](https://d3js.org/) para visualizaciones de datos altamente personalizadas y complejas, aunque con una curva de aprendizaje más pronunciada.

## Procesamiento de Datos (Backend/Offline)

-   **Lenguaje**: [Python](https://www.python.org/) (v3.8+)
    -   Utilizado para el script de pre-procesamiento de datos.
-   **Librerías de Python**:
    -   [**Pandas**](https://pandas.pydata.org/): Para la lectura, manipulación y limpieza de los datos desde el archivo Excel.
    -   [**Openpyxl**](https://openpyxl.readthedocs.io/): Requerido por Pandas para leer archivos `.xlsx`.

## Entorno de Desarrollo

-   **Gestor de Paquetes**: [npm](https://www.npmjs.com/)
    -   Para gestionar las dependencias del proyecto de frontend.
-   **Control de Versiones**: [Git](https://git-scm.com/) y [GitHub](https://github.com)
    -   Para el seguimiento de cambios en el código y la colaboración.
-   **Editor de Código**: [Visual Studio Code](https://code.visualstudio.com/)
    -   Recomendado por su gran ecosistema de extensiones para desarrollo web y Python.

```
