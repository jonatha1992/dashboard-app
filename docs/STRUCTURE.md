# Arquitectura del Sistema - Dashboard de Operaciones de Seguridad

Este documento describe la arquitectura completa del sistema full-stack después de la refactorización y simplificación arquitectural.

## 🏢 Arquitectura General

### Enfoque Full-Stack Integrado
El sistema utiliza una arquitectura de 3 capas con integración completa entre frontend y backend:

```
┌───────────────────────┐
│     FRONTEND (React 19)     │
│  - Dashboard Components     │
│  - Interactive Maps         │
│  - Charts & Analytics       │
├───────────────────────┤
│      API LAYER (REST)       │
│  - JWT Authentication      │
│  - Data Endpoints           │
│  - Excel Upload/Processing  │
├───────────────────────┤
│     BACKEND (Django 5.0)    │
│  - OperationalData Model    │
│  - Data Processing          │
│  - User Management          │
└───────────────────────┘
```

## 📁 Estructura de Directorios

### Directorio Raíz
```
dashboard-app/
├── backend/              # Backend Django con API REST
├── frontend/             # Frontend React con Vite
├── docs/                 # Documentación técnica del proyecto
├── notebooks/            # Jupyter notebooks para análisis de datos
├── scripts/              # Scripts de procesamiento de datos
├── API_DOCUMENTATION.md  # Documentación completa de la API
├── CLAUDE.md            # Guías para desarrollo con Claude
└── README.md            # Documentación principal
```

## 🏧 Backend - Arquitectura Django

### Estructura del Backend
```
backend/
├── dashboard_project/       # Configuración principal de Django
│   ├── settings.py          # Configuración de Django (DB, CORS, JWT)
│   ├── urls.py              # URLs principales del proyecto
│   └── wsgi.py              # WSGI para deployment
├── dashboard_api/           # App principal de Django
│   ├── models.py            # Modelos de datos (User, OperationalData)
│   ├── views.py             # Views de API (autenticación, datos)
│   ├── serializers.py       # Serializadores DRF
│   ├── urls.py              # URLs de la API
│   ├── authentication.py    # Autenticación JWT personalizada
│   ├── admin.py             # Configuración del admin de Django
│   └── management/commands/ # Comandos personalizados
│       └── init_users.py    # Creación de usuarios por defecto
├── static/                  # Archivos estáticos (incluye build de React)
├── templates/               # Templates HTML (incluye SPA React)
├── setup.py                 # Script de configuración automática
├── build_frontend.py        # Script de integración frontend-backend
├── manage.py                # CLI de Django
└── requirements.txt         # Dependencias de Python
```

### Modelo de Datos Simplificado
Después de la refactorización, el backend mantiene una estructura de datos optimizada:

- **User**: Modelo personalizado con roles (admin/viewer)
- **OperationalData**: Modelo unificado para todos los datos operacionales
- **Especializadas**: Modelos por hoja de Excel (GeografiaProcedimiento, Detenidos, etc.)

## 🎨 Frontend - Arquitectura React

### Estructura del Frontend
```
frontend/
├── src/
│   ├── components/          # Componentes React organizados por funcionalidad
│   │   ├── auth/            # Autenticación (Login.jsx)
│   │   ├── dashboard/       # Dashboard principal y tabla de datos
│   │   ├── charts/          # Componentes de gráficos (Chart.js)
│   │   ├── map/             # Mapas interactivos (Leaflet)
│   │   ├── analysis/        # Componentes de análisis avanzado
│   │   └── security/        # Sección de seguridad
│   ├── contexts/            # Contextos de React para estado global
│   │   ├── AuthContext.jsx   # Manejo de autenticación y usuarios
│   │   └── DashboardContext.jsx # Estado central del dashboard
│   ├── services/            # Capa de servicios para APIs
│   │   ├── apiService.js     # Cliente HTTP para backend Django
│   │   ├── dataService.js    # Lógica de datos y transformaciones
│   │   └── analysisService.js # Servicios de análisis especializados
│   ├── App.jsx              # Componente raíz con routing
│   └── main.jsx             # Punto de entrada de la aplicación
├── public/                  # Archivos estáticos y fallback data
├── package.json             # Dependencias y scripts de npm
├── vite.config.js           # Configuración de Vite
└── tailwind.config.js       # Configuración de Tailwind CSS
```

### Arquitectura de Componentes

**Patrón de Composición Centralizada**: Los componentes siguen principios de composición con funciones centralizadas:
- **Componentes de Presentación**: UI pura sin lógica de negocio
- **Componentes de Contenedor**: Lógica de estado y efectos
- **Contextos**: Estado compartido y **funciones de utilidad exportadas**
- **Servicios**: Lógica de datos usando funciones centralizadas del Context
- **Funciones Centralizadas**: Procesamiento de datos unificado desde DashboardContext

