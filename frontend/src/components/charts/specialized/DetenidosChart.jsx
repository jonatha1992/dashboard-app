import React, { useMemo } from 'react';
import {
    Alert
} from '@mui/material';
import { analyticsService } from '../../../services/analyticsService';

const DetenidosChart = ({ data }) => {
    const analysis = useMemo(() => {
        if (!data || data.length === 0) return null;
        
        // Filtrar solo datos de detenidos
        const detenidos = data.filter(item => 
            item.EDAD || 
            item.SEXO || 
            item.DELITO_IMPUTADO ||
            item.SITUACION_PROCESAL ||
            item.NACIONALIDAD
        );

        if (detenidos.length === 0) return null;

        return analyticsService.analyzeDetenidos(detenidos);
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <Alert severity="info">
                No hay datos de detenidos disponibles para mostrar.
            </Alert>
        );
    }

    if (!analysis) {
        return (
            <Alert severity="warning">
                No se encontraron datos válidos de detenidos en el conjunto de datos.
            </Alert>
        );
    }

    // Este componente ahora solo maneja la lógica de datos
    // Las vistas específicas están en componentes separados
    return (
        <Alert severity="info">
            Componente base de DetenidosChart. Use las vistas específicas en /views/detenidos/
        </Alert>
    );
};

export default DetenidosChart;
