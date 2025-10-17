import React from 'react';
import MetricCard from '../../common/MetricCard';

const AfectadosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Total Efectivos"
                value={analysis.totalEfectivos?.toLocaleString() || '0'}
                subtitle="Personal desplegado"
                icon="👥"
                color="blue"
                trend={analysis.crecimientoEfectivos}
                tooltip="Número total de efectivos desplegados en operaciones"
            />
            <MetricCard
                title="Vehículos"
                value={analysis.totalVehiculos?.toLocaleString() || '0'}
                subtitle="Autos y camionetas"
                icon="🚗"
                color="green"
                tooltip="Total de vehículos utilizados en operaciones"
            />
            <MetricCard
                title="Equipos Especiales"
                value={analysis.totalEquipos?.toLocaleString() || '0'}
                subtitle="Scanners y embarcaciones"
                icon="📡"
                color="yellow"
                tooltip="Equipos especializados desplegados"
            />
            <MetricCard
                title="Unidades K9"
                value={analysis.totalCanes?.toLocaleString() || '0'}
                subtitle="Canes y caballos"
                icon="🐕"
                color="red"
                tooltip="Unidades caninas y equinas desplegadas"
            />
        </div>
    );
};

export default AfectadosKPIs;

