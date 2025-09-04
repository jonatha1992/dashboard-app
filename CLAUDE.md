# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (main application)
- `cd frontend && npm run dev` - Start development server (Vite) at http://localhost:5173
- `cd frontend && npm run build` - Build for production
- `cd frontend && npm run lint` - Run ESLint linter
- `cd frontend && npm run preview` - Preview production build locally

### Django Backend (optional API server)
- `cd django_backend && python manage.py runserver` - Start Django development server
- `cd django_backend && python manage.py migrate` - Apply database migrations
- `cd django_backend && python setup.py` - Initialize backend with sample data

## Project Architecture

This is a full-stack security operations dashboard with a React frontend and optional Django backend. The application visualizes security operatives data through interactive maps, charts, and tables.

### Project Structure
```
dashboard-app/
├── frontend/           # React/Vite frontend application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── contexts/   # React contexts
│   │   ├── services/   # Data services
│   │   └── main.jsx    # Entry point
│   └── public/data/    # Static data files
├── django_backend/     # Django REST API (optional)
├── notebooks/          # Jupyter notebooks for data processing
└── scripts/            # Data processing utilities
```

### Key Technologies
- **Frontend**: React 19, Vite, Material-UI (v7), Tailwind CSS
- **Backend**: Django 5.0, Django REST Framework, JWT authentication
- **Charts**: Chart.js with react-chartjs-2
- **Maps**: Leaflet with react-leaflet
- **Data Processing**: XLSX library, pandas (Python)
- **Routing**: React Router DOM v7

### Data Flow Architecture

#### Dual Data Source Strategy
1. **Static Data Mode**: Frontend loads Excel/JSON files directly from `/public/data/`
2. **API Mode**: Frontend authenticates with Django backend and fetches processed data via REST API
3. **Fallback Chain**: Excel file → JSON fallback → empty state (no fake data)

#### Data Processing Pipeline
- Raw Excel (`bd.xlsx`) → `processJsonData()` → normalized format with:
  - Standardized province names and keys (`PROVINCIA_KEY`) for robust filtering
  - Parsed coordinates (LATITUD/LONGITUD as floats)
  - ISO date normalization (`FECHA_ISO` in yyyy-mm-dd format)
  - Categorization by operation type using keyword matching

#### State Management Architecture
- **DashboardContext**: Central state for data, filters, loading states, and statistics
- **AuthContext**: JWT-based authentication state management
- **Filtering System**: Real-time filtering with province key normalization and date range handling
- **Category System**: Dynamic categorization based on content keywords (detenidos, controlados, afectados, etc.)

### Component Architecture Patterns

#### Context-Based State Management
- `DashboardContext.jsx:192` - `useDashboard()` hook provides centralized access
- `DashboardContext.jsx:84` - Memoized filtering with robust date/province parsing
- `DashboardContext.jsx:155` - Real-time categorized data computation

#### Data Service Layer
- `dataService.js:9` - Primary data loader with Excel → JSON fallback
- `dataService.js:175` - Category filtering based on description/intervention type keywords
- `dataService.js:81` - Data normalization including province key generation
- `apiService.js` - Backend integration with JWT authentication

#### Component Structure
```
frontend/src/
├── components/
│   ├── auth/           # Login/authentication components
│   ├── charts/         # Chart.js wrappers and visualization components  
│   ├── dashboard/      # Main dashboard, filters, data table, excel upload
│   ├── map/           # Leaflet map integration with popup details
│   └── security/      # Security-specific data sections
├── contexts/          # React contexts for state management
├── services/          # Data loading, API, and processing services
└── App.jsx           # Router setup and authentication guard
```

### Data Model and Relationships
- **Primary Key**: `ID_OPERATIVO` links related data across all categories
- **Geographic Data**: Core location/date info with LATITUD/LONGITUD coordinates
- **Date Handling**: Multi-format parsing (dd/mm/yyyy, ISO) with fallback to ISO normalization
- **Province Normalization**: Diacritic removal and key-based matching for consistent filtering
- **Categories**: Dynamic filtering into detenidos, controlados, afectados, procedimientos, abatidos, trata, incautaciones

### Key Implementation Notes
- **No Demo Data**: Application shows "no data" states instead of fake data when sources unavailable
- **Robust Filtering**: Province filtering uses normalized keys (`PROVINCIA_KEY`) without diacritics
- **Multi-format Dates**: Date parsing supports dd/mm/yyyy and ISO formats with normalization to `FECHA_ISO`
- **Authentication Integration**: Supports both static file mode and authenticated API mode
- **ESLint Configuration**: React hooks and refresh plugins enabled, ignores unused vars with capital letters (`varsIgnorePattern: '^[A-Z_]'`)