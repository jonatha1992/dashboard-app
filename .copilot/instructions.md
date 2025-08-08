```markdown
# Instrucciones para GitHub Copilot

## Objetivo Principal

Tu objetivo es asistir en el desarrollo de un dashboard interactivo para el análisis de datos de operativos de seguridad. La aplicación se construye con React, Vite y Tailwind CSS, y consume datos desde archivos JSON.

## Flujo de Trabajo General

1.  **Analiza la Solicitud**: Lee cuidadosamente la petición del usuario para entender si se trata de crear un nuevo componente, modificar uno existente, analizar datos o depurar un problema.
2.  **Consulta el Contexto**: Antes de generar código, revisa los archivos relevantes para entender el estado actual:
    -   Para **nuevos componentes**, revisa componentes similares en `src/components/`.
    -   Para **análisis de datos**, consulta los archivos JSON en `public/data/json/` para entender la estructura de los datos que necesitas. Los archivos clave son `GEOG._PROCEDIMIENTO.json`, `INCAUTACIONES.json` y `DETENIDOS_Y_APREHENDIDOS.json`.
    -   Para **lógica de datos**, revisa `src/services/dataService.js` para ver si ya existe una función que puedas reutilizar o extender.
3.  **Genera Código Limpio**:
    -   Sigue las mejores prácticas de React (componentes funcionales, hooks).
    -   Utiliza Tailwind CSS para los estilos. No escribas CSS tradicional a menos que sea estrictamente necesario.
    -   Asegúrate de que el código sea legible y esté bien comentado si la lógica es compleja.

## Contexto Clave del Proyecto

-   **Fuente de Datos**: La aplicación NO se conecta a una API de backend. Carga los datos desde archivos JSON estáticos ubicados en `public/data/json/`.
-   **Modelo de Datos Relacional**:
    -   La clave principal que conecta TODOS los archivos de datos es `ID_OPERATIVO`.
    -   `GEOG._PROCEDIMIENTO.json` es la tabla "maestra" o "de hechos". Contiene la información geográfica y temporal de cada operativo.
    -   Los demás archivos (`INCAUTACIONES.json`, `DETENIDOS_Y_APREHENDIDOS.json`, etc.) son tablas "de dimensión" que añaden detalles a un operativo específico a través del `ID_OPERATIVO`.
-   **Tecnologías Sugeridas**:
    -   Para mapas: **React-Leaflet**.
    -   Para gráficos: **react-chartjs-2**.
-   **Planificación**: Consulta `docs/PLANNING.md` para entender en qué fase del desarrollo nos encontramos y cuáles son los siguientes pasos.

## Ejemplo de Tarea Común

**Usuario**: "Crea un gráfico que muestre el total de detenidos por provincia."

**Tu Proceso Mental**:
1.  **Objetivo**: Gráfico de barras. Eje X: Provincias. Eje Y: Conteo de detenidos.
2.  **Datos necesarios**:
    -   Necesito la provincia de cada operativo. La obtengo de `GEOG._PROCEDIMIENTO.json`.
    -   Necesito la lista de detenidos. La obtengo de `DETENIDOS_Y_APREHENDIDOS.json`.
3.  **Lógica de combinación**:
    -   Agrupar los detenidos por `ID_OPERATIVO`.
    -   Para cada `ID_OPERATIVO`, buscar la `PROVINCIA` correspondiente en el archivo de procedimientos.
    -   Contar el número de detenidos para cada provincia.
4.  **Implementación**:
    -   Proponer una función en `dataService.js` para encapsular esta lógica.
    -   Crear un nuevo componente en `src/components/charts/`, por ejemplo `DetenidosPorProvinciaChart.jsx`.
    -   Este componente llamará a la función del servicio, procesará los datos para que `react-chartjs-2` los entienda, y renderizará el gráfico de barras.

```
