# Dashboard de Operaciones de Seguridad

## 🎯 Descripción General

Sistema full-stack para la gestión, análisis y visualización de datos operacionales de seguridad. Proporciona un dashboard interactivo con mapas, gráficos y tablas dinámicas para identificar tendencias, patrones geográficos y métricas clave de los procedimientos realizados.

**Características principales:**
- 📊 **Dashboard interactivo** con métricas en tiempo real
- 🗺️ **Mapas georreferenciados** con Leaflet
- 📈 **Análisis temporal y geográfico** avanzado
- 🔐 **Autenticación JWT** con roles de usuario
- 📁 **Carga automática de Excel** con procesamiento
- 🔄 **API REST completa** para integración

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico Full-Stack

```
FRONTEND (React 19)    ←→    BACKEND (Django 5.0)    ←→    DATABASE (SQLite/PostgreSQL)
     ↕                           ↕                            ↕
 Vite + Tailwind         DRF + JWT Auth              Django ORM + Models
 Chart.js + Leaflet      Excel Processing            Data Validation
```

### Flujo de Datos Integrado
1. **Carga**: Excel → Django API → Base de datos  
2. **Procesamiento**: Normalización automática (provincias, fechas, coordenadas)
3. **API**: Endpoints RESTful con autenticación JWT
4. **Frontend**: Consumo directo de API + fallback a archivos estáticos
5. **Visualización**: Componentes React sincronizados en tiempo real

---

## ⚡ Quick Start

### Opción 1: Setup Automático (Recomendado)

**Backend:**
```bash
cd backend
python setup.py          # Setup completo automático
python manage.py runserver
```

**Frontend (desarrollo separado):**
```bash
cd frontend  
npm install
npm run dev
```

**URLs:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- Django Admin: `http://localhost:8000/admin/`

### Opción 2: Servidor Integrado

```bash
cd backend
python build_frontend.py     # Build React + integrar con Django
python manage.py runserver   # Servidor único
```

**URL:** `http://localhost:8000/` (aplicación completa)

### Credenciales por Defecto
- **Admin**: `admin` / `admin123`
- **Viewer**: `viewer` / `viewer123`

---

## 📁 Estructura del Proyecto

```
dashboard-app/
├── backend/           # Backend Django con API REST
│   ├── dashboard_api/ # Models, views, serializers
│   ├── setup.py      # Setup automático
│   └── build_frontend.py # Integración con React
├── frontend/         # Frontend React con Vite  
│   ├── src/components/ # Componentes organizados por funcionalidad
│   ├── src/contexts/  # Estado global (Auth + Dashboard)
│   └── src/services/  # Capa de comunicación con API
├── docs/             # Documentación técnica completa
├── notebooks/        # Análisis de datos con Jupyter
├── scripts/          # Utilidades de procesamiento
└── API_DOCUMENTATION.md # Documentación API REST
```

---

## 🚀 Funcionalidades

### ✅ Core Dashboard
- **Dashboard Principal** con métricas y KPIs
- **Tabla Interactiva** con filtros, búsqueda y paginación
- **Mapas Dinámicos** con marcadores georreferenciados  
- **Panel de Filtros** por fecha, provincia, categoría
- **Carga de Excel** desde interfaz web

### ✅ Análisis Avanzado
- **Análisis Geográfico**: Distribución por provincias
- **Análisis Temporal**: Tendencias por períodos
- **Categorización Automática**: Detenidos, incautaciones, etc.
- **Estado del Sistema**: Monitoreo de performance

### ✅ Autenticación y Seguridad
- **Roles de Usuario**: Admin (full access) / Viewer (read-only)
- **JWT Authentication** con tokens seguros
- **Protección CORS** y validación de datos
- **Django Admin** para gestión de usuarios

---

## 🔧 Comandos de Desarrollo

### Backend (Django)
```bash
cd backend

# Setup inicial completo
python setup.py

# Comandos Django
python manage.py runserver        # Servidor desarrollo
python manage.py migrate         # Aplicar migraciones
python manage.py init_users      # Crear usuarios por defecto
python manage.py shell           # Shell interactivo

# Build e integración
python build_frontend.py         # Integrar React build
python manage.py collectstatic   # Recopilar archivos estáticos
```

### Frontend (React + Vite)
```bash
cd frontend

# Desarrollo
npm install                       # Instalar dependencias  
npm run dev                      # Servidor desarrollo con HMR
npm run build                    # Build para producción
npm run lint                     # Linter ESLint
npm run preview                  # Preview build local
```

---

## 📊 API REST

### Endpoints Principales
- **`POST /api/auth/login`** - Autenticación JWT
- **`GET /api/auth/me`** - Usuario actual
- **`GET /api/data`** - Lista de datos operacionales
- **`GET /api/data/stats`** - Estadísticas generales
- **`POST /api/data/upload`** - Carga de archivos Excel
- **`GET /api/data/filtered/*`** - Datos especializados filtrados

