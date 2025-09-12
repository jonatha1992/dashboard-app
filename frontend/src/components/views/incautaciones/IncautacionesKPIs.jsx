import React from 'react';
import { Grid } from '@mui/material';
import {
    Security as SecurityIcon,
    AttachMoney as MoneyIcon,
    Category as CategoryIcon,
    Place as PlaceIcon
} from '@mui/icons-material';
import MetricCard from '../../common/MetricCard';

const IncautacionesKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Total Incautaciones"
                    value={analysis.totalIncautaciones?.toLocaleString() || '0'}
                    subtitle="Bienes incautados"
                    icon={SecurityIcon}
                    color="warning"
                    trend={analysis.crecimientoMensual}
                    tooltip="Número total de incautaciones realizadas"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Valor Total"
                    value={`$${(analysis.valorTotal || 0).toLocaleString()}`}
                    subtitle="Valor monetario"
                    icon={MoneyIcon}
                    color="success"
                    tooltip="Valor total estimado de las incautaciones"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Tipo Principal"
                    value={analysis.tipoPrincipal || 'N/A'}
                    subtitle="Más frecuente"
                    icon={CategoryIcon}
                    color="primary"
                    tooltip="Tipo de incautación más común"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Provincia Líder"
                    value={analysis.provinciaLider || 'N/A'}
                    subtitle="Mayor actividad"
                    icon={PlaceIcon}
                    color="error"
                    tooltip="Provincia con mayor número de incautaciones"
                />
            </Grid>
        </Grid>
    );
};

export default IncautacionesKPIs;
