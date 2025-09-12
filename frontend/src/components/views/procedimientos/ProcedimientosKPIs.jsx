import React from 'react';
import { Grid } from '@mui/material';
import {
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import MetricCard from '../../common/MetricCard';

const ProcedimientosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Total Procedimientos"
                    value={analysis.totalProcedimientos?.toLocaleString() || '0'}
                    subtitle="Operaciones registradas"
                    icon={AssignmentIcon}
                    color="primary"
                    trend={analysis.crecimientoMensual}
                    tooltip="Número total de procedimientos operativos registrados"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Tasa de Éxito"
                    value={`${analysis.tasaExito || 85}%`}
                    subtitle="Procedimientos exitosos"
                    icon={CheckCircleIcon}
                    color="success"
                    tooltip="Porcentaje de procedimientos completados exitosamente"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Tiempo Promedio"
                    value={`${analysis.tiempoPromedio || 15} días`}
                    subtitle="Duración media"
                    icon={ScheduleIcon}
                    color="warning"
                    tooltip="Tiempo promedio de duración de los procedimientos"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Eficiencia General"
                    value={`${analysis.eficienciaGeneral || 78}%`}
                    subtitle="Rendimiento operativo"
                    icon={TrendingUpIcon}
                    color="info"
                    tooltip="Indicador general de eficiencia operativa"
                />
            </Grid>
        </Grid>
    );
};

export default ProcedimientosKPIs;
