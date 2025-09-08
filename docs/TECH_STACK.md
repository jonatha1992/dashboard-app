# Stack Tecnológico - Dashboard de Operaciones de Seguridad

Este documento detalla las tecnologías, librerías y herramientas utilizadas en el sistema completo después de la refactorización arquitectural.

## 🔧 Arquitectura Full-Stack

### Enfoque Tecnológico
El sistema utiliza un stack moderno de desarrollo web con enfoque en performance, escalabilidad y mantenibilidad:

```
React 19 + Vite + Tailwind CSS (Frontend)
           ↕ HTTP/REST API
Django 5.0 + DRF + JWT (Backend)
           ↕ ORM
SQLite/PostgreSQL (Database)
```

## 🎨 Frontend Technologies

### Core Framework
- **[React 19](https://reactjs.org/)**: Librería principal de UI
  - Componentes funcionales con hooks
  - Context API para state management
  - Concurrent features y Suspense
  - Error boundaries para manejo de errores

### Build Tools & Development
- **[Vite](https://vitejs.dev/)**: Build tool ultrarrápido
  - Hot Module Replacement (HMR) instantáneo
  - Bundle optimization automático
  - Plugin ecosystem extenso
  - TypeScript support out-of-the-box

- **[ESLint](https://eslint.org/)**: Linting de código JavaScript/JSX
  - React hooks plugin
  - React refresh plugin
  - Configuración personalizada para el proyecto

### UI Framework & Styling
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utility-first
  - Diseños responsive sin media queries manuales
  - Purging automático de CSS no utilizado
  - Configuración personalizada para el proyecto
  - Dark mode support nativo

- **[Material-UI v7](https://mui.com/)**: Componentes de UI premium
  - Componentes accesibles out-of-the-box
  - Theming system completo
  - Icons library integrada
  - Date pickers y formularios avanzados

### Navigation & Routing
- **[React Router DOM v7](https://reactrouter.com/)**: Enrutado SPA
  - Navegación declarativa
  - Lazy loading de rutas
  - Protected routes para autenticación
  - Browser history management

### Data Visualization
- **[Chart.js](https://www.chartjs.org/)**: Librería de gráficos
  - Gráficos responsive y animados
  - Múltiples tipos: barras, líneas, donut, radar
  - Plugins para funcionalidades avanzadas
  - **[react-chartjs-2](https://react-chartjs-2.js.org/)**: Wrapper para React

- **[Leaflet](https://leafletjs.com/)**: Mapas interactivos
  - Mapas ligeros y performantes
  - Soporte para múltiples tile providers
  - Marcadores personalizables
  - **[react-leaflet](https://react-leaflet.js.org/)**: Integración con React

### Data Processing & Utilities
- **[XLSX](https://docs.sheetjs.com/)**: Procesamiento de archivos Excel
  - Lectura y escritura de archivos .xlsx
  - Soporte para múltiples hojas
  - Conversión automática de tipos de datos

## 🏢 Backend Technologies

### Core Framework
- **[Django 5.0](https://www.djangoproject.com/)**: Framework web de Python
  - ORM potente con migraciones automáticas
  - Admin interface incorporado
  - Security features built-in
  - Middleware system extensible
  - Management commands personalizados

### API Framework
- **[Django REST Framework](https://www.django-rest-framework.org/)**: Toolkit para APIs REST
  - Serializadores automáticos desde modelos
  - ViewSets y Generic Views
  - Pagination, filtering, y ordering
  - API browsable para desarrollo
  - Throttling y permissions granulares

### Authentication & Security
- **[PyJWT](https://pyjwt.readthedocs.io/)**: JSON Web Tokens
  - Autenticación stateless
  - Token expiration y refresh
  - Algoritmos de signing seguros
  - Custom claims support

- **[django-cors-headers](https://github.com/adamchainz/django-cors-headers)**: CORS handling
  - Cross-origin resource sharing
  - Configuración flexible por endpoints
  - Desarrollo y producción modes

### Data Processing
- **[openpyxl](https://openpyxl.readthedocs.io/)**: Manipulación de archivos Excel
  - Lectura de archivos .xlsx
  - Preservación de formato y metadatos
  - Handling de fórmulas y datos complejos

- **[pandas](https://pandas.pydata.org/)** (opcional): Análisis de datos
  - DataFrames para procesamiento masivo
  - Operaciones de limpieza y transformación
  - Integración con openpyxl

### Static Files & Deployment
- **[WhiteNoise](http://whitenoise.evans.io/)**: Servir archivos estáticos
  - Optimizado para deployment en producción
  - Compresión automática
  - Cache headers optimizados
  - No requiere servidor web separado

## 🗄️ Database Technologies

### Development Database
- **[SQLite](https://www.sqlite.org/)**: Base de datos local
  - Zero configuration
  - File-based storage
  - Perfecto para desarrollo y testing
  - Full SQL support

### Production Database (Recommended)
- **[PostgreSQL](https://www.postgresql.org/)**: Base de datos empresarial
  - ACID compliance
  - JSON field support nativo
  - Advanced indexing
  - Extensiones geoespaciales (PostGIS)

## 🔧 Development Tools

### Version Control & Collaboration
- **[Git](https://git-scm.com/)**: Control de versiones distribuido
- **[GitHub](https://github.com)**: Hosting de repositorio y collaboration

### Code Editors & IDE
- **[Visual Studio Code](https://code.visualstudio.com/)**: Editor recomendado
  - Python extension pack
  - JavaScript/React extensions
  - Django template support
  - Git integration

### Package Management
- **[npm](https://www.npmjs.com/)**: Gestor de paquetes para Node.js
  - Dependency management
  - Scripts automation
  - Security auditing

- **[pip](https://pip.pypa.io/)**: Gestor de paquetes para Python
  - Virtual environments support
  - Requirements.txt management
  - Package versioning

### Development Servers
- **Vite Dev Server**: Frontend development (Puerto 5173)
- **Django Development Server**: Backend API (Puerto 8000)
- **Concurrent Development**: Frontend + Backend simultáneo

## 📊 Data Analysis & Processing

### Jupyter Ecosystem
- **[Jupyter Notebooks](https://jupyter.org/)**: Interactive data analysis
  - Exploratory data analysis (EDA)
  - Data visualization prototypes
  - Documentation with code

### Python Data Libraries
- **[pandas](https://pandas.pydata.org/)**: Data manipulation y análisis
- **[matplotlib](https://matplotlib.org/)**: Plotting library básica
- **[seaborn](https://seaborn.pydata.org/)**: Statistical data visualization

## 🚀 Deployment & Production

### Production Server Options
- **[Gunicorn](https://gunicorn.org/)**: WSGI HTTP Server para Django
- **[nginx](https://nginx.org/)**: Reverse proxy y static file server
- **[Docker](https://www.docker.com/)**: Containerización para deployment

### Cloud Platforms (Recomendadas)
- **[Heroku](https://www.heroku.com/)**: Platform as a Service
- **[DigitalOcean](https://www.digitalocean.com/)**: VPS con app platform
- **[Railway](https://railway.app/)**: Modern deployment platform
- **[Render](https://render.com/)**: Static sites y web services

### Environment Management
- **[python-dotenv](https://github.com/theskumar/python-dotenv)**: Environment variables
- **Virtual Environments**: Aislamiento de dependencias Python
- **Environment-specific configs**: Desarrollo/Testing/Producción

## 🔒 Security Considerations

### Frontend Security
- **Content Security Policy (CSP)**: XSS protection
- **HTTPS Only**: Secure data transmission
- **Input Sanitization**: Validación en formularios
- **JWT Storage**: Secure token handling

### Backend Security
- **Django Security Middleware**: Multiple security headers
- **CSRF Protection**: Cross-site request forgery prevention
- **SQL Injection Protection**: ORM parameterized queries
- **Rate Limiting**: API throttling

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Lazy loading de componentes
- **Bundle Analysis**: Webpack bundle analyzer
- **Image Optimization**: Formatos modernos y compression
- **Caching Strategy**: Browser cache y service workers

### Backend Optimization
- **Database Indexing**: Query optimization
- **API Caching**: Redis/Memcached integration
- **Compression**: Gzip para responses
- **Connection Pooling**: Database connection optimization

## 🧪 Testing & Quality Assurance

### Frontend Testing (Planned)
- **[Vitest](https://vitest.dev/)**: Unit testing framework
- **[React Testing Library](https://testing-library.com/react)**: Component testing
- **[Cypress](https://www.cypress.io/)**: E2E testing

### Backend Testing (Planned)
- **[pytest](https://pytest.org/)**: Python testing framework
- **[Django Test Framework](https://docs.djangoproject.com/en/5.0/topics/testing/)**: Integration testing
- **[coverage.py](https://coverage.readthedocs.io/)**: Code coverage analysis

## 📋 Development Standards

### Code Style & Formatting
- **ESLint**: JavaScript/React code standards
- **Prettier**: Code formatting automation
- **Black** (Python): Code formatting para backend
- **flake8** (Python): Style guide enforcement

### Documentation Standards
- **Markdown**: Documentación técnica
- **JSDoc**: JavaScript code documentation
- **Django Docstrings**: Python code documentation
- **API Documentation**: OpenAPI/Swagger specs

## 🎯 Technology Decision Rationale

### Why This Stack?

**Frontend (React + Vite):**
- ✅ Component-based architecture scales bien
- ✅ Ecosystem maduro con gran soporte
- ✅ Performance excelente con Vite
- ✅ Tooling robusto para desarrollo

**Backend (Django + DRF):**
- ✅ Rapid development con ORM poderoso
- ✅ Admin interface built-in
- ✅ Security features por defecto
- ✅ Escalabilidad probada en producción

**Database (SQLite → PostgreSQL):**
- ✅ Desarrollo simple con SQLite
- ✅ Production-ready con PostgreSQL
- ✅ Django ORM abstrae diferencias
- ✅ Migrations automáticas