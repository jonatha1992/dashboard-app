# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React/Vite)
- `cd frontend && npm run dev` - Start development server at http://localhost:5173
- `cd frontend && npm run build` - Build for production  
- `cd frontend && npm run lint` - Run ESLint linter
- `cd frontend && npm run preview` - Preview production build locally

### Backend (Django)
- `cd backend && python setup.py` - Initialize backend with virtual environment, dependencies, database, and sample users
- `cd backend && python manage.py runserver` - Start Django development server at http://localhost:8000
- `cd backend && python manage.py migrate` - Apply database migrations
- `cd backend && python manage.py makemigrations` - Create new migrations
- `cd backend && python build_frontend.py` - Build React frontend and integrate with Django static serving
- `cd backend && python manage.py init_users` - Create default admin/viewer users
- `cd backend && python manage.py collectstatic --noinput` - Collect static files for production

## Project Architecture

This is a full-stack security operations dashboard with a React frontend and Django backend. The application visualizes security operatives data through interactive maps, charts, and tables.

### Project Structure
```
dashboard-app/
├── frontend/           # React/Vite frontend application  
│   ├── src/
│   │   ├── components/ # UI components (auth, charts, dashboard, map, security)
│   │   ├── contexts/   # React contexts (DashboardContext, AuthContext)
│   │   ├── services/   # Data services (dataService, apiService)
│   │   └── main.jsx    # Entry point
│   └── public/data/    # Static data files (Excel/JSON)
├── backend/            # Django REST API backend
│   ├── dashboard_project/  # Django project settings
│   ├── dashboard_api/      # Main Django app with models, views, serializers
│   ├── templates/          # HTML templates (including built React app)
│   ├── static/            # Static files (including built React assets)
│   ├── setup.py           # Automated setup script
│   └── build_frontend.py  # Frontend build integration script
├── notebooks/          # Jupyter notebooks for data processing
└── scripts/            # Data processing utilities
```

### Key Technologies
- **Frontend**: React 19, Vite, Material-UI v7, Tailwind CSS, React Router DOM v7
- **Backend**: Django 5.0, Django REST Framework, JWT authentication, WhiteNoise
- **Charts**: Chart.js with react-chartjs-2  
- **Maps**: Leaflet with react-leaflet
- **Data Processing**: XLSX library, openpyxl (Python), pandas
- **Database**: SQLite (configurable for PostgreSQL/MySQL)

### Data Flow Architecture

#### Dual Data Source Strategy
1. **API Mode**: Frontend authenticates with Django backend and fetches processed data via REST API
2. **Static Data Mode**: Frontend loads Excel/JSON files directly from `/public/data/` (fallback)
3. **Fallback Chain**: Backend API → Excel file → JSON fallback → empty state (no fake data)

#### Data Processing Pipeline
- Raw Excel (`bd.xlsx`) → Django models → REST API → React frontend
- Backend processes Excel uploads and stores in `OperationalData` model
- Frontend `processJsonData()` normalizes data with:
  - Standardized province names and keys (`PROVINCIA_KEY`) for robust filtering
  - Parsed coordinates (LATITUD/LONGITUD as floats)  
  - ISO date normalization (`FECHA_ISO` in yyyy-mm-dd format)
  - Categorization by operation type using keyword matching

#### State Management Architecture
- **DashboardContext**: Central state for data, filters, loading states, and statistics
- **AuthContext**: JWT-based authentication state management
- **Django Models**: `User` (custom with roles), `OperationalData` (main data model)
- **Filtering System**: Real-time filtering with province key normalization and date range handling
- **Category System**: Dynamic categorization based on content keywords (detenidos, controlados, afectados, etc.)

### Backend Architecture Patterns

#### Django REST API Structure
- `dashboard_api/models.py:41` - `OperationalData` model with geographic data, dates, metadata
- `dashboard_api/views.py` - JWT-authenticated API endpoints for data CRUD operations
- `dashboard_api/serializers.py` - DRF serializers for API responses
- `dashboard_api/authentication.py` - Custom JWT authentication compatible with frontend
- `dashboard_api/admin.py` - Django admin interface for data management

#### Authentication & Authorization
- Custom `User` model extending `AbstractUser` with role-based permissions (admin/viewer)
- JWT token authentication compatible with existing frontend `AuthContext`
- Role-based access control for data upload/modification operations
- Default users created via `init_users` management command (admin/admin123, viewer/viewer123)

#### Data Management
- Excel file upload processing with automatic field mapping and validation
- Province name normalization using `normalize_provincia()` for consistent filtering
- Date parsing supporting multiple formats (dd/mm/yyyy, ISO) with fallback handling
- Unique record identification using composite `record_key` field
- JSON field for storing additional/dynamic data from Excel files

### Frontend Architecture Patterns

#### Context-Based State Management  
- `DashboardContext.jsx:192` - `useDashboard()` hook provides centralized access
- `DashboardContext.jsx:84` - Memoized filtering with robust date/province parsing
- `DashboardContext.jsx:155` - Real-time categorized data computation

#### Data Service Layer
- `dataService.js:9` - Primary data loader with Excel → JSON fallback chain
- `dataService.js:175` - Category filtering based on description/intervention type keywords
- `dataService.js:81` - Data normalization including province key generation
- `apiService.js` - Backend integration with JWT authentication and API calls

#### Component Structure
```
frontend/src/components/
├── auth/           # Login/authentication components
├── charts/         # Chart.js wrappers and visualization components
├── dashboard/      # Main dashboard, filters, data table, Excel upload
├── map/           # Leaflet map integration with popup details  
└── security/      # Security-specific data sections and statistics
```

### Development Workflow

#### Full-Stack Development
```bash
# Terminal 1: Django backend
cd backend && python manage.py runserver

# Terminal 2: React frontend (separate development)
cd frontend && npm run dev
```

#### Production Build & Integration
```bash
# Build React and integrate with Django
cd backend && python build_frontend.py

# Start integrated server (serves React + API)
cd backend && python manage.py runserver
```

### Data Model and Relationships
- **Primary Key**: `ID_OPERATIVO` links related data across all categories and systems
- **Geographic Data**: Core location/date info with LATITUD/LONGITUD coordinates
- **Date Handling**: Multi-format parsing (dd/mm/yyyy, ISO) with backend normalization to `fecha_iso`  
- **Province Normalization**: Diacritic removal and key-based matching for consistent filtering
- **Categories**: Dynamic filtering into detenidos, controlados, afectados, procedimientos, abatidos, trata, incautaciones
- **Metadata**: Import tracking with `archivo_original`, `fecha_importacion`, `hoja` (Excel sheet name)

### Key Implementation Notes
- **No Demo Data**: Application shows "no data" states instead of fake data when sources unavailable
- **Robust Filtering**: Province filtering uses normalized keys (`PROVINCIA_KEY`) without diacritics  
- **Multi-format Dates**: Date parsing supports dd/mm/yyyy and ISO formats with normalization to `FECHA_ISO`
- **Dual Authentication**: Supports both static file mode and authenticated API mode
- **Production Integration**: `build_frontend.py` automatically builds React and configures Django static serving
- **ESLint Configuration**: React hooks and refresh plugins enabled, ignores unused vars with capital letters (`varsIgnorePattern: '^[A-Z_]'`)
- **Default Authentication**: Backend creates admin/admin123 and viewer/viewer123 users automatically
- **CORS Configuration**: Development mode allows localhost:5173, production mode restricts appropriately