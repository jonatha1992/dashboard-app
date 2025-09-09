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

### Database Management
- `cd backend && python manage.py shell` - Open Django shell for database operations
- `cd backend && python manage.py flush` - Clear all data from database (keep schema)
- `cd backend && python manage.py createsuperuser` - Create admin user manually

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
  - **Centralized province normalization** using `normalizeProvinceKey()` and `getProvinceKeyFromItem()`
  - **Unified coordinate extraction** using `getCoordinatesFromItem()` with robust field detection
  - **Standardized date handling** using `parseDateToISO()` and `formatDateForDisplay()`
  - **Hierarchical categorization** with mutual exclusion and priority system

#### State Management Architecture
- **DashboardContext**: Central state for data, filters, loading states, and statistics
  - **Exported utility functions**: `normalizeProvinceKey()`, `getProvinceKeyFromItem()`, `getCoordinatesFromItem()`, `parseDateToISO()`, `formatDateForDisplay()`
  - **Consistency validation**: Real-time validation between `filteredData` and `filteredCategorizedData`
  - **Debug logging**: Comprehensive logging for filter diagnostics and troubleshooting
- **AuthContext**: JWT-based authentication state management
- **Django Models**: `User` (custom with roles), `OperationalData` (main data model)
- **Filtering System**: Real-time filtering with unified province key normalization and date range handling
- **Category System**: **Hierarchical categorization** with priority order: detenidos > incautaciones > abatidos > trata > afectados > controlados > procedimientos

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
- `DashboardContext.jsx` - **Centralized utility functions exported**:
  - `normalizeProvinceKey(s)` - Province name normalization without diacritics
  - `getProvinceKeyFromItem(item)` - Extract province from item with extensive field candidates
  - `getCoordinatesFromItem(item)` - Extract coordinates with validation and extensive field search
  - `parseDateToISO(dateStr)` - Parse dates to ISO format (dd/MM/yyyy → yyyy-mm-dd)
  - `formatDateForDisplay(dateStr)` - Format dates for UI display
- `useDashboard()` hook provides centralized access to state and utilities
- **Memoized filtering** with robust date/province parsing and consistency validation
- **Real-time categorized data computation** with hierarchical categorization system

#### Data Service Layer
- `dataService.js` - **Unified data processing** using centralized DashboardContext functions:
  - Primary data loader with Excel → JSON fallback chain
  - **Hierarchical category filtering** with mutual exclusion and priority system
  - Data normalization using exported `normalizeProvinceKey()`, `getCoordinatesFromItem()`, and `parseDateToISO()`
  - **Eliminated duplicate logic** - removed local `toKey()` function in favor of centralized approach
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
- **Centralized Data Processing**: All data normalization functions exported from DashboardContext for consistency:
  - `normalizeProvinceKey()` - Single source of truth for province normalization
  - `getCoordinatesFromItem()` - Unified coordinate extraction with extensive field validation
  - `parseDateToISO()` / `formatDateForDisplay()` - Standardized date handling
- **Hierarchical Categorization**: Categories follow priority order with mutual exclusion
- **Consistency Validation**: Real-time validation between filtered datasets with debug logging
- **Robust Filtering**: Province filtering uses normalized keys without diacritics, coordinate validation excludes (0,0)
- **Multi-format Dates**: Date parsing supports dd/MM/yyyy (Argentine standard) and ISO formats
- **Map Synchronization**: Fixed React.memo issue, markers now properly re-render with filtered data
- **Debug Logging**: Comprehensive logging system for troubleshooting filter and categorization issues
- **Dual Authentication**: Supports both static file mode and authenticated API mode
- **Production Integration**: `build_frontend.py` automatically builds React and configures Django static serving
- **ESLint Configuration**: React hooks and refresh plugins enabled, ignores unused vars with capital letters
- **Default Authentication**: Backend creates admin/admin123 and viewer/viewer123 users automatically
- **CORS Configuration**: Development mode allows localhost:5173, production mode restricts appropriately

### Testing and Quality Assurance
- Frontend linting uses ESLint with React hooks and refresh plugins
- Backend follows Django best practices with proper error handling
- Data processing includes validation to prevent empty/invalid records
- Authentication supports both development and production modes
- Use `npm run lint` for frontend code quality checks

### Exported Utility Functions (DashboardContext.jsx)

The following utility functions are exported from DashboardContext for consistent data processing across all components:

#### Core Data Processing Functions
```javascript
// Province normalization
export const normalizeProvinceKey(s)
// - Removes diacritics, converts to uppercase, handles special cases
// - Used by all components for consistent province filtering

// Province extraction from data items
export const getProvinceKeyFromItem(item)
// - Searches extensive list of candidate fields: PROVINCIA, provincia, province, etc.
// - Returns normalized province key or 'UNKNOWN' if not found
// - Robust field detection with fallback handling

// Coordinate extraction from data items  
export const getCoordinatesFromItem(item)
// - Searches candidate fields: LATITUD, latitud, latitud_decimal, lat, etc.
// - Validates coordinate ranges: lat (-90 to 90), lng (-180 to 180)
// - Excludes invalid coordinates like (0,0)
// - Returns {lat, lng} object or null if invalid

// Date processing
export const parseDateToISO(dateStr)
// - Parses dd/MM/yyyy (Argentine standard) to yyyy-mm-dd ISO format
// - Handles multiple date formats with validation
// - Returns ISO date string or null if invalid

export const formatDateForDisplay(dateStr)
// - Formats ISO dates for UI display
// - Handles date conversion with error handling
```

#### Hierarchical Categorization System
- **Priority Order**: detenidos > incautaciones > abatidos > trata > afectados > controlados > procedimientos
- **Mutual Exclusion**: Each record belongs to only one primary category
- **Helper Functions**: `isDetenido()`, `isIncautacion()`, `isAbatido()`, `isTrata()`, `isAfectado()`, `isControlado()`
- **Fallback**: Records not matching specific categories are classified as "procedimientos"

#### Debug and Validation Features
- **Consistency Validation**: Real-time checks between `filteredData` and `filteredCategorizedData`
- **Logging System**: Comprehensive debug output for:
  - Province mapping and normalization issues
  - Coordinate extraction and validation
  - Category assignment and conflicts
  - Filter application results
- **Performance Monitoring**: Occasional logging of data processing statistics

### Excel Data Processing
- Excel files (`bd.xlsx`) are processed through Django backend API endpoints
- Province names are normalized using centralized `normalizeProvinceKey()` function
- Date formats are standardized using `parseDateToISO()` for consistent processing
- Validation filters prevent creation of records with empty data (marked with "-")
- Multiple sheets in Excel files are processed with proper field mapping
- Coordinate validation excludes invalid entries but preserves data integrity