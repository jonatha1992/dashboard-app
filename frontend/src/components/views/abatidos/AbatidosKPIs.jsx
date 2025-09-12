import React from 'react';
import { Grid } from '@mui/material';
import MetricCard from '../../common/MetricCard';

const AbatidosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Total Abatidos"
                    value={analysis.totalAbatidos || 0}
                    subtitle="Registros totales"
                    trend={null}
                    color="error"
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Promedio Diario"
                    value={analysis.promedioDiario || 0}
                    subtitle="Por día"
                    trend={null}
                    color="warning"
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Operaciones"
                    value={analysis.operacionesConAbatidos || 0}
                    subtitle="Con abatidos"
                    trend={null}
                    color="info"
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Tasa Enfrentamiento"
                    value={`${analysis.tasaEnfrentamiento || 0}%`}
                    subtitle="De operaciones"
                    trend={null}
                    color="secondary"
                />
            </Grid>
        </Grid>
    );
};

export default AbatidosKPIs;