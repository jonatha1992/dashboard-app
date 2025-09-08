# File Tree: Dashboard de Operaciones de Seguridad

**Generado**: 2025-09-08  
**Estado**: Post-refactorización arquitectural  
**Descripción**: Estructura actualizada del proyecto full-stack

## 📁 Directorio Raíz

```
dashboard-app/
├── 📁 .claude/                    # Configuración de Claude Code
│   ├── 📄 settings.local.json     # Configuración local específica
│   └── 📁 claude-code-chat-images/ # Imágenes de conversaciones
├── 📁 backend/                    # Backend Django - API REST
│   ├── 📁 dashboard_project/      # Configuración principal de Django
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 settings.py         # Configuración Django (DB, CORS, JWT)
│   │   ├── 🐍 urls.py             # URLs principales del proyecto
│   │   └── 🐍 wsgi.py             # WSGI para deployment
│   ├── 📁 dashboard_api/          # App principal de Django
│   │   ├── 📁 management/         # Comandos Django personalizados
│   │   │   ├── 📁 commands/
│   │   │   │   ├── 🐍 __init__.py
│   │   │   │   └── 🐍 init_users.py # Creación usuarios por defecto
│   │   │   └── 🐍 __init__.py
│   │   ├── 📁 migrations/         # Migraciones de base de datos
│   │   │   ├── 🐍 0001_initial.py
│   │   │   ├── 🐍 0002_add_dw_models.py
│   │   │   └── 🐍 __init__.py
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 admin.py            # Configuración Django Admin
│   │   ├── 🐍 apps.py             # Configuración de la app
│   │   ├── 🐍 authentication.py   # Autenticación JWT personalizada
│   │   ├── 🐍 models.py           # Modelos de datos (User, OperationalData)
│   │   ├── 🐍 serializers.py      # Serializadores DRF
│   │   ├── 🐍 urls.py             # URLs de la API
│   │   └── 🐍 views.py            # Views de API REST
│   ├── 📁 static/                 # Archivos estáticos (incluye React build)
│   ├── 📁 templates/              # Templates HTML (incluye SPA React)
│   │   └── 🌐 index.html          # Template principal para SPA
│   ├── 📄 .env.example            # Ejemplo de variables de entorno
│   ├── 📖 README.md               # Documentación del backend
│   ├── 🐍 build_frontend.py       # Script integración frontend-backend
│   ├── 📄 db.sqlite3              # Base de datos SQLite (desarrollo)
│   ├── 🐍 manage.py               # CLI de Django
│   ├── 📄 requirements.txt        # Dependencias Python
│   └── 🐍 setup.py                # Script de configuración automática
├── 📁 docs/                       # Documentación técnica completa
│   ├── 📝 PLANNING.md             # Estado del proyecto y roadmap
│   ├── 📝 STRUCTURE.md            # Arquitectura del sistema
│   ├── 📝 TECH_STACK.md           # Stack tecnológico detallado
│   └── 📝 structure_files.md      # Este archivo - estructura de archivos
├── 📁 frontend/                   # Frontend React con Vite
│   ├── 📁 public/                 # Archivos públicos estáticos
│   │   └── 🖼️ vite.svg            # Logo de Vite
│   ├── 📁 src/                    # Código fuente React
│   │   ├── 📁 assets/             # Assets estáticos importables
│   │   │   └── 🖼️ react.svg       # Logo de React
│   │   ├── 📁 components/         # Componentes React organizados
│   │   │   ├── 📁 analysis/       # Componentes de análisis avanzado
│   │   │   │   ├── 📄 AnalysisMain.jsx      # Vista principal análisis
│   │   │   │   ├── 📄 ComparisonDashboard.jsx # Dashboard comparativo
│   │   │   │   ├── 📄 GeographicAnalysis.jsx # Análisis geográfico
│   │   │   │   └── 📄 TimeAnalysis.jsx      # Análisis temporal
│   │   │   ├── 📁 auth/           # Componentes autenticación
│   │   │   │   └── 📄 Login.jsx   # Formulario de login
│   │   │   ├── 📁 charts/         # Componentes de gráficos
│   │   │   │   ├── 📄 BaseChart.jsx    # Componente base para gráficos
│   │   │   │   ├── 📄 CategoryCharts.jsx # Gráficos por categoría
│   │   │   │   ├── 📄 ProvinceChart.jsx  # Gráfico provincial
│   │   │   │   └── 📄 TrendChart.jsx     # Gráfico de tendencias
│   │   │   ├── 📁 dashboard/      # Componentes dashboard principal
│   │   │   │   ├── 📄 Dashboard.jsx      # Dashboard principal
│   │   │   │   ├── 📄 DataTable.jsx      # Tabla interactiva de datos
│   │   │   │   ├── 📄 ExcelUpload.jsx    # Carga de archivos Excel
│   │   │   │   ├── 📄 FilterPanel.jsx    # Panel de filtros
│   │   │   │   ├── 📄 StatCard.jsx       # Tarjetas estadísticas
│   │   │   │   ├── 📄 SystemStatusView.jsx # Estado del sistema
│   │   │   │   └── 📄 UnifiedFilter.jsx  # Filtros unificados
│   │   │   ├── 📁 map/            # Componentes de mapas
│   │   │   │   └── 📄 MapComponent.jsx   # Mapa Leaflet interactivo
│   │   │   └── 📁 security/       # Componentes seguridad
│   │   │       └── 📄 SecuritySection.jsx # Sección de seguridad
│   │   ├── 📁 contexts/           # Contextos React (estado global)
│   │   │   ├── 📄 AuthContext.jsx # Context de autenticación
│   │   │   └── 📄 DashboardContext.jsx # Context central dashboard
│   │   ├── 📁 services/           # Capa de servicios
│   │   │   ├── 📄 analysisService.js     # Servicios análisis
│   │   │   ├── 📄 apiService.js          # Cliente HTTP Django
│   │   │   ├── 📄 dataService.js         # Lógica datos y transformación
│   │   │   └── 📄 securityStatsService.js # Estadísticas seguridad
│   │   ├── 📄 App.jsx             # Componente raíz con routing
│   │   ├── 🎨 index.css           # Estilos globales
│   │   ├── 📄 main.jsx            # Punto entrada aplicación
│   │   └── 📄 test-imports.js     # Testing de imports
│   ├── 📝 INTEGRATION_GUIDE.md    # Guía de integración
│   ├── 📄 eslint.config.js        # Configuración ESLint
│   ├── 🌐 index.html              # HTML principal SPA
│   ├── 📄 package-lock.json       # Lock file dependencias
│   ├── 📄 package.json            # Dependencias y scripts npm
│   ├── 📄 postcss.config.js       # Configuración PostCSS
│   ├── 📄 tailwind.config.js      # Configuración Tailwind CSS
│   └── 📄 vite.config.js          # Configuración Vite
├── 📁 notebooks/                  # Jupyter notebooks análisis datos
│   ├── 📁 data/                   # Datos para análisis
│   │   ├── 📁 informes_mensuales/ # Informes mensuales Excel
│   │   │   ├── 📊 INFORME ABRIL 2025.xlsx
│   │   │   ├── 📊 INFORME ENERO 2025.xlsx
│   │   │   ├── 📊 INFORME FEBRERO 2025.xlsx
│   │   │   ├── 📊 INFORME JULIO 2025.xlsx
│   │   │   ├── 📊 INFORME JUNIO 2025.xlsx
│   │   │   ├── 📊 INFORME MARZO 2025.xlsx
│   │   │   └── 📊 INFORME MAYO 2025.xlsx
│   │   └── 📁 json/               # Datos procesados JSON
│   └── 📓 merge_and_convert.ipynb # Notebook conversión datos
├── 📁 scripts/                    # Scripts utilidades
│   └── 🐍 process_excel.py        # Procesamiento archivos Excel
├── 📄 .env.example                # Ejemplo variables entorno
├── 🚫 .gitignore                  # Exclusiones Git
├── 📝 API_DOCUMENTATION.md        # Documentación completa API REST
├── 📝 CLAUDE.md                   # Guías desarrollo con Claude
├── 📖 README.md                   # Documentación principal proyecto
└── 🐍 check_dates.py              # Script verificación fechas
```

