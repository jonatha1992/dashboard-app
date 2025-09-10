# System Architecture Overview

## High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        React[React/Vite SPA]
        Auth[AuthContext]
        Dashboard[DashboardContext]
        Components[UI Components]
    end
    
    subgraph "Backend Layer"
        Django[Django REST API]
        JWT[JWT Authentication]
        Models[Data Models]
        Admin[Django Admin]
    end
    
    subgraph "Data Layer"
        SQLite[(SQLite Database)]
        Excel[Excel Files]
        Static[Static JSON]
    end
    
    React --> Django
    Auth --> JWT
    Dashboard --> Models
    Django --> SQLite
    Django --> Excel
    React --> Static
    
    style React fill:#61dafb
    style Django fill:#092e20
    style SQLite fill:#003b57
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as AuthContext
    participant D as DashboardContext
    participant API as Django API
    participant DB as Database
    
    U->>F: Access Dashboard
    F->>A: Check Authentication
    A->>API: Validate JWT Token
    API-->>A: Token Valid
    A-->>F: User Authenticated
    
    F->>D: Load Dashboard Data
    D->>API: GET /api/operational-data/
    API->>DB: Query OperationalData
    DB-->>API: Return Records
    API-->>D: JSON Response
    D->>D: Process with Utility Functions
    D-->>F: Filtered & Categorized Data
    F-->>U: Render Dashboard
```

## Component Architecture

```mermaid
graph LR
    subgraph "Contexts"
        AC[AuthContext]
        DC[DashboardContext]
    end
    
    subgraph "Pages"
        Login[Login Page]
        Main[Main Dashboard]
    end
    
    subgraph "Components"
        Map[Interactive Map]
        Charts[Chart Components]
        Tables[Data Tables]
        Filters[Filter Controls]
        Upload[Excel Upload]
    end
    
    subgraph "Services"
        API[apiService]
        Data[dataService]
        Analysis[analysisService]
    end
    
    AC --> Login
    AC --> Main
    DC --> Main
    DC --> Map
    DC --> Charts
    DC --> Tables
    DC --> Filters
    Main --> Upload
    API --> DC
    Data --> DC
    Analysis --> DC
```

## Technology Stack

### Frontend Stack
- **Framework**: React 19 with Vite
- **State Management**: React Context (AuthContext, DashboardContext)
- **UI Framework**: Material-UI v7 + Tailwind CSS
- **Routing**: React Router DOM v7
- **Charts**: Chart.js with react-chartjs-2
- **Maps**: Leaflet with react-leaflet
- **Data Processing**: XLSX library

### Backend Stack
- **Framework**: Django 5.0
- **API**: Django REST Framework
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (configurable for PostgreSQL/MySQL)
- **Static Files**: WhiteNoise
- **Data Processing**: pandas, openpyxl

### Development Tools
- **Build Tool**: Vite
- **Linting**: ESLint with React hooks plugin
- **Version Control**: Git
- **Documentation**: Markdown with Mermaid diagrams

## Security Architecture

```mermaid
graph TD
    subgraph "Authentication Flow"
        Login[User Login]
        JWT[JWT Token Generation]
        Store[Token Storage]
        Validate[Token Validation]
    end
    
    subgraph "Authorization Levels"
        Admin[Admin Role]
        Viewer[Viewer Role]
    end
    
    subgraph "Protected Resources"
        Upload[Data Upload]
        Modify[Data Modification]
        View[Data Viewing]
    end
    
    Login --> JWT
    JWT --> Store
    Store --> Validate
    
    Admin --> Upload
    Admin --> Modify
    Admin --> View
    Viewer --> View
    
    Validate --> Admin
    Validate --> Viewer
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev1[Frontend: localhost:5173]
        Dev2[Backend: localhost:8000]
    end
    
    subgraph "Production"
        Prod[Integrated Django Server]
        Static[Static Files Serving]
        API[REST API Endpoints]
    end
    
    subgraph "Build Process"
        Build[npm run build]
        Integrate[build_frontend.py]
        Collect[collectstatic]
    end
    
    Dev1 --> Build
    Build --> Integrate
    Integrate --> Static
    Dev2 --> API
    Static --> Prod
    API --> Prod
    Integrate --> Collect
```