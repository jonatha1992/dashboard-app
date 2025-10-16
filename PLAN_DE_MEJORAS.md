# 📋 PLAN DE MEJORAS - Dashboard App

> **Documento generado:** 2025-10-16
> **Puntuación actual:** 7.5/10
> **Objetivo:** 9.0/10
> **Tiempo estimado total:** 3-4 semanas

---

## 🎯 OBJETIVOS DEL PLAN

1. **Seguridad**: Corregir vulnerabilidades críticas y configuraciones inseguras
2. **Performance**: Optimizar carga de datos, queries y procesamiento
3. **Calidad de Código**: Eliminar duplicación y refactorizar componentes
4. **Testing**: Implementar suite de tests frontend y mejorar coverage
5. **DX**: Mejorar experiencia de desarrollo (alias, error handling, etc.)

---

## 📅 CRONOGRAMA GENERAL

| Fase | Duración | Prioridad | Objetivo |
|------|----------|-----------|----------|
| **Fase 1: Seguridad** | 1 día | 🔴 P0 | Corregir vulnerabilidades críticas |
| **Fase 2: Performance** | 2 días | 🟡 P1 | Optimizar backend y frontend |
| **Fase 3: Refactoring** | 1 semana | 🟢 P2 | Eliminar duplicación y mejorar código |
| **Fase 4: Testing & DX** | 3 días | ⚪ P3 | Tests, tooling y documentación |

**Total: 13-15 días laborables (3 semanas)**

---

# 🔴 FASE 1: SEGURIDAD CRÍTICA (Día 1)

## Objetivo: Corregir 5 vulnerabilidades críticas identificadas

### ⏰ Tiempo estimado: ~40 minutos + testing

---

## ✅ TAREA 1.1: Configuración Django Segura (15 min)

**Archivos a modificar:**
- `backend/dashboard_project/settings.py`

### Subtareas:

#### 1.1.1: Corregir DEBUG por defecto
```python
# ANTES (línea 14)
DEBUG = config('DEBUG', default=True, cast=bool)

# DESPUÉS
DEBUG = config('DEBUG', default=False, cast=bool)
```

#### 1.1.2: Requerir SECRET_KEY obligatoria
```python
# ANTES (línea 13)
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# DESPUÉS
SECRET_KEY = config('SECRET_KEY')  # Sin default - error si no existe
```

#### 1.1.3: Remover wildcard de ALLOWED_HOSTS
```python
# ANTES (línea 20)
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '*']

# DESPUÉS
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
```

#### 1.1.4: Restringir CORS
```python
# ANTES (línea 195)
CORS_ALLOW_ALL_ORIGINS = DEBUG

# DESPUÉS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_ALL_ORIGINS = False

# Agregar también
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

**Verificación:**
```bash
cd backend
python manage.py check --deploy
```

---

## ✅ TAREA 1.2: Credenciales Seguras (10 min)

**Archivos a modificar:**
- `backend/dashboard_api/management/commands/init_users.py`

### Subtareas:

#### 1.2.1: Implementar generador de contraseñas seguras
```python
import secrets
import string

