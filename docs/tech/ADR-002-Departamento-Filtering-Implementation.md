# ADR-002: Departamento Filtering Implementation

## Status
Accepted

## Context
The dashboard application needed to support filtering by departamento/partido (administrative divisions within provinces) to provide more granular geographic filtering capabilities. This requirement emerged from users needing to analyze security operations data at a sub-provincial level.

## Decision
We decided to implement departamento filtering by adding a centralized utility function `getDepartamentoFromItem()` to the DashboardContext and integrating it into the existing filtering system.

### Implementation Details

#### Centralized Function Design
- **Function**: `getDepartamentoFromItem(item)`
- **Location**: `frontend/src/contexts/DashboardContext.jsx`
- **Export**: Public export for reuse across components
- **Return**: String value of departamento/partido or empty string if not found

#### Field Detection Strategy
The function searches for departamento information using a prioritized list of field candidates:

1. `DEPARTAMENTO_O_PARTIDO` (primary standard field)
2. `DEPARTAMENTO` (common variant)
3. `departamento` (lowercase variant)
4. `DEPARTAMENTO O PARTIDO` (space-separated variant)
5. `PARTIDO` (Buenos Aires specific)
6. `partido` (lowercase partido)

#### Data Validation
- Validates that found values are non-empty strings
- Excludes dash (`-`) values which indicate missing data
- Trims whitespace from valid values
- Returns empty string for invalid/missing data

#### Debug Logging
- Implements occasional logging (0.5% probability) for troubleshooting
- Logs successful field detection with field name and value
- Follows existing logging patterns in the codebase

## Alternatives Considered

### 1. Separate Service Module
**Rejected**: Would have created inconsistency with existing centralized utility functions in DashboardContext.

### 2. Hardcoded Field Name
**Rejected**: Would not handle the variety of field naming conventions found in different data sources.

### 3. Regular Expression Matching
**Rejected**: Overkill for simple field detection and would reduce performance.

### 4. Database Schema Changes
**Rejected**: Would require backend changes and migration complexity for a frontend filtering feature.

## Consequences

### Positive
- **Consistency**: Aligns with existing centralized utility functions pattern
- **Flexibility**: Handles multiple field naming conventions gracefully
- **Performance**: Efficient field lookup with early termination
- **Maintainability**: Single source of truth for departamento extraction logic
- **Reusability**: Exported function can be used by any component
- **Debug Support**: Built-in logging for troubleshooting data issues

### Negative
- **Field Dependency**: Relies on specific field names being present in data
- **No Normalization**: Does not normalize departamento names (different spelling variations may not match)
- **Memory Usage**: Adds another exported function to DashboardContext

### Neutral
- **Documentation Update**: Required updating CLAUDE.md to document the new function
- **Testing Consideration**: May need additional test cases for field detection logic

## Implementation Notes

### Integration Points
- **DashboardContext**: Function export and usage in filtering logic
- **Filter Components**: Can use the function for departamento-based filtering
- **Data Service**: Can utilize for data processing and categorization
- **Map Components**: Can use for geographic drill-down functionality

### Data Flow Impact
```javascript
Raw Data Item → getDepartamentoFromItem() → Departamento String → Filter Logic → Filtered Results
```

### Error Handling
- Graceful handling of missing or invalid data
- No exceptions thrown for malformed input
- Empty string return for consistent behavior

## Future Considerations

### Potential Enhancements
1. **Departamento Normalization**: Similar to `normalizeProvinceKey()` for consistent matching
2. **Departamento Validation**: Cross-reference with known departamento lists per province
3. **Hierarchical Filtering**: Province → Departamento → Municipality filtering chain
4. **Caching**: Cache departamento extraction results for performance optimization

### Migration Path
If normalization becomes necessary:
1. Create `normalizeDepartamentoKey()` function
2. Update `getDepartamentoFromItem()` to use normalization
3. Update all dependent components
4. Add normalization to documentation

## References
- Related: ADR-001 Data Processing Centralization
- Implementation: `frontend/src/contexts/DashboardContext.jsx`
- Documentation: `CLAUDE.md` - Exported Utility Functions section
- Pattern: Follows same design as `getProvinceKeyFromItem()` and `getCoordinatesFromItem()`