## 📊 Métricas del Proyecto

### Estadísticas Generales
- **Total archivos**: ~135 archivos de código
- **Líneas de código**: ~15,000 líneas
- **Tecnologías**: 20+ librerías principales
- **Componentes React**: 25+ componentes reutilizables
- **Endpoints API**: 20+ endpoints RESTful

### Distribución por Área
```
Backend (Django):     ~45% del código
Frontend (React):     ~45% del código
Documentación:        ~5% del código
Scripts/Notebooks:    ~5% del código
```

## 🔑 Archivos Clave

### Configuración Principal
- **`backend/dashboard_project/settings.py`**: Configuración Django completa
- **`frontend/package.json`**: Dependencias y scripts frontend
- **`backend/requirements.txt`**: Dependencias Python
- **`CLAUDE.md`**: Guías de desarrollo

### Puntos de Entrada
- **`frontend/src/main.jsx`**: Entry point aplicación React
- **`backend/manage.py`**: CLI Django
- **`frontend/src/App.jsx`**: Componente raíz React
- **`backend/dashboard_api/urls.py`**: Routing API

### Scripts de Automatización
- **`backend/setup.py`**: Setup automático backend
- **`backend/build_frontend.py`**: Integración frontend-backend
- **`backend/dashboard_api/management/commands/init_users.py`**: Usuarios por defecto

### Documentación
- **`docs/PLANNING.md`**: Estado del proyecto
- **`docs/STRUCTURE.md`**: Arquitectura sistema
- **`docs/TECH_STACK.md`**: Stack tecnológico
- **`API_DOCUMENTATION.md`**: Documentación API completa

## 🚦 Estado de Archivos

### ✅ Archivos Activos (En uso)
- Todos los archivos en `frontend/src/`
- Todos los archivos en `backend/dashboard_api/` (excepto eliminados)
- Documentación en `docs/`
- Scripts de configuración

### ❌ Archivos Eliminados (Refactorización)
- `backend/dashboard_api/analysis_views.py` - Views DW eliminadas
- `backend/dashboard_api/dw_models.py` - Modelos DW eliminados
- `backend/dashboard_api/dw_serializers.py` - Serializadores DW eliminados
- `backend/dashboard_api/etl_dimensions.py` - ETL eliminado
- `backend/REORGANIZATION_PLAN.md` - Plan obsoleto
- `backend/check_db_structure.py` - Script obsoleto
- `backend/redistribute_specialized_data.py` - Script obsoleto

### 🔧 Archivos de Desarrollo
- `notebooks/` - Análisis de datos y desarrollo
- `scripts/` - Utilidades de procesamiento
- `frontend/src/test-imports.js` - Testing

## 🌊 Flujo de Datos por Archivos

### 1. Carga de Datos
```
Excel → backend/dashboard_api/views.py → models.py → Database
```

### 2. API REST
```
frontend/services/apiService.js → backend/dashboard_api/urls.py → views.py → serializers.py
```

### 3. Frontend Rendering
```
main.jsx → App.jsx → contexts/DashboardContext.jsx → components/
```

### 4. Build & Deployment
```
frontend/vite.config.js → build → backend/build_frontend.py → static/
```

---
*Estructura generada automáticamente - Refleja estado post-refactorización 2025-09-08*