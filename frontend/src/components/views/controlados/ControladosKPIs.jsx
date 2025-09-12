import React from 'react';
import { Grid } from '@mui/material';
import {
    DirectionsCar as CarIcon,
    Person as PersonIcon,
    Search as SearchIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import MetricCard from '../../common/MetricCard';

const ControladosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Vehículos Controlados"
                    value={analysis.totalVehiculos?.toLocaleString() || '0'}
                    subtitle="Controles vehiculares"
                    icon={CarIcon}
                    color="primary"
                    trend={analysis.crecimientoVehiculos}
                    tooltip="Número total de vehículos sometidos a control"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Personas Controladas"
                    value={analysis.totalPersonas?.toLocaleString() || '0'}
                    subtitle="Controles personales"
                    icon={PersonIcon}
                    color="success"
                    trend={analysis.crecimientoPersonas}
                    tooltip="Número total de personas controladas"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Averiguaciones"
                    value={analysis.totalAveriguaciones?.toLocaleString() || '0'}
                    subtitle="Secuestros investigados"
                    icon={SearchIcon}
                    color="warning"
                    tooltip="Cantidad de averiguaciones por secuestro realizadas"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Tasa de Efectividad"
                    value={`${analysis.tasaEfectividad || 0}%`}
                    subtitle="Controles exitosos"
                    icon={SecurityIcon}
                    color="error"
                    tooltip="Porcentaje de controles que resultaron en hallazgos"
                />
            </Grid>
        </Grid>
    );
};

export default ControladosKPIs;
