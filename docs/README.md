# Documentación Técnica - Dashboard de Operaciones de Seguridad

Esta carpeta contiene toda la documentación técnica del proyecto Dashboard de Operaciones de Seguridad, un sistema full-stack para visualización y análisis de datos operacionales.

## 📚 Índice de Documentación

### 🎯 Documentos Principales

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[PLANNING.md](PLANNING.md)** | Estado del proyecto, roadmap y métricas | Product Managers, Developers |
| **[STRUCTURE.md](STRUCTURE.md)** | Arquitectura del sistema y flujos de datos | Technical Leads, Architects |
| **[TECH_STACK.md](TECH_STACK.md)** | Stack tecnológico completo y decisiones | Developers, DevOps |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Guías de deployment y configuración | DevOps, Administrators |
| **[structure_files.md](structure_files.md)** | Estructura detallada de archivos | Developers |

### 🏗️ Documentos Técnicos Avanzados

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[tech/ADR-001-Data-Processing-Centralization.md](tech/ADR-001-Data-Processing-Centralization.md)** | ADR sobre centralización de funciones de procesamiento | Technical Leads, Architects |
| **[tech/Hierarchical-Categorization-System.md](tech/Hierarchical-Categorization-System.md)** | Sistema de categorización jerárquica con exclusión mutua | Developers, Business Analysts |
| **[tech/Troubleshooting-Guide.md](tech/Troubleshooting-Guide.md)** | Guía completa de troubleshooting y debugging | Developers, Support Team |

### 🔗 Documentación Relacionada

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| **API_DOCUMENTATION.md** | `/API_DOCUMENTATION.md` | Documentación completa de API REST |
| **CLAUDE.md** | `/CLAUDE.md` | Guías de desarrollo con Claude Code |
| **README.md** | `/README.md` | Documentación principal del proyecto |
| **INTEGRATION_GUIDE.md** | `/frontend/INTEGRATION_GUIDE.md` | Guía integración frontend-backend |

## 🚀 Quick Start

### Para Desarrolladores
1. **Arquitectura**: Leer [STRUCTURE.md](STRUCTURE.md) para entender la arquitectura
2. **Setup**: Seguir las instrucciones en el README principal
3. **Tecnologías**: Revisar [TECH_STACK.md](TECH_STACK.md) para stack completo
4. **API**: Consultar `/API_DOCUMENTATION.md` para endpoints

### Para DevOps/Deployment  
1. **Deployment**: Seguir [DEPLOYMENT.md](DEPLOYMENT.md) para diferentes entornos
2. **Configuración**: Variables de entorno y seguridad
3. **Monitoreo**: Configuración de logs y health checks
4. **Scaling**: Opciones de escalabilidad y performance

### Para Project Managers
1. **Estado del Proyecto**: [PLANNING.md](PLANNING.md) para progreso actual
2. **Roadmap**: Funcionalidades completadas y próximas mejoras
3. **Métricas**: Estadísticas del proyecto y cobertura de funcionalidades

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Dashboard │  │    Maps     │  │      Analytics      │  │
│  │ Components  │  │ (Leaflet)   │  │    (Chart.js)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Context API + Services Layer              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Django 5.0)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │     API     │  │    Auth     │  │   Data Processing   │  │
│  │   (DRF)     │  │   (JWT)     │  │     (Excel)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Django ORM + Models                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (SQLite/PostgreSQL)                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Tecnologías Principales

### Frontend Stack
- **React 19** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Material-UI v7** - Components
- **Chart.js** - Visualizations
- **Leaflet** - Interactive Maps

### Backend Stack  
- **Django 5.0** - Web Framework
- **Django REST Framework** - API
- **PyJWT** - Authentication
- **WhiteNoise** - Static Files
- **openpyxl** - Excel Processing

### Infrastructure
- **SQLite/PostgreSQL** - Database
- **nginx** - Web Server
- **Docker** - Containerization
- **Heroku/Railway/DigitalOcean** - Cloud Platforms

## 📊 Métricas del Proyecto

### Desarrollo
- **Líneas de código**: ~18,000 (actualizado post-centralización)
- **Componentes React**: 30+
- **Endpoints API**: 25+
- **Modelos de datos**: 8
- **Funciones centralizadas**: 5 funciones exportadas desde DashboardContext
- **Cobertura funcional**: 98%

