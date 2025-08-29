# Contexto del Proyecto

## 🎯 Propósito Principal
Dashboard interactivo para visualizar y analizar datos de operativos de seguridad, mostrando información en mapas, gráficos y tablas.

## 🏗️ Estado Actual
- **Fase**: Post-construcción
- **Estado**: En desarrollo activo
- **Versión**: 1.0.0 (inicial)

## 🛠️ Componentes Clave
1. **Fuente de Datos**: `data/bd.xlsx`
   - Procesado a JSON mediante `convert_excel.py`
   - Datos organizados por operativos con `ID_OPERATIVO` como clave

2. **Frontend**
   - Aplicación React con Vite
   - Visualización con Leaflet (mapas) y Chart.js (gráficos)
   - Estilos con Tailwind CSS

3. **Automatización**
   - Workflows en `.windsurf/workflows.yaml`
   - Procesamiento automático de datos
   - Construcción del frontend

## 🔄 Flujo de Datos
1. **Entrada**: Archivo Excel (`bd.xlsx`)
2. **Procesamiento**: Conversión a JSON
3. **Visualización**: Dashboard interactivo

## 📂 Estructura Principal
```
.
├── data/               # Datos fuente
├── public/             # Archivos estáticos
│   └── data/json/      # JSON procesados
└── src/                # Código fuente
    ├── components/     # Componentes React
    ├── contexts/       # Estado global
    └── services/       # Lógica de negocio
```

## 🚀 Siguientes Pasos
1. Implementar visualización de mapas
2. Desarrollar gráficos estadísticos
3. Añadir filtros interactivos
4. Mejorar el diseño responsive
