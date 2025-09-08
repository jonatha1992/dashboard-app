# Deployment Guide - Dashboard de Operaciones de Seguridad

Este documento proporciona guías completas para deployar el sistema en diferentes entornos, desde desarrollo local hasta producción empresarial.

## 🚀 Opciones de Deployment

### Resumen de Ambientes
- **Desarrollo Local**: Servidores separados (Frontend + Backend)
- **Integrado Local**: Un solo servidor Django sirviendo todo
- **Staging/Testing**: Deployment en cloud para pruebas
- **Producción**: Deployment escalable y seguro

## 🏠 Desarrollo Local

### Opción 1: Servidores Separados (Recomendado para desarrollo)

**Backend (Puerto 8000):**
```bash
cd backend
python setup.py                    # Setup inicial automático
python manage.py runserver
```

**Frontend (Puerto 5173):**
```bash
cd frontend
npm install                        # Instalar dependencias
npm run dev                       # Servidor de desarrollo con HMR
```

**URLs de acceso:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- Django Admin: `http://localhost:8000/admin/`

### Opción 2: Servidor Integrado (Deployment-like local)

```bash
cd backend
python build_frontend.py          # Construir e integrar React
python manage.py collectstatic --noinput
python manage.py runserver        # Servidor único para todo
```

**URL de acceso:**
- Aplicación completa: `http://localhost:8000/`

## 🌐 Deployment en Producción

### Prerrequisitos Generales

**Variables de Entorno (.env):**
```bash
# Base de datos
DATABASE_URL=postgresql://user:password@localhost/dashboard_db

# Seguridad
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_EXPIRATION_HOURS=24
```

### 1. Heroku Deployment

**Preparación:**
```bash
# Instalar Heroku CLI
# Crear cuenta en Heroku

# En el directorio del proyecto
heroku create dashboard-operaciones-seguridad
```

**Procfile (crear en raíz):**
```
web: cd backend && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn dashboard_project.wsgi --log-file -
```

**Deploy:**
```bash
# Configurar variables de entorno
heroku config:set DEBUG=False
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set ALLOWED_HOSTS="your-app.herokuapp.com"

# Deploy
git push heroku main

# Configurar base de datos
heroku run python backend/manage.py migrate
heroku run python backend/manage.py init_users
```

### 2. DigitalOcean App Platform

**app.yaml:**
```yaml
name: dashboard-operaciones
services:
- name: web
  source_dir: /
  github:
    repo: your-username/dashboard-app
    branch: main
  run_command: cd backend && python manage.py migrate && python build_frontend.py && python manage.py collectstatic --noinput && gunicorn dashboard_project.wsgi
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DEBUG
    value: "False"
  - key: ALLOWED_HOSTS
    value: "your-app.ondigitalocean.app"
databases:
- name: dashboard-db
  engine: PG
  size: db-s-dev-database
```

### 3. Railway Deployment

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Nixpacks.toml:**
```toml
[phases.build]
cmds = [
  "cd frontend && npm ci && npm run build",
  "cd backend && pip install -r requirements.txt",
  "cd backend && python build_frontend.py"
]

[phases.deploy]
cmd = "cd backend && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn dashboard_project.wsgi"
```

### 4. Docker Deployment

**Dockerfile:**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Backend
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./backend/static/

# Variables de entorno
ENV PYTHONPATH=/app/backend
ENV DJANGO_SETTINGS_MODULE=dashboard_project.settings

# Coleccionar archivos estáticos
RUN cd backend && python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "cd backend && python manage.py migrate && python manage.py init_users && gunicorn dashboard_project.wsgi --bind 0.0.0.0:8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:password@db:5432/dashboard_db
    depends_on:
      - db
    volumes:
      - ./data:/app/data

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: dashboard_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy con Docker:**
```bash
docker-compose up --build -d
```

## 🔧 Scripts de Deployment

### Script de Build Automático

**deploy.sh:**
```bash
#!/bin/bash

echo "🚀 Iniciando deployment..."

# 1. Frontend build
echo "📦 Construyendo frontend..."
cd frontend
npm ci
npm run build
cd ..

# 2. Backend setup
echo "🏗️ Configurando backend..."
cd backend
python build_frontend.py
python manage.py migrate
python manage.py collectstatic --noinput

# 3. Inicializar usuarios si es necesario
python manage.py init_users

echo "✅ Deployment completado!"
```

