# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite) at http://localhost:5173
- `npm run build` - Build for production
- `npm run lint` - Run ESLint linter
- `npm run preview` - Preview production build locally

## Project Architecture

This is a React-based security operations dashboard built with Vite. The application visualizes security operatives data through interactive maps, charts, and tables.

### Key Technologies
- **Frontend**: React 19, Vite, Material-UI, Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Maps**: Leaflet with react-leaflet
- **Data Processing**: XLSX for Excel file handling
- **Routing**: React Router DOM

### Data Flow
1. **Data Sources**: Excel file (`/public/data/bd.xlsx`) or JSON fallback (`/public/data/bd.json`)
2. **Processing**: `dataService.js` loads and processes data, normalizing formats and creating province keys
3. **State Management**: `DashboardContext` provides centralized data and filter state
4. **Visualization**: Components consume context data for maps, charts, and tables

### Core Architecture Patterns

#### Context-Based State Management
- `DashboardContext` - Central state for data, filters, and loading states
- `AuthContext` - Authentication state (currently simplified)
- Components use `useDashboard()` hook to access shared state

#### Data Processing Pipeline
- Raw Excel/JSON → `processJsonData()` → normalized format with:
  - Standardized province names and keys for robust filtering
  - Parsed coordinates (LATITUD/LONGITUD)
  - ISO date normalization (FECHA_ISO)
  - Categorization by operation type

#### Component Structure
```
src/
├── components/
│   ├── auth/ - Login components
│   ├── charts/ - Chart.js wrappers and visualization components
│   ├── dashboard/ - Main dashboard, filters, data table, excel upload
│   ├── map/ - Leaflet map integration
│   └── security/ - Security-specific data sections
├── contexts/ - React contexts for state management
├── services/ - Data loading and processing logic
└── App.jsx - Router and auth setup
```

### Data Model
- **Primary Key**: `ID_OPERATIVO` links related data across categories
- **Geographic Data**: `GEOG._PROCEDIMIENTO` contains core location/date info
- **Categories**: Data is categorized into detenidos, controlados, afectados, procedimientos, abatidos, trata, incautaciones

### Key Implementation Notes
- Province filtering uses normalized keys (`PROVINCIA_KEY`) without diacritics for robust matching
- Date handling supports multiple formats, normalizes to ISO format for filtering
- No demo data - application shows "no data" states when real data unavailable
- ESLint configured with React hooks and refresh plugins, ignores unused vars with capital letters