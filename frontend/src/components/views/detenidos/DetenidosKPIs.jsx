import React from 'react';
import MetricCard from '../../common/MetricCard';

const DetenidosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
                title="Total Detenidos"
                value={analysis.totalDetenidos?.toLocaleString() || '0'}
                subtitle="Personas procesadas"
                icon="👥"
                color="red"
                trend={analysis.crecimientoMensual}
                tooltip="Número total de personas detenidas o aprehendidas"
            />
            <MetricCard
                title="Edad Promedio"
                value={`${analysis.edadPromedio || 35} años`}
                subtitle="Promedio general"
                icon="👤"
                color="blue"
                tooltip="Edad promedio de las personas detenidas"
            />
            <MetricCard
                title="Delito Principal"
                value={analysis.delitoPrincipal || 'N/A'}
                subtitle="Más frecuente"
                icon="⚖️"
                color="yellow"
                tooltip="Tipo de delito más común en las detenciones"
            />
            <MetricCard
                title="Provincia Líder"
                value={analysis.provinciaLider || 'N/A'}
                subtitle="Mayor actividad"
                icon="📍"
                color="green"
                tooltip="Provincia con mayor número de detenciones"
            />
        </div>
    );
};

export default DetenidosKPIs;
