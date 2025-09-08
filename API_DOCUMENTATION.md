# API REST - Dashboard Backend

Documentación completa de la API REST del backend Django para el dashboard de operaciones de seguridad.

## Información General

- **Base URL**: `http://localhost:8000/api/`
- **Autenticación**: JWT Bearer Token
- **Formato de respuesta**: JSON
- **Versión**: 2.0.0

## Autenticación

### POST `/auth/login`
Iniciar sesión y obtener token JWT.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Credenciales inválidas"
}
```

### GET `/auth/me`
Obtener información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

## Health Check

### GET `/`
Verificar estado del servidor.

**Response (200 OK):**
```json
{
  "message": "Dashboard Django API - Nueva Estructura",
  "version": "2.0.0",
  "status": "running"
}
```

## Endpoints Públicos de Datos

### GET `/public/data`
Obtener todos los datos categorizados (sin autenticación).

**Response (200 OK):**
```json
{
  "procedimientos": [
    {
      "id": 1,
      "ID_OPERATIVO": "OP001",
      "FECHA": "15/01/2025",
      "FECHA_ISO": "2025-01-15",
      "HORA": "10:30",
      "DESCRIPCION": "Operativo de control vehicular",
      "TIPO_INTERVENCION": "Control vehicular",
      "PROVINCIA": "BUENOS AIRES",
      "PROVINCIA_KEY": "BUENOS_AIRES",
      "DEPARTAMENTO_O_PARTIDO": "La Plata",
      "LATITUD": -34.9214,
      "LONGITUD": -57.9544
    }
  ],
  "detenidos": [
    {
      "id": 1,
      "ID_OPERATIVO": "OP001",
      "NACIONALIDAD": "Argentina",
      "EDAD": "25",
      "SEXO": "M"
    }
  ],
  "incautaciones": [
    {
      "id": 1,
      "ID_OPERATIVO": "OP001",
      "TIPO_INCAUTACION": "Drogas",
      "CANTIDAD": "5",
      "UNIDAD": "gramos"
    }
  ],
  "controlados": [...],
  "afectados": [...],
  "trata": [...],
  "abatidos": [...]
}
```

### GET `/public/stats`
Obtener estadísticas generales de datos (sin autenticación).

**Response (200 OK):**
```json
{
  "totalRecords": 1500,
  "dateRange": {
    "earliest": "2025-01-01",
    "latest": "2025-01-31"
  },
  "provinces": ["BUENOS AIRES", "CORDOBA", "SANTA FE"],
  "categoryCounts": {
    "procedimientos": 1500,
    "detenidos": 250,
    "incautaciones": 180,
    "controlados": 800,
    "afectados": 400,
    "trata": 15,
    "abatidos": 5
  }
}
```

### GET `/data`
Obtener datos de procedimientos (sin autenticación - DRF).

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "id_operativo": "OP001",
    "provincia": "BUENOS AIRES",
    "fecha_iso": "2025-01-15",
    "latitud": "-34.9214",
    "longitud": "-57.9544"
  }
]
```

### GET `/data/stats`
Estadísticas de datos usando DRF (sin autenticación).

**Response (200 OK):**
```json
{
  "totalRecords": 1500,
  "sheets": ["GEOG. PROCEDIMIENTO", "DETENIDOS APREHENDIDOS"],
  "dateRange": {
    "earliest": "2025-01-01T00:00:00Z",
    "latest": "2025-01-31T23:59:59Z"
  },
  "provinces": ["BUENOS AIRES", "CORDOBA", "SANTA FE"]
}
```

## Endpoints de Datos Especializados

### GET `/data/detenidos`
Obtener solo datos de detenidos/aprehendidos.

**Response (200 OK):**
```json
[
  {
    "ID_OPERATIVO": "OP001",
    "ID_PROCEDIMIENTO": "PROC001",
    "PROVINCIA": "BUENOS AIRES",
    "FECHA": "15/01/2025",
    "EDAD": 25,
    "SEXO": "M",
    "NACIONALIDAD": "Argentina",
    "SITUACION_PROCESAL": "Detenido",
    "DELITO_IMPUTADO": "Tráfico de drogas",
    "JUZGADO_INTERVINIENTE": "Juzgado Federal N°1",
    "LATITUD": -34.9214,
    "LONGITUD": -57.9544,
    "DESCRIPCIÓN": "Operativo antidrogas",
    "LOCALIDAD": "La Plata"
  }
]
```

