# Data Processing Architecture

## Data Processing Pipeline

```mermaid
graph TD
    subgraph "Data Sources"
        Excel[Excel Files - bd.xlsx]
        Static[Static JSON Files]
        API[REST API Endpoints]
    end
    
    subgraph "Processing Layer"
        Upload[Excel Upload Processing]
        Normalize[Data Normalization]
        Validate[Data Validation]
        Store[Database Storage]
    end
    
    subgraph "Utility Functions"
        Province[normalizeProvinceKey()]
        Coords[getCoordinatesFromItem()]
        Dates[parseDateToISO()]
        Dept[getDepartamentoFromItem()]
        Display[formatDateForDisplay()]
    end
    
    subgraph "Categorization System"
        Hierarchy[Hierarchical Categories]
        Priority[Priority Order]
        Mutual[Mutual Exclusion]
    end
    
    subgraph "Output Data"
        Filtered[Filtered Data]
        Categorized[Categorized Data]
        Statistics[Statistical Analysis]
    end
    
    Excel --> Upload
    Upload --> Normalize
    Normalize --> Validate
    Validate --> Store
    
    API --> Normalize
    Static --> Normalize
    
    Normalize --> Province
    Normalize --> Coords
    Normalize --> Dates
    Normalize --> Dept
    
    Store --> Hierarchy
    Hierarchy --> Priority
    Priority --> Mutual
    
    Mutual --> Filtered
    Filtered --> Categorized
    Categorized --> Statistics
    
    Display --> Statistics
```

## Centralized Utility Functions

```mermaid
graph LR
    subgraph "DashboardContext Exports"
        NPK[normalizeProvinceKey]
        GPKI[getProvinceKeyFromItem]
        GDFI[getDepartamentoFromItem]
        GCFI[getCoordinatesFromItem]
        PTISO[parseDateToISO]
        FDFD[formatDateForDisplay]
    end
    
    subgraph "Data Processing Components"
        DS[dataService.js]
        Filters[Filter Components]
        Maps[Map Components]
        Charts[Chart Components]
        Tables[Table Components]
    end
    
    NPK --> DS
    NPK --> Filters
    GPKI --> DS
    GPKI --> Filters
    GDFI --> DS
    GDFI --> Filters
    GCFI --> Maps
    GCFI --> Charts
    PTISO --> DS
    PTISO --> Tables
    FDFD --> Tables
    FDFD --> Charts
```

## Hierarchical Categorization System

```mermaid
graph TD
    Input[Raw Data Item] --> Check1{Has Detenidos?}
    Check1 -->|Yes| Cat1[detenidos]
    Check1 -->|No| Check2{Has Incautaciones?}
    Check2 -->|Yes| Cat2[incautaciones]
    Check2 -->|No| Check3{Has Abatidos?}
    Check3 -->|Yes| Cat3[abatidos]
    Check3 -->|No| Check4{Has Trata?}
    Check4 -->|Yes| Cat4[trata]
    Check4 -->|No| Check5{Has Afectados?}
    Check5 -->|Yes| Cat5[afectados]
    Check5 -->|No| Check6{Has Controlados?}
    Check6 -->|Yes| Cat6[controlados]
    Check6 -->|No| Cat7[procedimientos]
    
    style Cat1 fill:#ff6b6b
    style Cat2 fill:#4ecdc4
    style Cat3 fill:#45b7d1
    style Cat4 fill:#96ceb4
    style Cat5 fill:#ffeaa7
    style Cat6 fill:#dda0dd
    style Cat7 fill:#95a5a6
```

## Data Validation and Normalization

```mermaid
graph TB
    subgraph "Province Processing"
        P1[Raw Province Name]
        P2[Remove Diacritics]
        P3[Normalize Case]
        P4[Handle Special Cases]
        P5[CABA Mapping]
        P6[Normalized Key]
    end
    
    subgraph "Coordinate Processing"
        C1[Raw Coordinates]
        C2[Field Detection]
        C3[Parse Float Values]
        C4[Validate Ranges]
        C5[Exclude Invalid]
        C6[Valid Coordinates]
    end
    
    subgraph "Date Processing"
        D1[Raw Date String]
        D2[Format Detection]
        D3[Parse dd/MM/yyyy]
        D4[Convert to ISO]
        D5[Validate Date]
        D6[ISO Date String]
    end
    
    subgraph "Departamento Processing"
        DP1[Raw Item Data]
        DP2[Field Candidates]
        DP3[DEPARTAMENTO_O_PARTIDO]
        DP4[DEPARTAMENTO]
        DP5[PARTIDO]
        DP6[Validate Non-Empty]
        DP7[Department String]
    end
    
    P1 --> P2 --> P3 --> P4 --> P5 --> P6
    C1 --> C2 --> C3 --> C4 --> C5 --> C6
    D1 --> D2 --> D3 --> D4 --> D5 --> D6
    DP1 --> DP2 --> DP3 --> DP4 --> DP5 --> DP6 --> DP7
```

## Performance and Debugging

```mermaid
graph LR
    subgraph "Performance Features"
        Memo[React.memo]
        UseMemo[useMemo Hooks]
        Debounce[Debounced Filtering]
        Lazy[Lazy Loading]
    end
    
    subgraph "Debug Features"
        Logging[Occasional Logging]
        Validation[Consistency Validation]
        Stats[Performance Stats]
        Diagnostics[Filter Diagnostics]
    end
    
    subgraph "Monitoring"
        Real[Real-time Validation]
        Debug[Debug Output]
        Performance[Performance Monitoring]
    end
    
    Memo --> Real
    UseMemo --> Performance
    Debounce --> Performance
    Logging --> Debug
    Validation --> Real
    Stats --> Performance
    Diagnostics --> Debug
```

## Data Flow Patterns

### API Mode Flow
```mermaid
sequenceDiagram
    participant C as Component
    participant DC as DashboardContext
    participant API as Django API
    participant DB as Database
    
    C->>DC: Request Data
    DC->>API: GET /api/operational-data/
    API->>DB: Query OperationalData
    DB-->>API: Raw Records
    API-->>DC: JSON Response
    DC->>DC: Apply Utility Functions
    DC->>DC: Categorize Data
    DC->>DC: Apply Filters
    DC-->>C: Processed Data
```

### Static Data Mode Flow
```mermaid
sequenceDiagram
    participant C as Component
    participant DC as DashboardContext
    participant DS as dataService
    participant Excel as Excel File
    participant JSON as JSON Fallback
    
    C->>DC: Request Data
    DC->>DS: loadData()
    DS->>Excel: Load bd.xlsx
    Excel-->>DS: Raw Data
    DS->>DS: Apply Utility Functions
    DS->>DS: Process with getCategorizedData()
    DS-->>DC: Processed Data
    DC->>DC: Apply Filters
    DC-->>C: Filtered Data
    
    Note over Excel,JSON: Fallback chain: Excel → JSON → Empty
```