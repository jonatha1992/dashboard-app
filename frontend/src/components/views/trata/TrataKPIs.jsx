import React from 'react';
import { Grid } from '@mui/material';
import MetricCard from '../../common/MetricCard';

const TrataKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard
                    title="Total Casos"
                    value={analysis.totalCasos || 0}
                    subtitle="Casos registrados"
                    trend={null}
                    color="error"
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard
                    title="Víctimas Rescatadas"
                    value={analysis.victimasRescatadas || 0}
                    subtitle="Personas liberadas"
                    trend={null}
                    color="success"
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard
                    title="Tratantes Detenidos"
                    value={analysis.tratantesDetenidos || 0}
                    subtitle="Responsables"
                    trend={null}
                    color="warning"
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard
                    title="Tasa de Rescate"
                    value={`${analysis.tasaRescate || 0}%`}
                    subtitle="Efectividad"
                    trend={null}
                    color="info"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
                <MetricCard
                    title="Modalidad Principal"
                    value={analysis.modalidadPrevalente || "N/A"}
                    subtitle="Tipo más común"
                    trend={null}
                    color="secondary"
                />
            </Grid>
        </Grid>
    );
};

export default TrataKPIs;