```markdown
# Estructura del Proyecto

Este documento describe la organización de los archivos y directorios del proyecto `dashboard-app`.

## Directorio Raíz

-   **`/.copilot/`**: Contiene archivos de configuración e instrucciones específicas para GitHub Copilot, ayudando a la IA a entender el contexto del proyecto.
    -   `instructions.md`: Instrucciones para GitHub Copilot.
-   **`/data/`**: Almacena la fuente de datos original.
    -   `bd.xlsx`: El archivo Excel con múltiples hojas que sirve como la base de datos principal.
-   **`/docs/`**: Contiene la documentación detallada del proyecto.
    -   `STRUCTURE.md`: Este archivo.
    -   `PLANNING.md`: El plan de desarrollo y las fases del proyecto.
    -   `TECH_STACK.md`: Descripción de las tecnologías utilizadas.
-   **`/node_modules/`**: Directorio donde se instalan las dependencias de Node.js. (Ignorado por Git).
-   **`/public/`**: Contiene los archivos estáticos que se sirven directamente al navegador.
    -   `/data/json/`: Almacena los archivos JSON generados por el script de Python, que son consumidos por la aplicación React.
-   **`/src/`**: Contiene todo el código fuente de la aplicación React.
    -   **`/assets/`**: Imágenes, logos y otros recursos estáticos que se importan en los componentes.
    -   **`/components/`**: Componentes reutilizables de React.
        -   `/auth/`: Componentes para autenticación (ej. `Login.jsx`).
        -   `/charts/`: Componentes de gráficos (ej. `ProvinceChart.jsx`, `TrendChart.jsx`).
        -   `/dashboard/`: Componentes principales del tablero (ej. `Dashboard.jsx`, `DataTable.jsx`).
        -   `/map/`: Componentes relacionados con el mapa interactivo.
        -   `/security/`: Componentes para secciones de seguridad.
    -   **`/contexts/`**: Contextos de React para el manejo de estado global (ej. `AuthContext.jsx`).
    -   **`/services/`**: Lógica para interactuar con fuentes de datos o APIs (ej. `dataService.js`).
    -   `App.jsx`: El componente raíz de la aplicación.
    -   `main.jsx`: El punto de entrada de la aplicación React.
    -   `index.css`, `App.css`: Archivos de estilos globales.
-   `.gitignore`: Archivo que especifica qué archivos y directorios deben ser ignorados por Git.
-   `package.json`: Define los metadatos del proyecto y las dependencias de npm.
-   `vite.config.js`: Archivo de configuración para Vite.
-   `tailwind.config.js`: Archivo de configuración para Tailwind CSS.
-   `README.md`: Documentación principal y guía de inicio rápido del proyecto.
-   `convert_excel.py`: Script de Python para procesar el archivo `bd.xlsx` y generar los archivos JSON.

```
