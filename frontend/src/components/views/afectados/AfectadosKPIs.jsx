import React from 'react';
import { Grid } from '@mui/material';
import {
    Groups as GroupsIcon,
    DirectionsCar as CarIcon,
    Scanner as ScannerIcon,
    Pets as PetsIcon
} from '@mui/icons-material';
import MetricCard from '../../common/MetricCard';

const AfectadosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Total Efectivos"
                    value={analysis.totalEfectivos?.toLocaleString() || '0'}
                    subtitle="Personal desplegado"
                    icon={GroupsIcon}
                    color="primary"
                    trend={analysis.crecimientoEfectivos}
                    tooltip="Número total de efectivos desplegados en operaciones"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Vehículos"
                    value={analysis.totalVehiculos?.toLocaleString() || '0'}
                    subtitle="Autos y camionetas"
                    icon={CarIcon}
                    color="success"
                    tooltip="Total de vehículos utilizados en operaciones"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Equipos Especiales"
                    value={analysis.totalEquipos?.toLocaleString() || '0'}
                    subtitle="Scanners y embarcaciones"
                    icon={ScannerIcon}
                    color="warning"
                    tooltip="Equipos especializados desplegados"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    title="Unidades K9"
                    value={analysis.totalCanes?.toLocaleString() || '0'}
                    subtitle="Canes y caballos"
                    icon={PetsIcon}
                    color="error"
                    tooltip="Unidades caninas y equinas desplegadas"
                />
            </Grid>
        </Grid>
    );
};

export default AfectadosKPIs;
