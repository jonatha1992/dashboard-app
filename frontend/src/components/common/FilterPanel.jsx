import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    Grid,
    Collapse,
    IconButton
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const FilterPanel = ({ 
    filters = {}, 
    onFiltersChange, 
    availableProvinces = [], 
    availableDepartments = [],
    availableDelitos = [],
    showDateRange = true 
}) => {
    const [expanded, setExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        fechaInicio: '',
        fechaFin: '',
        provincia: '',
        departamento: '',
        delito: '',
        searchText: '',
        ...filters
    });

    const handleFilterChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
    };

    const clearFilters = () => {
        const clearedFilters = {
            fechaInicio: '',
            fechaFin: '',
            provincia: '',
            departamento: '',
            delito: '',
            searchText: ''
        };
        setLocalFilters(clearedFilters);
        if (onFiltersChange) {
            onFiltersChange(clearedFilters);
        }
    };

    const activeFiltersCount = Object.values(localFilters).filter(value => value && value !== '').length;

    return (
        <Paper sx={{ mb: 2, overflow: 'hidden' }}>
            <Box 
                sx={{ 
                    p: 1.5, 
                    bgcolor: 'grey.50', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FilterIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        Filtros
                    </Typography>
                    {activeFiltersCount > 0 && (
                        <Chip 
                            label={activeFiltersCount} 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {activeFiltersCount > 0 && (
                        <Button 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                            startIcon={<ClearIcon />}
                            sx={{ mr: 1, fontSize: '0.7rem' }}
                        >
                            Limpiar
                        </Button>
                    )}
                    <IconButton size="small">
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Buscar"
                                value={localFilters.searchText}
                                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                                placeholder="Buscar en registros..."
                            />
                        </Grid>

                        {showDateRange && (
                            <>
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        label="Fecha Inicio"
                                        value={localFilters.fechaInicio}
                                        onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        label="Fecha Fin"
                                        value={localFilters.fechaFin}
                                        onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Provincia</InputLabel>
                                <Select
                                    value={localFilters.provincia}
                                    onChange={(e) => handleFilterChange('provincia', e.target.value)}
                                    label="Provincia"
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {availableProvinces.map((provincia) => (
                                        <MenuItem key={provincia} value={provincia}>
                                            {provincia}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Departamento</InputLabel>
                                <Select
                                    value={localFilters.departamento}
                                    onChange={(e) => handleFilterChange('departamento', e.target.value)}
                                    label="Departamento"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {availableDepartments.map((dept) => (
                                        <MenuItem key={dept} value={dept}>
                                            {dept}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {availableDelitos.length > 0 && (
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Delito</InputLabel>
                                    <Select
                                        value={localFilters.delito}
                                        onChange={(e) => handleFilterChange('delito', e.target.value)}
                                        label="Delito"
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        {availableDelitos.map((delito) => (
                                            <MenuItem key={delito} value={delito}>
                                                {delito}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default FilterPanel;
