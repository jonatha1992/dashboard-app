# Django Dashboard Backend

Backend Django monolítico para el Sistema de Monitoreo de Operaciones.

## 🚀 Características

- **Backend API REST** compatible con el frontend React existente
- **Autenticación JWT** equivalente al backend Node.js
- **Upload de archivos Excel** con procesamiento automático
- **Servicio de archivos estáticos** para el frontend React en producción
- **Panel de administración Django** para gestión de datos
- **Base de datos SQLite** (configurable para PostgreSQL/MySQL)

## 📋 Requisitos

- Python 3.8+
- Node.js (para compilar el frontend)
- npm o yarn

## ⚡ Instalación Rápida

### 1. Setup automático
```bash
cd django_backend
python setup.py
```

### 2. Build del frontend
```bash
python build_frontend.py
```

### 3. Iniciar servidor
```bash
python manage.py runserver
```

## 🛠️ Instalación Manual

### 1. Crear entorno virtual
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Configurar base de datos
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py init_users
```

### 4. (Opcional) Crear superusuario adicional
```bash
python manage.py createsuperuser
```

## 🔧 Configuración

### Variables de Entorno (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
JWT_SECRET_KEY=your-jwt-secret-key-here
```

### Usuarios por defecto
- **Admin**: `admin` / `admin123`
- **Viewer**: `viewer` / `viewer123`

## 🌐 Endpoints API

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Datos
- `GET /api/data` - Obtener todos los datos
- `GET /api/data/stats` - Estadísticas
- `POST /api/data/upload` - Subir archivo Excel (admin)
- `DELETE /api/data/clear` - Limpiar datos (admin)

### Salud
- `GET /api/` - Health check

## 🏗️ Desarrollo vs Producción

### Modo Desarrollo (DEBUG=True)
- CORS habilitado para localhost:5173
- Archivos estáticos servidos por Django
- API disponible en `/api/`

### Modo Producción (DEBUG=False)
- Frontend React servido desde `/`
- Archivos estáticos optimizados con WhiteNoise
- CORS restringido
- Compresión y caché habilitados

## 📁 Estructura del Proyecto

```
django_backend/
├── dashboard_project/          # Configuración principal Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── dashboard_api/              # Aplicación API
│   ├── models.py              # Modelos de datos
│   ├── views.py               # Vistas/endpoints
│   ├── serializers.py         # Serialización DRF
│   ├── authentication.py     # Autenticación JWT
│   └── management/commands/   # Comandos personalizados
├── templates/                 # Templates HTML
│   └── index.html            # Template React
├── static/                   # Archivos estáticos del frontend
├── staticfiles/              # Archivos estáticos recolectados
├── build_frontend.py         # Script de build
├── setup.py                  # Script de setup
└── requirements.txt          # Dependencias Python
```

## 🔄 Workflow de Deployment

### 1. Desarrollo
```bash
# Terminal 1: Django backend
python manage.py runserver

# Terminal 2: React frontend (desarrollo separado)
cd ..
npm run dev
```

### 2. Producción
```bash
# Build completo
python build_frontend.py

# Iniciar servidor de producción
python manage.py runserver 0.0.0.0:8000
```

## 📊 Panel de Administración

Accede a `http://localhost:8000/admin/` con credenciales de admin para:

- Gestionar usuarios
- Ver/editar datos operacionales
- Monitorear uploads
- Administrar sesiones

## 🗃️ Modelos de Datos

### User (Usuario personalizado)
- Extiende AbstractUser de Django
- Campo `role` (admin/viewer)
- Timestamps automáticos

### OperationalData
- Datos operacionales de Excel
- Geolocalización (latitud/longitud)
- Fechas normalizadas automáticamente
- Metadatos de importación
- Campos adicionales en JSON

## 🔐 Seguridad

- Autenticación JWT compatible con frontend existente
- Permisos basados en roles (admin/viewer)
- CORS configurado apropiadamente
- Validación de uploads de archivos
- Sanitización automática de datos

## 🚨 Troubleshooting

### Error: "No module named 'dashboard_api'"
```bash
# Asegúrate de estar en el directorio correcto
cd django_backend
python manage.py runserver
```

### Error: "Authentication credentials were not provided"
```bash
# Verifica que el token JWT esté en el header
Authorization: Bearer <token>
```

### Frontend no se carga en producción
```bash
# Rebuild del frontend
python build_frontend.py
python manage.py collectstatic --noinput
```

## 📝 Comandos Útiles

```bash
# Ver datos en shell
python manage.py shell
>>> from dashboard_api.models import OperationalData
>>> OperationalData.objects.count()

# Limpiar base de datos
python manage.py flush

# Crear backup
python manage.py dumpdata > backup.json

# Restaurar backup
python manage.py loaddata backup.json
```

## 🤝 Migración desde Node.js

Este backend Django es **100% compatible** con el frontend React existente:

- ✅ Mismos endpoints API
- ✅ Mismo formato de respuestas JSON
- ✅ Misma autenticación JWT
- ✅ Mismo procesamiento de archivos Excel
- ✅ Misma lógica de filtrado y estadísticas

**Simplemente cambia la URL base de `http://localhost:3002` a `http://localhost:8000` en el frontend.**