### GET `/data/incautaciones`
Obtener solo datos de incautaciones.

**Response (200 OK):**
```json
[
  {
    "ID_OPERATIVO": "OP001",
    "ID_PROCEDIMIENTO": "PROC001",
    "PROVINCIA": "BUENOS AIRES",
    "FECHA": "15/01/2025",
    "TIPO": "Drogas",
    "SUBTIPO": "Cocaína",
    "CANTIDAD": "500",
    "MEDIDAS": "gramos",
    "AFORO": 50000.0,
    "TIPO_DELITO": "Tráfico",
    "LATITUD": -34.9214,
    "LONGITUD": -57.9544
  }
]
```

### GET `/data/trata`
Obtener solo datos de trata y tráfico de personas.

### GET `/data/fallecidos`
Obtener solo datos de fallecidos.

### GET `/data/abatidos`
Obtener solo datos de abatidos.

## Endpoints de Datos Filtrados

### GET `/data/filtered/incautaciones`
Incautaciones filtradas (solo registros con datos reales).

### GET `/data/filtered/detenidos`
Detenidos filtrados (solo registros con edad válida).

### GET `/data/filtered/controlados`
Controlados filtrados (solo registros con controles reales).

### GET `/data/filtered/afectados`
Afectados filtrados (solo registros con personal > 0).

## Estadísticas Especializadas

### GET `/data/specialized-stats`
Estadísticas de todas las tablas especializadas.

**Response (200 OK):**
```json
{
  "incautaciones_count": 180,
  "detenidos_count": 250,
  "controlados_count": 800,
  "afectados_count": 400,
  "trata_count": 15,
  "otros_delitos_count": 25,
  "otros_eventos_count": 30,
  "fallecidos_count": 8,
  "abatidos_count": 5,
  "codigos_count": 1500,
  "total_specialized_records": 3213
}
```

### GET `/data/filtering-stats`
Estadísticas detalladas de filtrado.

**Response (200 OK):**
```json
[
  {
    "tabla": "Incautaciones",
    "registros_total": 1500,
    "registros_filtrados": 180,
    "registros_omitidos": 1320,
    "porcentaje_reduccion": 88.0,
    "criterio_filtrado": "INCAUTACIONES ≠ \"-\""
  },
  {
    "tabla": "Detenidos",
    "registros_total": 1500,
    "registros_filtrados": 250,
    "registros_omitidos": 1250,
    "porcentaje_reduccion": 83.33,
    "criterio_filtrado": "EDAD ≠ \"-\""
  }
]
```

## Gestión de Datos (Requiere Autenticación)

### POST `/data/upload`
Subir archivo Excel con datos operacionales (Solo Admin).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
Form-data:
- file: [archivo Excel]
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Datos cargados exitosamente con nueva estructura",
  "stats": {
    "totalAdded": 1500,
    "duplicatesSkipped": 50,
    "sheetsProcessed": [
      {
        "name": "GEOG. PROCEDIMIENTO",
        "totalRows": 1500,
        "added": 1500,
        "skipped": 0
      }
    ],
    "specialized_tables": {
      "geografia_procedimientos": 1500,
      "detenidos": 250,
      "incautaciones": 180
    }
  },
  "filtering_details": [...],
  "total_records_processed": 1500,
  "total_records_created": 3213,
  "etl_result": {
    "status": "success",
    "message": "ETL ejecutado automáticamente"
  }
}
```

**Response (403 Forbidden):**
```json
{
  "error": "Permisos insuficientes"
}
```

### DELETE `/data/clear`
Limpiar todos los datos (Solo Admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Todos los datos han sido eliminados (nueva estructura)"
}
```

## Data Warehouse y Análisis

### GET `/dw/status/`
Estado del Data Warehouse.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "ready",
  "fact_count": 1500,
  "dim_tiempo_count": 365,
  "dim_geografia_count": 24,
  "last_etl_run": "2025-01-15T10:30:00Z",
  "aggregations": {
    "agg_mensual_provincia": 120,
    "agg_mensual_departamento": 450
  }
}
```

### POST `/dw/etl/run/`
Ejecutar proceso ETL del Data Warehouse.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "ETL completado exitosamente",
  "execution_time": "45.2s",
  "records_processed": 1500,
  "dimensions_updated": ["tiempo", "geografia"],
  "aggregations_created": 570
}
```

