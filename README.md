# README del Sistema

## Descripción General

Este sistema está diseñado para la gestión, análisis y visualización de datos de operativos de seguridad registrados en el archivo `INFORME ENERO 2025.xlsx`. El objetivo principal es brindar reportes automáticos, dashboards y análisis estadísticos que permitan identificar tendencias, recursos utilizados, incidencias y resultados de los procedimientos realizados durante enero de 2025.

La plataforma integra un dashboard interactivo (visualización en mapa, tablas y estadísticas), herramientas de análisis automatizado y flujos de trabajo para gestionar la carga de información y la generación de reportes periódicos.

## 🔓 Acceso Temporal Sin Autenticación

**NOTA IMPORTANTE**: El sistema de autenticación (login/registro) ha sido temporalmente deshabilitado para facilitar las pruebas del sistema de carga de archivos y transcripciones. Al acceder a la aplicación, los usuarios son dirigidos directamente al dashboard principal sin necesidad de credenciales.

Esta configuración es temporal y será reactivada una vez que se complete la implementación del registro de usuarios.

---

## Componentes del Sistema

1. **Base de datos en Excel**
   - Cada hoja representa una dimensión del operativo: procedimientos, controles, detenidos, incautaciones, recursos afectados, eventos especiales, entre otros.
   - Las hojas están relacionadas por el campo `ID_PROCEDIMIENTO`.

2. **Dashboard Web**
   - Visualización de procedimientos en mapa interactivo.
   - Tablas filtrables y resúmenes estadísticos (procedimientos, detenidos, incautaciones, recursos, etc.).
   - Panel de navegación por pestañas (General, Controles, Detenidos, Incautaciones, etc.).
   - Cálculo de métricas clave automáticamente.

3. **Automatización y Scripts**
   - Carga, limpieza y procesamiento de datos desde el Excel.
   - Generación de informes estadísticos.
   - Capacidad de expansión para nuevas hojas y métricas según necesidades futuras.

4. **Gestión de Issues y Proyectos**
   - Flujos de trabajo para definir, asignar y trackear tareas específicas (issues).
   - Documentación y plantillas para analizar cada hoja y métrica.

---

## Funcionalidades Destacadas

- Consulta georreferenciada de los operativos.
- Estadísticas detalladas de recursos, controles, incautaciones y personas detenidas.
- Informes automáticos por tipo de intervención, provincia, fecha, etc.
- Flexibilidad para incorporar nuevas métricas y reportes.

---

## Sugerencias para Reportes e Issues

- Plantear un issue por métrica o análisis relevante (ejemplo: "Total de incautaciones de armas por provincia").
- Documentar los prompts y resultados esperados para facilitar la automatización.
- Usar gráficos y tablas para presentar tendencias y hallazgos.

---

## Consideraciones Técnicas

- Todas las hojas se vinculan por `ID_PROCEDIMIENTO`.
- Los valores vacíos o con “-” deben tratarse como nulos/cero.
- El sistema permite análisis cruzados entre hojas.

---
