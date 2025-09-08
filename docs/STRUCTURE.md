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

**Patrón de Composición**: Los componentes siguen principios de composición y reutilización:
- **Componentes de Presentación**: UI pura sin lógica de negocio
- **Componentes de Contenedor**: Lógica de estado y efectos
- **Contextos**: Estado compartido entre componentes
- **Servicios**: Lógica de datos y comunicación con APIs

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
```

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