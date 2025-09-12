import React from 'react';
import { Grid } from '@mui/material';
import {
    Person as PersonIcon,
    Groups as GroupsIcon,
    Gavel as GavelIcon,
    Place as PlaceIcon
} from '@mui/icons-material';
import MetricCard from '../../common/MetricCard';

const DetenidosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Total Detenidos"
                    value={analysis.totalDetenidos?.toLocaleString() || '0'}
                    subtitle="Personas procesadas"
                    icon={PersonIcon}
                    color="error"
                    trend={analysis.crecimientoMensual}
                    target={500}
                    tooltip="Número total de personas detenidas o aprehendidas"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Edad Promedio"
                    value={`${analysis.edadPromedio || 35} años`}
                    subtitle="Promedio general"
                    icon={GroupsIcon}
                    color="primary"
                    tooltip="Edad promedio de las personas detenidas"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Delito Principal"
                    value={analysis.delitoPrincipal || 'N/A'}
                    subtitle="Más frecuente"
                    icon={GavelIcon}
                    color="warning"
                    tooltip="Tipo de delito más común en las detenciones"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Provincia Líder"
                    value={analysis.provinciaLider || 'N/A'}
                    subtitle="Mayor actividad"
                    icon={PlaceIcon}
                    color="success"
                    tooltip="Provincia con mayor número de detenciones"
                />
            </Grid>
        </Grid>
    );
};

export default DetenidosKPIs;