### Script de Actualización

**update.sh:**
```bash
#!/bin/bash

echo "🔄 Actualizando aplicación..."

# Git pull
git pull origin main

# Frontend rebuild
cd frontend
npm ci
npm run build
cd ..

# Backend update
cd backend
pip install -r requirements.txt
python build_frontend.py
python manage.py migrate
python manage.py collectstatic --noinput

# Restart service (systemd example)
sudo systemctl restart dashboard-app

echo "✅ Actualización completada!"
```

## 🔒 Configuración de Seguridad en Producción

### 1. Variables de Entorno de Seguridad

```bash
# Generación de SECRET_KEY segura
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# .env de producción
SECRET_KEY=your-generated-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 2. Configuración de NGINX

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/your/app/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /path/to/your/app/backend/media/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### 3. Systemd Service (Linux)

**dashboard-app.service:**
```ini
[Unit]
Description=Dashboard Operaciones Seguridad
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/path/to/dashboard-app/backend
ExecStart=/path/to/venv/bin/gunicorn --daemon --workers 3 --bind 127.0.0.1:8000 dashboard_project.wsgi
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

**Comandos systemd:**
```bash
sudo systemctl enable dashboard-app
sudo systemctl start dashboard-app
sudo systemctl status dashboard-app
```

## 📊 Monitoreo y Logging

### 1. Configuración de Logs Django

**settings.py (producción):**
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/dashboard-app/django.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Health Check Endpoint

El sistema incluye un endpoint de health check en `/api/` que retorna el estado del sistema.

### 3. Monitoring con Prometheus (Opcional)

**django-prometheus settings:**
```python
INSTALLED_APPS = [
    'django_prometheus',
    # ... otras apps
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    # ... otros middlewares
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]
```

## 🔄 CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && pip install -r requirements.txt
    
    - name: Build application
      run: |
        cd frontend && npm run build
        cd ../backend && python build_frontend.py
    
    - name: Run tests
      run: |
        cd frontend && npm run lint
        cd ../backend && python manage.py test
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## ⚡ Optimizaciones de Performance

### 1. Configuración de Cache (Redis)

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

### 2. Configuración de Base de Datos

**PostgreSQL optimizado:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'dashboard_db',
        'USER': 'dashboard_user',
        'PASSWORD': 'secure_password',
        'HOST': '127.0.0.1',
        'PORT': '5432',
        'OPTIONS': {
            'MAX_CONNS': 20,
        }
    }
}
```

### 3. Configuración de Archivos Estáticos

```python
# Compresión de archivos estáticos
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Cache de archivos estáticos
WHITENOISE_MAX_AGE = 31536000  # 1 año
```

## 🆘 Troubleshooting

### Problemas Comunes

**1. Error de CORS:**
```python
# Verificar CORS_ALLOWED_ORIGINS en settings.py
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "http://localhost:5173",  # Solo para desarrollo
]
```

**2. Error de archivos estáticos:**
```bash
cd backend
python manage.py collectstatic --noinput --clear
```

**3. Error de base de datos:**
```bash
cd backend
python manage.py migrate
python manage.py init_users
```

**4. Problemas de permisos (Linux):**
```bash
sudo chown -R www-data:www-data /path/to/dashboard-app/
sudo chmod -R 755 /path/to/dashboard-app/
```

### Logs Útiles

```bash
# Logs de aplicación
tail -f /var/log/dashboard-app/django.log

# Logs de NGINX
tail -f /var/log/nginx/error.log

# Logs de systemd
journalctl -u dashboard-app -f
```

## ✅ Checklist de Deployment

### Pre-deployment
- [ ] Variables de entorno configuradas
- [ ] Base de datos configurada
- [ ] Frontend construido (`npm run build`)
- [ ] Backend configurado (`python build_frontend.py`)
- [ ] Archivos estáticos recolectados (`collectstatic`)
- [ ] Migraciones aplicadas (`migrate`)
- [ ] Usuarios iniciales creados (`init_users`)

### Post-deployment
- [ ] SSL/HTTPS configurado
- [ ] Health check funcionando
- [ ] Logs configurados
- [ ] Backup automático configurado
- [ ] Monitoreo configurado
- [ ] Autenticación funcionando
- [ ] Carga de datos Excel funcionando
- [ ] Todas las funcionalidades probadas

---

*Guía de deployment actualizada - 2025-09-08*