### GET `/dw/etl/status/`
Estado del proceso ETL.

### GET `/dw/provincias/`
Lista de provincias disponibles en DW.

**Response (200 OK):**
```json
[
  {
    "provincia_key": "BUENOS_AIRES",
    "provincia_nombre": "Buenos Aires",
    "total_procedimientos": 650
  },
  {
    "provincia_key": "CORDOBA",
    "provincia_nombre": "Córdoba", 
    "total_procedimientos": 420
  }
]
```

## Análisis Temporal y Geográfico

### GET `/dw/analysis/temporal/`
Análisis temporal por provincia.

**Parameters:**
- `provincia`: Clave de provincia (opcional)
- `year`: Año (default: 2025)
- `grain`: Granularidad - monthly/quarterly (default: monthly)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "provincia_key": "BUENOS_AIRES",
  "year": 2025,
  "grain": "monthly",
  "data": [
    {
      "año_mes": "2025-01",
      "provincia_nombre": "Buenos Aires",
      "provincia_key": "BUENOS_AIRES",
      "total_procedimientos": 150,
      "total_detenidos": 25,
      "total_incautaciones": 18,
      "total_vehiculos_controlados": 80,
      "mes_nombre": "Enero",
      "mes": 1,
      "año": 2025
    }
  ]
}
```

### GET `/dw/analysis/geografico/`
Análisis geográfico por departamentos.

**Parameters:**
- `provincia`: Clave de provincia (requerida)
- `year`: Año (default: 2025)
- `top`: Número de top departamentos (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "provincia_key": "BUENOS_AIRES",
  "year": 2025,
  "departamentos": [
    {
      "departamento_nombre": "La Plata",
      "total_procedimientos": 85,
      "total_detenidos": 15,
      "total_incautaciones": 12,
      "provincia_nombre": "Buenos Aires"
    }
  ]
}
```

### GET `/dw/analysis/comparison/`
Análisis comparativo entre provincias.

**Parameters:**
- `year`: Año (default: 2025)
- `metric`: Métrica - procedimientos/detenidos/incautaciones (default: procedimientos)
- `top`: Número de provincias (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

## Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **400 Bad Request**: Datos de entrada inválidos
- **401 Unauthorized**: Credenciales inválidas o token faltante
- **403 Forbidden**: Permisos insuficientes (operación de admin)
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Roles de Usuario

- **admin**: Acceso completo, puede subir/eliminar datos
- **viewer**: Solo lectura de datos

## Estructura de Datos

### Modelo Principal: GeografiaProcedimiento
- Tabla maestra con información geográfica y temporal
- Contiene: ID_OPERATIVO, coordenadas, fecha, provincia, descripción

### Tablas Especializadas
- **DetenidosAprehendidos**: Personas detenidas
- **Incautaciones**: Bienes incautados
- **VehiculosPersonasControladas**: Controles vehiculares
- **PersonalElementosAfectados**: Personal y recursos utilizados
- **TrataTraficPersonas**: Casos de trata
- **Fallecidos/Abatidos**: Eventos fatales
- **OtrosDelitos/OtrosEventos**: Otros tipos de casos

## Filtrado Inteligente

El sistema aplica filtros automáticos para evitar registros vacíos:

- **Detenidos**: Solo si EDAD ≠ "-"
- **Incautaciones**: Solo si INCAUTACIONES ≠ "-"
- **Controlados**: Solo si hay vehículos o personas controladas
- **Afectados**: Solo si CANT_EFECTIVOS > 0

## Notas de Implementación

- Todos los endpoints públicos no requieren autenticación
- Los endpoints de gestión de datos requieren rol "admin"
- Los endpoints de análisis requieren autenticación básica
- El sistema ejecuta ETL automáticamente después de cada upload
- Las coordenadas se validan automáticamente (≠ 0, ≠ null)
- Las fechas se normalizan a formato ISO (yyyy-mm-dd)
- Los nombres de provincias se normalizan para filtrado consistente