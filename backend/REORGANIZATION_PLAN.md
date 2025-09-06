# 🏗️ Plan de Reorganización del Backend

## ❌ Archivos a Eliminar

### Scripts Obsoletos
```bash
# Estos archivos referencian modelos que ya no existen
rm backup_current_data.py
rm redistribute_specialized_data.py
```

### Virtual Environment Incorrecto
```bash
# Recrear venv con nombre correcto
rmdir /s venv
python -m venv .venv
```

## 📁 Nueva Estructura de Directorios

### Paso 1: Crear nueva estructura
```bash
mkdir config
mkdir config\settings
mkdir apps
mkdir apps\dashboard
mkdir apps\dashboard\models
mkdir apps\dashboard\views  
mkdir apps\dashboard\serializers
mkdir apps\dashboard\services
mkdir scripts
mkdir utils
```

### Paso 2: Mover archivos existentes

#### Configuración Django
```bash
# Mover dashboard_project -> config
move dashboard_project\settings.py config\settings\base.py
move dashboard_project\urls.py config\urls.py
move dashboard_project\wsgi.py config\wsgi.py
rmdir dashboard_project
```

#### Aplicación Principal
```bash
# Renombrar dashboard_api -> apps\dashboard
move dashboard_api apps\dashboard
```

#### Scripts Utilitarios
```bash
move setup.py scripts\setup.py
move build_frontend.py scripts\build_frontend.py
```

### Paso 3: Separar modelos grandes

#### apps/dashboard/models/core.py
- `User`
- `GeografiaProcedimiento`

#### apps/dashboard/models/specialized.py  
- `VehiculosPersonasControladas`
- `PersonalElementosAfectados`
- `DetenidosAprehendidos`
- `Incautaciones`
- `TrataTraficPersonas`
- `OtrosDelitos`
- `OtrosEventos`
- `Fallecidos`
- `Abatidos`
- `CodigoOperativo`

#### apps/dashboard/models/warehouse.py
- `DimTiempo`
- `DimGeografia` 
- `FactProcedimientos`
- `AggMensualProvincia`
- `AggMensualDepartamento`

### Paso 4: Separar vistas

#### apps/dashboard/views/auth.py
- `LoginView`
- `CurrentUserView`

#### apps/dashboard/views/data.py
- `DataListView`
- `DataStatsView`
- `DataUploadView`
- `DataClearView`
- Specialized data views

#### apps/dashboard/views/analytics.py
- `AnalisisTemporalView`
- `AnalisisGeograficoView`
- `ComparisonAnalysisView`

### Paso 5: Actualizar imports
- Actualizar todos los imports para reflejar nueva estructura
- Modificar settings.py para usar nueva configuración
- Actualizar DJANGO_SETTINGS_MODULE en manage.py

## 🔧 Comandos de Ejecución

### Activar entorno virtual (Windows)
```bash
.venv\Scripts\activate
```

### Comandos de desarrollo
```bash
python manage.py runserver     # Servidor desarrollo
python scripts\setup.py       # Setup inicial
python scripts\build_frontend.py  # Build frontend
```

## ✅ Beneficios de la Reorganización

1. **Separación de Responsabilidades**: Cada archivo tiene un propósito específico
2. **Mejor Organización**: Archivos relacionados agrupados en directorios
3. **Escalabilidad**: Fácil agregar nuevos módulos
4. **Mantenibilidad**: Código más fácil de navegar y mantener
5. **Buenas Prácticas**: Sigue convenciones Django estándar

## 🚨 Archivos Críticos a Mantener

- `manage.py` - Utilidad Django
- `requirements.txt` - Dependencias
- `dashboard_api/authentication.py` - JWT auth personalizado
- `dashboard_api/urls.py` - Rutas API
- `dashboard_api/migrations/` - Migraciones DB
- `.env.example` - Configuración ejemplo