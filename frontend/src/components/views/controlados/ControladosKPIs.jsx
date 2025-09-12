import React from 'react';
import MetricCard from '../../common/MetricCard';

const ControladosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
                title="Vehículos Controlados"
                value={analysis.totalVehiculos?.toLocaleString() || '0'}
                subtitle="Controles vehiculares"
                icon="🚗"
                color="blue"
                trend={analysis.crecimientoVehiculos}
                tooltip="Número total de vehículos sometidos a control"
            />
            <MetricCard
                title="Personas Controladas"
                value={analysis.totalPersonas?.toLocaleString() || '0'}
                subtitle="Controles personales"
                icon="👤"
                color="green"
                trend={analysis.crecimientoPersonas}
                tooltip="Número total de personas controladas"
            />
            <MetricCard
                title="Averiguaciones"
                value={analysis.totalAveriguaciones?.toLocaleString() || '0'}
                subtitle="Secuestros investigados"
                icon="🔍"
                color="yellow"
                tooltip="Cantidad de averiguaciones por secuestro realizadas"
            />
            <MetricCard
                title="Tasa de Efectividad"
                value={`${analysis.tasaEfectividad || 0}%`}
                subtitle="Controles exitosos"
                icon="🛡️"
                color="red"
                tooltip="Porcentaje de controles que resultaron en hallazgos"
            />
        </div>
    );
};

export default ControladosKPIs;