### Funcionalidades
- ✅ **Dashboard Interactivo** - Visualización completa de datos con consistencia garantizada
- ✅ **Mapas Dinámicos** - Geolocalización con Leaflet y sincronización en tiempo real
- ✅ **Análisis Temporal** - Tendencias y patrones por fechas con parsing robusto
- ✅ **Análisis Geográfico** - Distribución por provincias con normalización centralizada
- ✅ **Categorización Jerárquica** - Sistema de exclusión mutua con 7 categorías priorizadas
- ✅ **Autenticación JWT** - Sistema seguro con roles admin/viewer
- ✅ **Carga de Excel** - Procesamiento automático con validación avanzada
- ✅ **API REST** - Backend completo con DRF y validaciones
- ✅ **Sistema de Debug** - Logging centralizado y troubleshooting avanzado
- ✅ **Validación de Consistencia** - Monitoreo en tiempo real de integridad de datos

## 🔄 Estados del Sistema

### ✅ Completado (Producción Ready)
- **Core functionality completa** con arquitectura centralizada
- **Frontend-backend integración** optimizada y robusta
- **Autenticación y autorización** con roles diferenciados
- **Visualizaciones interactivas** con sincronización garantizada
- **Sistema de categorización jerárquica** con exclusión mutua
- **Funciones de procesamiento centralizadas** exportadas desde DashboardContext
- **Validación de consistencia** en tiempo real
- **Sistema de logging y debug** completo
- **Deployment guides** actualizados
- **Documentación técnica completa** con ADRs y troubleshooting

### 🚧 En Desarrollo (Próximas versiones)
- **Cache optimization** (Redis para funciones centralizadas)
- **Advanced analytics** con machine learning para categorización
- **Export functionality** con filtros aplicados
- **Automated testing** para funciones centralizadas
- **Performance monitoring** con métricas detalladas
- **Configuración dinámica** de keywords de categorización
- **Optimización de queries** para grandes datasets

### 📋 Backlog
- Multi-tenant support
- Real-time notifications
- Advanced reporting
- Mobile optimization
- API versioning

## 🎯 Casos de Uso

### 1. Análisis Operacional
- Visualización de operativos por ubicación geográfica
- Análisis temporal de actividades
- Métricas de performance por región
- Identificación de patrones y tendencias

### 2. Reporting y Dashboard
- Dashboard ejecutivo con KPIs
- Reportes personalizables
- Exportación de datos
- Visualizaciones interactivas

### 3. Gestión de Datos
- Carga automática de archivos Excel
- Validación y limpieza de datos
- Normalización geográfica
- Categorización automática

## 🔐 Consideraciones de Seguridad

### Autenticación
- JWT tokens con expiración
- Role-based access control (Admin/Viewer)
- Secure password handling
- CSRF protection

### Datos
- Input validation en frontend y backend
- SQL injection protection (Django ORM)
- CORS configuration
- HTTPS enforcement en producción

### Deployment
- Environment-specific configurations
- Secrets management
- SSL/TLS certificates
- Security headers

## 📞 Soporte y Contacto

### Recursos de Ayuda
- **Issues**: GitHub Issues para bugs y feature requests
- **Documentación**: Esta carpeta `/docs/` para referencia técnica
- **API Reference**: `/API_DOCUMENTATION.md` para integración
- **Development Guide**: `/CLAUDE.md` para desarrollo con Claude

### Maintenance
- **Actualizaciones**: Seguir las guías en [DEPLOYMENT.md](DEPLOYMENT.md)
- **Backup**: Configuración automática recomendada
- **Monitoring**: Health checks y logging configurados
- **Scaling**: Opciones de escalabilidad horizontal

---

## 📝 Historial de Documentación

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-09-09 | 2.1.0 | **Centralización de funciones de procesamiento y documentación completa** |
| 2025-09-08 | 2.0.0 | Refactorización completa de documentación post-simplificación |
| 2025-09-07 | 1.5.0 | Optimizaciones de performance y eliminación polling |
| 2025-09-06 | 1.4.0 | Integración completa frontend-backend |
| 2025-09-03 | 1.0.0 | Documentación inicial del proyecto |

---

*Documentación mantenida y actualizada por el equipo de desarrollo*  
*Última actualización: 2025-09-09 - Versión 2.1.0 con centralización de funciones*