#### Funciones Centralizadas Exportadas (DashboardContext.jsx)
```javascript
// Normalización de provincias
export const normalizeProvinceKey(s)         // Normalización sin diacríticos
export const getProvinceKeyFromItem(item)    // Extracción robusta de provincia

// Procesamiento de coordenadas  
export const getCoordinatesFromItem(item)    // Extracción y validación de coordenadas

// Manejo de fechas
export const parseDateToISO(dateStr)         // Parseo dd/MM/yyyy → ISO
export const formatDateForDisplay(dateStr)   // Formateo para UI
```

## 🔄 Flujo de Datos

### Arquitectura de 3 Capas
1. **Capa de Presentación** (React):
   - Componentes interactivos
   - Manejo de estado local y global
   - Visualizaciones dinámicas

2. **Capa de API** (Django REST Framework):
   - Endpoints RESTful
   - Autenticación JWT
   - Validación y serialización

3. **Capa de Datos** (Django ORM + SQLite):
   - Modelos de datos
   - Migraciones automáticas
   - Consultas optimizadas

### Flujo de Procesamiento de Datos
```
Excel Upload → Django API → Data Processing → Database → API Response → React Components
                                                                            ↓
                                                               DashboardContext (Funciones Centralizadas)
                                                                            ↓
                                                           Normalización + Validación + Categorización
                                                                            ↓
                                                              UI Components (Maps, Charts, Tables)
```

#### Jerarquía de Categorización
El sistema implementa una categorización jerárquica con exclusión mutua:
```
detenidos > incautaciones > abatidos > trata > afectados > controlados > procedimientos
```

#### Validación de Consistencia
- **Real-time validation**: Entre `filteredData` y `filteredCategorizedData`
- **Debug logging**: Monitoreo de inconsistencias y troubleshooting
- **Performance monitoring**: Logging ocasional de estadísticas de procesamiento

## 🔧 Arquitectura de Procesamiento de Datos Centralizada

### Decisión Arquitectural: Centralización vs Distribución
Después de identificar inconsistencias en el procesamiento de datos, se implementó una **arquitectura centralizada** donde todas las funciones de procesamiento se exportan desde `DashboardContext.jsx`.

### Problema Resuelto
- **Antes**: Funciones duplicadas (`toKey()` en dataService vs normalización en Context)
- **Después**: Single source of truth con funciones exportadas y reutilizables

### Funciones Centralizadas Detalladas

#### 1. Normalización de Provincias
```javascript
// Función principal de normalización
export const normalizeProvinceKey(s)
// - Elimina diacríticos (Córdoba → CORDOBA)  
// - Convierte a mayúsculas
// - Maneja casos especiales (C.A.B.A., Tierra del Fuego)
// - Normaliza separadores y espacios

// Extracción robusta de provincia
export const getProvinceKeyFromItem(item)
// - Busca en campos candidatos extensivos:
//   ['PROVINCIA', 'provincia', 'province', 'prov', 'Provincia', 'PROV']
// - Valida y normaliza el valor encontrado
// - Retorna 'UNKNOWN' si no encuentra provincia válida
```

#### 2. Procesamiento de Coordenadas
```javascript
export const getCoordinatesFromItem(item)
// - Campos candidatos para latitud:
//   ['LATITUD', 'latitud', 'latitud_decimal', 'lat', 'latitude', 'Latitud']
// - Campos candidatos para longitud:
//   ['LONGITUD', 'longitud', 'longitud_decimal', 'lng', 'lon', 'longitude', 'Longitud']
// - Validación de rangos: lat (-90, 90), lng (-180, 180)
// - Exclusión de coordenadas inválidas como (0, 0)
// - Conversión a números con validación de tipo
```

#### 3. Procesamiento de Fechas
```javascript
export const parseDateToISO(dateStr)
// - Formato principal: dd/MM/yyyy (estándar argentino)
// - Formatos alternativos: mm/dd/yyyy, ISO formats
// - Validación de rangos de año (1900-2100)
// - Manejo robusto de errores

export const formatDateForDisplay(dateStr)
// - Conversión de ISO a formato de display
// - Manejo de errores y fallbacks
// - Formato consistente para UI
```

### Jerarquía de Categorización Implementada

#### Funciones de Categorización
```javascript
// Funciones helper exportadas (implícitamente)
isDetenido(item)        // Prioridad 1 - Detenidos y arrestos
isIncautacion(item)     // Prioridad 2 - Incautaciones y decomisos  
isAbatido(item)         // Prioridad 3 - Abatidos y enfrentamientos
isTrata(item)           // Prioridad 4 - Trata y tráfico
isAfectado(item)        // Prioridad 5 - Afectados y víctimas
isControlado(item)      // Prioridad 6 - Controles y verificaciones
// Fallback: procedimientos (no match específico)
```