### Ejemplo de Uso
```javascript
// Autenticación
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});

const { token, user } = await response.json();

// Obtener datos
const data = await fetch('/api/data', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**📖 Documentación completa:** Ver [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 🎨 Tecnologías

### Frontend Stack
- **[React 19](https://reactjs.org/)** - Librería UI con hooks y contexts
- **[Vite](https://vitejs.dev/)** - Build tool con HMR ultrarrápido
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Material-UI v7](https://mui.com/)** - Componentes UI premium
- **[Chart.js](https://www.chartjs.org/)** - Gráficos interactivos
- **[Leaflet](https://leafletjs.com/)** - Mapas interactivos
- **[React Router DOM v7](https://reactrouter.com/)** - Enrutado SPA

### Backend Stack
- **[Django 5.0](https://www.djangoproject.com/)** - Framework web Python
- **[Django REST Framework](https://www.django-rest-framework.org/)** - API REST
- **[PyJWT](https://pyjwt.readthedocs.io/)** - Autenticación JWT
- **[WhiteNoise](http://whitenoise.evans.io/)** - Archivos estáticos
- **[openpyxl](https://openpyxl.readthedocs.io/)** - Procesamiento Excel

### Database & Infrastructure
- **SQLite** (desarrollo) / **PostgreSQL** (producción)
- **nginx** + **Gunicorn** (deployment)
- **Docker** (containerización)
- **Heroku/Railway/DigitalOcean** (cloud hosting)

---

## 🚢 Deployment

### Desarrollo Local
```bash
# Opción 1: Servidores separados (recomendado desarrollo)
Terminal 1: cd backend && python manage.py runserver
Terminal 2: cd frontend && npm run dev

# Opción 2: Servidor integrado (deployment-like)
cd backend && python build_frontend.py && python manage.py runserver
```

### Producción
```bash
# Build completo
cd frontend && npm run build
cd ../backend && python build_frontend.py
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py init_users

# Con Gunicorn
gunicorn dashboard_project.wsgi --bind 0.0.0.0:8000
```

**📖 Guías completas:** Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📚 Documentación

### Documentación Técnica (`/docs/`)
- **[PLANNING.md](docs/PLANNING.md)** - Estado del proyecto y roadmap
- **[STRUCTURE.md](docs/STRUCTURE.md)** - Arquitectura del sistema  
- **[TECH_STACK.md](docs/TECH_STACK.md)** - Stack tecnológico detallado
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guías de deployment
- **[structure_files.md](docs/structure_files.md)** - Estructura de archivos

### Documentación de Desarrollo
- **[CLAUDE.md](CLAUDE.md)** - Guías para desarrollo con Claude Code
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Documentación API REST
- **[frontend/INTEGRATION_GUIDE.md](frontend/INTEGRATION_GUIDE.md)** - Integración frontend-backend

---

## 📈 Estado del Proyecto

### ✅ Completado (v2.0.0)
- ✅ **Core Dashboard** - Funcionalidad completa
- ✅ **Frontend-Backend Integration** - API REST completa  
- ✅ **Authentication System** - JWT con roles
- ✅ **Data Visualization** - Mapas, gráficos, tablas
- ✅ **Excel Processing** - Carga y procesamiento automático
- ✅ **Deployment Ready** - Guías para múltiples plataformas

### 🔄 Próximas Mejoras (v2.1.0)
- 🔄 **Performance Optimization** - Redis caching
- 🔄 **Advanced Analytics** - Reportes personalizables
- 🔄 **Export Functionality** - PDF/Excel export
- 🔄 **Testing Suite** - Unit + Integration tests

### 📋 Roadmap (v3.0.0)
- 📋 **Real-time Updates** - WebSockets integration
- 📋 **Mobile Optimization** - Responsive design improvements
- 📋 **Advanced Permissions** - Fine-grained access control
- 📋 **API Versioning** - Backward compatibility

---

## 🤝 Contribución

### Desarrollo
1. Fork el repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: añadir nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)  
5. Crear Pull Request

### Reportar Issues
- **Bugs**: Usar GitHub Issues con template de bug
- **Features**: Usar GitHub Issues con template de feature request
- **Documentation**: Improvements to docs are always welcome

---

## 📄 Licencia

Este proyecto es privado y propietario. Todos los derechos reservados.

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-org/dashboard-app/issues)
- **Documentation**: Carpeta `/docs/` para referencia técnica
- **API Reference**: `API_DOCUMENTATION.md` para integración
- **Development Guide**: `CLAUDE.md` para desarrollo con Claude Code

---

*Proyecto desarrollado con ❤️ usando React, Django y tecnologías modernas*  
*Última actualización: 2025-09-08 - v2.0.0*