def generate_secure_password(length=16):
    """Generar contraseña segura aleatoria"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))
```

#### 1.2.2: Actualizar creación de usuarios
```python
# ANTES (línea 19)
password='admin123'
password='viewer123'

# DESPUÉS
admin_password = generate_secure_password()
viewer_password = generate_secure_password()

# Imprimir credenciales
self.stdout.write(self.style.SUCCESS(
    f'\n✅ Usuarios creados:\n'
    f'  Admin: admin / {admin_password}\n'
    f'  Viewer: viewer / {viewer_password}\n'
    f'\n⚠️  GUARDA ESTAS CONTRASEÑAS - No se mostrarán de nuevo\n'
))
```

#### 1.2.3: Actualizar .env.example
```bash
# Agregar sección de seguridad
SECRET_KEY=your-secret-key-here-generate-with-django
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
```

**Verificación:**
```bash
cd backend
python manage.py init_users
# Verificar que se imprimen contraseñas seguras
```

---

## ✅ TAREA 1.3: Validación de Archivos Upload (10 min)

**Archivos a modificar:**
- `backend/dashboard_api/serializers.py`

### Subtareas:

#### 1.3.1: Agregar validación completa
```python
# En línea 192, reemplazar validate_file():
def validate_file(self, value):
    """Validate uploaded file with security checks"""
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    # Validar tamaño
    if value.size > MAX_FILE_SIZE:
        raise serializers.ValidationError(
            f'Archivo demasiado grande. Tamaño máximo: {MAX_FILE_SIZE/1024/1024} MB'
        )

    # Validar extensión
    if not value.name.endswith(('.xlsx', '.xls')):
        raise serializers.ValidationError('Solo se permiten archivos Excel (.xlsx, .xls)')

    # Validar MIME type
    allowed_types = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    if value.content_type not in allowed_types:
        raise serializers.ValidationError('Tipo de archivo inválido')

    return value
```

**Verificación:**
```bash
# Test manual: intentar subir archivo > 10MB
# Test manual: intentar subir archivo no-Excel
```

---

## ✅ TAREA 1.4: Rate Limiting (5 min setup)

**Archivos a modificar:**
- `backend/requirements.txt`
- `backend/dashboard_api/views.py`

### Subtareas:

#### 1.4.1: Instalar django-ratelimit
```bash
# Agregar a requirements.txt
django-ratelimit==4.1.0
```

#### 1.4.2: Configurar throttling en LoginView
```python
# En views.py, línea 180
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

@method_decorator(ratelimit(key='ip', rate='5/h', method='POST'), name='post')
class LoginView(APIView):
    """Login con rate limiting - máximo 5 intentos por hora"""
    # ... resto del código
```

#### 1.4.3: Agregar rate limiting a upload
```python
@method_decorator(ratelimit(key='user', rate='10/h', method='POST'), name='post')
class DataUploadView(APIView):
    """Upload con rate limiting - máximo 10 uploads por hora"""
    # ... resto del código
```

**Verificación:**
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
# Test: hacer 6 requests de login - el 6to debe fallar
```

---

# 🟡 FASE 2: OPTIMIZACIÓN DE PERFORMANCE (Días 2-3)

## Objetivo: Mejorar tiempos de respuesta y uso de memoria

### ⏰ Tiempo estimado: ~4 horas de código + testing

---

## ✅ TAREA 2.1: Paginación en Endpoints (30 min)

**Archivos a modificar:**
- `backend/dashboard_project/settings.py`
- `backend/dashboard_api/views.py`

### Subtareas:

#### 2.1.1: Configurar paginación global
```python
# En settings.py, agregar a REST_FRAMEWORK
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'dashboard_api.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
}
```

#### 2.1.2: Crear clase de paginación customizada
```python
# En dashboard_api/pagination.py (nuevo archivo)
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000
```

#### 2.1.3: Aplicar a vistas específicas
```python
# En views.py, línea 61
from .pagination import StandardResultsSetPagination

@api_view(['GET'])
def data_list_public(request):
    data = GeografiaProcedimiento.objects.all()

    # Agregar paginación
    paginator = StandardResultsSetPagination()
    result_page = paginator.paginate_queryset(data, request)

    serializer = GeografiaProcedimientoSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)
```

**Verificación:**
```bash
curl http://localhost:8000/api/data?page=1&page_size=50
# Verificar que retorna 50 items + metadata de paginación
```

---

## ✅ TAREA 2.2: Transacciones Atómicas en Upload (15 min)

**Archivos a modificar:**
- `backend/dashboard_api/views.py`

### Subtareas:

#### 2.2.1: Envolver procesamiento en transacción
```python
# En views.py, línea 658
from django.db import transaction

class DataUploadView(APIView):
    def post(self, request):
        # ... validaciones iniciales

        try:
            with transaction.atomic():
                # Todo el procesamiento aquí
                for sheet_name in workbook.sheetnames:
                    # ... procesamiento

                # Si algo falla, TODO se revierte

                return Response({
                    'message': 'Archivo procesado exitosamente',
                    'stats': global_stats
                })
        except Exception as e:
            logger.error(f"Error procesando archivo: {str(e)}", exc_info=True)
            return Response({
                'error': f'Error al procesar archivo: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

**Verificación:**
```bash
# Test: subir archivo con datos inválidos
# Verificar que NO se crean registros parciales
```

---

## ✅ TAREA 2.3: Procesamiento en Chunks de Excel (45 min)

**Archivos a modificar:**
- `backend/dashboard_api/views.py`

### Subtareas:

#### 2.3.1: Crear método de procesamiento por chunks
```python
# En views.py, agregar método helper
def _process_sheet_in_chunks(self, sheet, sheet_name, chunk_size=100):
    """Procesar sheet en chunks para liberar memoria"""
    headers = None
    chunk_data = []

    for row_num, row in enumerate(sheet.iter_rows(values_only=True), 1):
        if row_num == 1:
            headers = row
            continue

        # Acumular en chunk
        chunk_data.append(dict(zip(headers, row)))

        # Procesar chunk cuando llegue al tamaño
        if len(chunk_data) >= chunk_size:
            yield chunk_data
            chunk_data = []  # Liberar memoria

    # Procesar último chunk
    if chunk_data:
        yield chunk_data
```

#### 2.3.2: Actualizar loop principal
```python
# En línea 686, reemplazar loop
for sheet_name in workbook.sheetnames:
    sheet = workbook[sheet_name]

    # Procesar en chunks
    for chunk in self._process_sheet_in_chunks(sheet, sheet_name):
        sheet_stats = self._process_sheet_data_to_specialized_tables(
            chunk, sheet_name, original_filename, global_stats
        )
```

**Verificación:**
```bash
# Test: subir archivo Excel grande (>5000 filas)
# Monitorear uso de memoria con htop/Task Manager
```

---

## ✅ TAREA 2.4: Optimizar Queries con select_related (30 min)

**Archivos a modificar:**
- `backend/dashboard_api/views.py`

### Subtareas:

#### 2.4.1: Agregar only() para campos específicos
```python
# En línea 65
def data_list_public(request):
    data = GeografiaProcedimiento.objects.only(
        'id_operativo', 'id_procedimiento',
        'provincia', 'provincia_key', 'departamento',
        'fecha_iso', 'latitud', 'longitud',
        'descripcion', 'unidad_interviniente'
    ).all()
```

#### 2.4.2: Usar prefetch_related para relaciones inversas
```python
# En FilteredIncautacionesView
from django.db.models import Prefetch

incautaciones = Incautaciones.objects.select_related(
    'procedimiento'
).prefetch_related(
    Prefetch('procedimiento__detenidos_aprehendidos'),
    Prefetch('procedimiento__vehiculos_controlados')
).all()
```

**Verificación:**
```bash
# Test con django-debug-toolbar
# Verificar reducción de queries N+1
```

---

## ✅ TAREA 2.5: Dividir analysisService.js (2 horas)

**Archivos a crear:**
- `frontend/src/services/analysisService/index.js`
- `frontend/src/services/analysisService/detenidos.js`
- `frontend/src/services/analysisService/incautaciones.js`
- `frontend/src/services/analysisService/helpers/groupers.js`
- `frontend/src/services/analysisService/helpers/calculators.js`

### Subtareas:

#### 2.5.1: Crear estructura de directorios
```bash
mkdir -p frontend/src/services/analysisService/helpers
```

#### 2.5.2: Extraer funciones helper
```javascript
// helpers/groupers.js
export const groupBy = (array, key) => { /* ... */ };
export const groupByProvince = (data) => { /* ... */ };
export const groupByMonth = (data) => { /* ... */ };
export const groupByYear = (data) => { /* ... */ };
```

#### 2.5.3: Crear módulos por categoría
```javascript
// detenidos.js
import { groupBy, groupByProvince } from './helpers/groupers';

export const analyzeDetenidos = (data) => {
  // Lógica específica de detenidos
};
```

#### 2.5.4: Crear index.js como orquestador
```javascript
// index.js
export { analyzeDetenidos } from './detenidos';
export { analyzeIncautaciones } from './incautaciones';
// ... resto de exports
```

#### 2.5.5: Actualizar imports en componentes
```javascript
// ANTES
import { analyzeDetenidos } from '../services/analysisService';

// DESPUÉS (mismo import, código interno modularizado)
import { analyzeDetenidos } from '../services/analysisService';
```

**Verificación:**
```bash
cd frontend
npm run build
# Verificar que no hay errores de importación
```

---

# 🟢 FASE 3: REFACTORING Y CÓDIGO LIMPIO (Semana 2)

## Objetivo: Eliminar duplicación y mejorar mantenibilidad

### ⏰ Tiempo estimado: ~8 horas de código

---

## ✅ TAREA 3.1: Consolidar FilterPanel (1 hora)

**Archivos a modificar:**
- Crear: `frontend/src/components/common/UnifiedFilterPanel.jsx`
- Eliminar: `frontend/src/components/common/FilterPanel.jsx` (MUI)
- Actualizar: `frontend/src/components/dashboard/FilterPanel.jsx`

### Subtareas:

#### 3.1.1: Crear componente unificado Tailwind
```javascript
// UnifiedFilterPanel.jsx
export const UnifiedFilterPanel = ({
  mode = 'full', // 'compact', 'full', 'dropdown'
  filters,
  onFilterChange,
  availableProvinces = [],
  availableDepartments = []
}) => {
  // Implementación única con Tailwind
  // Diferentes modos mediante props
};
```

#### 3.1.2: Actualizar componentes que usan FilterPanel
```javascript
// En cada dashboard
import { UnifiedFilterPanel } from '@/components/common/UnifiedFilterPanel';

<UnifiedFilterPanel
  mode="compact"
  filters={filters}
  onFilterChange={setFilters}
/>
```

#### 3.1.3: Eliminar componente MUI
```bash
rm frontend/src/components/common/FilterPanel.jsx
```

**Verificación:**
```bash
cd frontend
npm run dev
# Verificar que todos los dashboards muestran filtros correctamente
```

---

## ✅ TAREA 3.2: Unificar Servicios de Análisis (1.5 horas)

**Archivos a modificar:**
- `frontend/src/services/analysisService.js`
- `frontend/src/services/analyticsService.js`

### Subtareas:

#### 3.2.1: Identificar funciones duplicadas
```bash
# Buscar duplicados
grep -n "groupBy\|groupByProvince" frontend/src/services/analysis*.js
```

#### 3.2.2: Mover helpers compartidos
```javascript
// analysisService/helpers/shared.js
export const groupBy = (array, key) => { /* implementación única */ };
export const groupByProvince = (data) => { /* implementación única */ };
```

#### 3.2.3: Refactorizar analyticsService
```javascript
// analyticsService.js ahora solo usa helpers de analysisService
import { groupBy, groupByProvince } from './analysisService/helpers/shared';

class AnalysisService {
  getAnalisisTemporal(data, filters) {
    // Usa helpers compartidos
    const grouped = groupByProvince(data);
  }
}
```

**Verificación:**
```bash
# Buscar duplicados restantes
grep -A 3 "function groupBy" frontend/src/services/*.js
# Debería aparecer solo una vez
```

---

## ✅ TAREA 3.3: Crear CategoryDashboard Genérico (2 horas)

**Archivos a crear:**
- `frontend/src/components/views/CategoryDashboard.jsx`

**Archivos a refactorizar:**
- Todos los dashboards en `frontend/src/components/views/*/`

### Subtareas:

#### 3.3.1: Crear componente base genérico
```javascript
// CategoryDashboard.jsx
export const CategoryDashboard = ({
  category,           // 'detenidos', 'incautaciones', etc.
  title,              // 'Dashboard de Detenidos'
  dataKey,            // 'detenidos' (key en filteredCategorizedData)
  KPIComponent,       // Componente de KPIs específico
  TableComponent,     // Componente de tabla específico
  analysisGenerator,  // Función que genera análisis
  icon                // Icono del dashboard
}) => {
  const { filteredCategorizedData, loading } = useDashboard();
  const categoryData = filteredCategorizedData?.[dataKey] || [];

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (categoryData.length === 0) return <EmptyState />;

  const analysis = analysisGenerator(categoryData);

  return (
    <DashboardLayout title={title} icon={icon}>
      <FilterPanel compact />
      <KPIComponent analysis={analysis} />
      <DynamicChartsByCategory category={category} />
      <TableComponent data={categoryData} />
    </DashboardLayout>
  );
};
```

#### 3.3.2: Refactorizar DetenidosDashboard
```javascript
// ANTES: 150+ líneas
// DESPUÉS: 30 líneas

import { CategoryDashboard } from '../CategoryDashboard';
import { DetenidosKPIs } from './DetenidosKPIs';
import { DetenidosTable } from './DetenidosTable';

const analyzeDetenidos = (data) => ({
  totalDetenidos: data.length,
  distribucionSexo: { /* ... */ },
  // ... resto de análisis
});

export const DetenidosDashboard = () => (
  <CategoryDashboard
    category="detenidos"
    title="Dashboard de Detenidos"
    dataKey="detenidos"
    KPIComponent={DetenidosKPIs}
    TableComponent={DetenidosTable}
    analysisGenerator={analyzeDetenidos}
    icon={PersonIcon}
  />
);
```

#### 3.3.3: Aplicar a todos los dashboards
- Refactorizar: IncautacionesDashboard, AbatidosDashboard, TrataDashboard, etc.
- Eliminar código duplicado
- Mantener solo lógica específica de cada categoría

**Verificación:**
```bash
cd frontend
npm run lint
npm run build
# Verificar que no hay errores
# Verificar que todos los dashboards funcionan
```

---

## ✅ TAREA 3.4: Completar Migración a Tailwind (3 horas)

**Archivos a modificar:**
- Todos los componentes que usan MUI

### Subtareas:

#### 3.4.1: Identificar componentes MUI
```bash
grep -r "@mui" frontend/src/components --include="*.jsx" | cut -d: -f1 | sort -u
```

#### 3.4.2: Crear componentes Tailwind equivalentes
```javascript
// Para cada componente MUI, crear versión Tailwind
// Ejemplo: Card, Button, TextField, etc.
```

#### 3.4.3: Actualizar imports y código
```javascript
// ANTES
import { Card, CardContent } from '@mui/material';

// DESPUÉS
<div className="bg-white rounded-lg shadow-md p-4">
  {/* contenido */}
</div>
```

#### 3.4.4: Eliminar dependencias MUI
```bash
cd frontend
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
```

#### 3.4.5: Actualizar package.json
```bash
npm install  # Verificar que todo funciona sin MUI
```

**Verificación:**
```bash
cd frontend
npm run build
# Bundle size debería reducirse ~200KB
```

---

## ✅ TAREA 3.5: Centralizar Lógica de Categorización (20 min)

**Archivos a crear:**
- `frontend/src/utils/categorizer.js`

**Archivos a modificar:**
- `frontend/src/services/dataService.js`
- `frontend/src/services/analysisService.js`

### Subtareas:

#### 3.5.1: Crear módulo categorizer
```javascript
// categorizer.js
export const isDetenido = (item) => {
  // Implementación única
};

export const isIncautacion = (item) => {
  // Implementación única
};

// ... resto de funciones

export const CATEGORY_HIERARCHY = [
  'detenidos',
  'incautaciones',
  'abatidos',
  'trata',
  'afectados',
  'controlados',
  'procedimientos'
];

export const categorizeItem = (item) => {
  if (isDetenido(item)) return 'detenidos';
  if (isIncautacion(item)) return 'incautaciones';
  // ... resto
  return 'procedimientos';
};
```

#### 3.5.2: Actualizar servicios para usar categorizer
```javascript
// dataService.js
import { categorizeItem } from '../utils/categorizer';

export const getCategorizedData = (data) => {
  const categorized = {};

  data.forEach(item => {
    const category = categorizeItem(item);
    if (!categorized[category]) categorized[category] = [];
    categorized[category].push(item);
  });

  return categorized;
};
```

**Verificación:**
```bash
# Test: verificar que categorización es consistente
# Comparar resultados antes/después
```

---

# ⚪ FASE 4: TESTING Y DEVELOPER EXPERIENCE (Días 11-13)

## Objetivo: Implementar tests y mejorar DX

### ⏰ Tiempo estimado: ~4 horas

---

## ✅ TAREA 4.1: Setup Vitest (30 min)

**Archivos a crear:**
- `frontend/vitest.config.js`
- `frontend/src/test/setup.js`

### Subtareas:

#### 4.1.1: Instalar dependencias
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

#### 4.1.2: Configurar Vitest
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

#### 4.1.3: Crear archivo de setup
```javascript
// src/test/setup.js
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

#### 4.1.4: Agregar scripts a package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Verificación:**
```bash
npm run test -- --run
# Debería ejecutar sin errores (sin tests aún)
```

---

## ✅ TAREA 4.2: Tests Críticos de Frontend (2 horas)

**Archivos a crear:**
- `frontend/src/contexts/__tests__/DashboardContext.test.jsx`
- `frontend/src/services/__tests__/dataService.test.js`
- `frontend/src/utils/__tests__/dataUtils.test.js`

### Subtareas:

#### 4.2.1: Tests de DashboardContext
```javascript
// DashboardContext.test.jsx
import { renderHook, act } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '../DashboardContext';

describe('DashboardContext', () => {
  test('debe cargar datos al montar', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider
    });

    expect(result.current.loading).toBe(true);
    // ... más assertions
  });

  test('debe filtrar datos correctamente', () => {
    // ... test de filtrado
  });
});
```

#### 4.2.2: Tests de dataService
```javascript
// dataService.test.js
import { describe, test, expect } from 'vitest';
import { processJsonData, getCategorizedData } from '../dataService';

describe('dataService', () => {
  test('debe procesar datos JSON correctamente', () => {
    const mockData = [{ /* ... */ }];
    const result = processJsonData(mockData);
    expect(result).toHaveLength(1);
  });
});
```

#### 4.2.3: Tests de dataUtils
```javascript
// dataUtils.test.js
import { normalizeProvinceKey, parseDateToISO } from '../dataUtils';

describe('dataUtils', () => {
  test('normalizeProvinceKey debe remover tildes', () => {
    expect(normalizeProvinceKey('Córdoba')).toBe('cordoba');
  });

  test('parseDateToISO debe convertir dd/MM/yyyy', () => {
    expect(parseDateToISO('15/01/2025')).toBe('2025-01-15');
  });
});
```

**Verificación:**
```bash
npm run test:coverage
# Target: >70% coverage en utils y services
```

---

## ✅ TAREA 4.3: Configurar Alias de Rutas (15 min)

**Archivos a modificar:**
- `frontend/vite.config.js`
- `frontend/jsconfig.json` (crear)

### Subtareas:

#### 4.3.1: Actualizar vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
});
```

#### 4.3.2: Crear jsconfig.json para VSCode
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@contexts/*": ["src/contexts/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

#### 4.3.3: Actualizar imports en archivos
```javascript
// ANTES
import { useDashboard } from '../../../contexts/DashboardContext';

// DESPUÉS
import { useDashboard } from '@contexts/DashboardContext';
```

**Verificación:**
```bash
npm run dev
# Verificar que no hay errores de importación
```

---

## ✅ TAREA 4.4: Error Handler Centralizado (30 min)

**Archivos a crear:**
- `frontend/src/utils/errorHandler.js`
- `backend/dashboard_api/utils/error_handler.py`

### Subtareas:

#### 4.4.1: Crear error handler frontend
```javascript
// errorHandler.js
export class AppError extends Error {
  constructor(message, context = '', statusCode = 500) {
    super(message);
    this.context = context;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export const handleError = (error, context = '', fallback = null) => {
  console.error(`[${context}] ${error.message}`, {
    timestamp: new Date().toISOString(),
    context,
    error
  });

  // Enviar a servicio de logging (futuro)

  return fallback;
};
```

#### 4.4.2: Actualizar servicios para usar error handler
```javascript
// En apiService.js
import { handleError } from '@utils/errorHandler';

try {
  const response = await fetch(url);
  return response.json();
} catch (error) {
  return handleError(error, 'apiService.getData', []);
}
```

#### 4.4.3: Crear error handler backend
```python
# backend/dashboard_api/utils/error_handler.py
import logging

logger = logging.getLogger(__name__)

def handle_error(context, error, fallback=None):
    """Manejar errores consistentemente"""
    logger.error(f"[{context}] {str(error)}", exc_info=True)
    return fallback
```

**Verificación:**
```bash
# Test: simular error y verificar logging consistente
```

---

## ✅ TAREA 4.5: Coverage Reports (15 min)

**Archivos a crear:**
- `backend/.coveragerc`

### Subtareas:

#### 4.5.1: Instalar pytest-cov
```bash
cd backend
pip install pytest-cov
echo "pytest-cov==5.0.0" >> requirements.txt
```

#### 4.5.2: Crear .coveragerc
```ini
[run]
branch = True
omit =
    */migrations/*
    */tests/*
    */venv/*
    */.venv/*
    setup.py

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
```

#### 4.5.3: Agregar comando al pytest.ini
```ini
[pytest]
addopts = --cov=dashboard_api --cov-report=html --cov-report=term
```

**Verificación:**
```bash
pytest
# Debería generar reporte en htmlcov/
```

---

# 📊 MÉTRICAS DE ÉXITO

## Indicadores por Fase

### Fase 1: Seguridad
- ✅ 0 vulnerabilidades críticas en `python manage.py check --deploy`
- ✅ Contraseñas generadas automáticamente con 16+ caracteres
- ✅ Archivos upload limitados a 10MB
- ✅ Rate limiting activo (verificable con múltiples requests)

### Fase 2: Performance
- ✅ Tiempo de respuesta de `/api/data` < 500ms (100 items)
- ✅ Memoria estable durante upload de archivos grandes
- ✅ Reducción de 30% en queries N+1
- ✅ Bundle size frontend reducido en 15%

### Fase 3: Código
- ✅ 0 componentes FilterPanel duplicados
- ✅ 0 funciones helper duplicadas entre servicios
- ✅ 7 dashboards refactorizados a componente genérico
- ✅ 0 imports de MUI en el código

### Fase 4: Testing
- ✅ Coverage backend: >85%
- ✅ Coverage frontend: >70%
- ✅ 20+ tests críticos pasando
- ✅ Error handling consistente en 100% de servicios

---

# 🎯 CHECKLIST FINAL

## Pre-deployment Checklist

### Seguridad
- [ ] DEBUG=False en producción
- [ ] SECRET_KEY única y segura
- [ ] ALLOWED_HOSTS configurado correctamente
- [ ] CORS restringido a dominios específicos
- [ ] Rate limiting activo
- [ ] Validación de archivos upload completa
- [ ] Contraseñas default seguras

### Performance
- [ ] Paginación en todos los endpoints
- [ ] Queries optimizadas con select_related/prefetch_related
- [ ] Transacciones atómicas en operaciones críticas
- [ ] Procesamiento de Excel en chunks
- [ ] Bundle frontend optimizado

### Código
- [ ] Sin duplicación de componentes
- [ ] Sin duplicación de lógica
- [ ] Todos los imports usando alias @/
- [ ] Error handling consistente
- [ ] Linting sin warnings

### Testing
- [ ] Todos los tests pasando
- [ ] Coverage >80% backend
- [ ] Coverage >70% frontend
- [ ] Tests E2E de flujos críticos

### Documentación
- [ ] README actualizado
- [ ] API_DOCUMENTATION.md actualizado
- [ ] CHANGELOG.md creado con versiones
- [ ] Comentarios en código complejo

---

# 📝 NOTAS ADICIONALES

## Gestión de Riesgos

### Riesgo: Breaking Changes en Refactoring
**Mitigación:**
1. Crear branch `refactoring/phase-3` antes de empezar
2. Hacer commits pequeños y atómicos
3. Probar después de cada cambio
4. Mantener código viejo comentado temporalmente

### Riesgo: Regresiones en Tests
**Mitigación:**
1. Ejecutar suite completa después de cada fase
2. Mantener tests verdes en todo momento
3. Usar CI/CD para automatizar tests

### Riesgo: Dependencias Breaking
**Mitigación:**
1. Fijar versiones exactas en requirements.txt y package.json
2. Probar en ambiente de staging antes de producción
3. Mantener rollback plan

---

# 🚀 SIGUIENTE PASOS DESPUÉS DEL PLAN

1. **Setup CI/CD** (GitHub Actions)
2. **Implementar Logging Centralizado** (Sentry/LogRocket)
3. **Agregar Monitoring** (New Relic/DataDog)
4. **Implementar Caché** (Redis)
5. **WebSockets** para actualizaciones en tiempo real
6. **Mobile-first** responsive design
7. **PWA** Progressive Web App
8. **API Versioning** (v2)

---

**Documento creado por:** Claude Code
**Fecha:** 2025-10-16
**Versión:** 1.0
**Estado:** 🟢 Ready to Execute