#### Palabras Clave por Categoría
- **Detenidos**: detenido, arrestado, capturado, aprehendido
- **Incautaciones**: incautado, decomisado, secuestrado, confiscado
- **Abatidos**: abatido, enfrentamiento, tiroteo, baja
- **Trata**: trata, tráfico, explotación
- **Afectados**: afectado, víctima, rescatado
- **Controlados**: controlado, verificado, identificado
- **Procedimientos**: cualquier operativo que no encaje en categorías específicas

### Logging y Debugging Centralizado

#### Sistema de Logging Implementado
```javascript
// Logging de consistencia
console.warn('Inconsistencia detectada:', {
    filteredCount: filteredData.length,
    categorizedCount: filteredCategorizedData.length,
    difference: Math.abs(filteredData.length - filteredCategorizedData.length)
});

// Logging de provincias (ocasional)
if (Math.random() < 0.01) { // 1% de las veces
    console.log('🗺️ Provincias encontradas:', foundProvinces);
}

// Logging de coordenadas (ocasional)  
if (Math.random() < 0.01) {
    console.log('📍 Coordenadas procesadas:', validCoordinates.length);
}
```

### Impacto en la Arquitectura

#### Antes de la Centralización
```
dataService.js ──┐
                 ├─── toKey() (duplicado)
MapComponent ────┘

DashboardContext ─── normalizeProvinceKey() (original)
```

#### Después de la Centralización  
```
DashboardContext ── 📤 normalizeProvinceKey()
                ├── 📤 getProvinceKeyFromItem()
                ├── 📤 getCoordinatesFromItem()  
                ├── 📤 parseDateToISO()
                └── 📤 formatDateForDisplay()
                    ↙️        ↙️        ↙️
            dataService  MapComponent  Other Components
```

#### Beneficios Obtenidos
1. **Eliminación de Duplicación**: 5 funciones centralizadas vs múltiples implementaciones
2. **Consistencia Garantizada**: Una sola fuente de verdad para procesamiento
3. **Debugging Unificado**: Logging centralizado para troubleshooting
4. **Mantenibilidad**: Cambios en un solo lugar
5. **Recuperación de Datos**: Resolución de pérdida de registros (1257 → 812 → 1257)

## 🔐 Arquitectura de Seguridad

### Autenticación y Autorización
- **JWT Tokens**: Autenticación stateless
- **Role-based Access**: Admin/Viewer con permisos diferenciados
- **CORS**: Configuración para desarrollo y producción
- **CSRF Protection**: Protección nativa de Django

### Validación de Datos
- **Backend**: Validación en modelos Django y serializadores DRF
- **Frontend**: Validación en tiempo real en formularios
- **Sanitización**: Limpieza de datos de entrada

## 🚀 Deployment y Producción

### Integración Frontend-Backend
- **Build Process**: `build_frontend.py` integra React build en Django
- **Static Files**: Django sirve tanto API como SPA React
- **Single Server**: Una sola aplicación Django sirve todo el sistema

### Configuración de Producción
- **WhiteNoise**: Servir archivos estáticos en producción
- **Environment Variables**: Configuración flexible por entorno
- **Database**: SQLite para desarrollo, PostgreSQL para producción
- **Logging**: Sistema de logs estructurado

## 📊 Tecnologías y Dependencias

### Backend Stack
- **Django 5.0**: Framework web principal
- **Django REST Framework**: API REST
- **PyJWT**: Autenticación JWT
- **openpyxl**: Procesamiento de Excel
- **WhiteNoise**: Servir archivos estáticos

### Frontend Stack
- **React 19**: Library de UI
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de estilos
- **Material-UI v7**: Componentes de UI
- **Chart.js**: Visualizaciones
- **Leaflet**: Mapas interactivos
- **React Router DOM v7**: Enrutado SPA

## 🔧 Herramientas de Desarrollo

### Scripts de Automatización
- **`setup.py`**: Configuración automática del backend
- **`build_frontend.py`**: Integración automática frontend-backend
- **`init_users`**: Creación de usuarios por defecto
- **`process_excel.py`**: Procesamiento de archivos Excel

### Desarrollo Local
```bash
# Backend (Puerto 8000)
cd backend && python manage.py runserver

# Frontend (Puerto 5173) 
cd frontend && npm run dev

# Build integrado
cd backend && python build_frontend.py
```

## 📈 Métricas de Arquitectura

- **Separación de Responsabilidades**: Frontend/Backend completamente desacoplados
- **API First**: Toda la lógica de datos a través de APIs REST
- **Component-Based**: React con componentes reutilizables
- **State Management**: Context API para estado global
- **Performance**: Lazy loading y optimizaciones de bundle
- **Security**: JWT, CORS, validación de datos en ambas capas