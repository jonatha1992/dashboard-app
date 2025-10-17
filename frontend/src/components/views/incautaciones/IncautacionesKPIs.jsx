import React from 'react';
import MetricCard from '../../common/MetricCard';

const IncautacionesKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Total Incautaciones"
                value={analysis.totalIncautaciones?.toLocaleString() || '0'}
                subtitle="Bienes incautados"
                icon="🔒"
                color="yellow"
                trend={analysis.crecimientoMensual}
                tooltip="Número total de incautaciones realizadas"
            />
            <MetricCard
                title="Valor Total"
                value={`$${(analysis.valorTotal || 0).toLocaleString()}`}
                subtitle="Valor monetario"
                icon="💰"
                color="green"
                tooltip="Valor total estimado de las incautaciones"
            />
            <MetricCard
                title="Tipo Principal"
                value={analysis.tipoPrincipal || 'N/A'}
                subtitle="Más frecuente"
                icon="📦"
                color="blue"
                tooltip="Tipo de incautación más común"
            />
            <MetricCard
                title="Provincia Líder"
                value={analysis.provinciaLider || 'N/A'}
                subtitle="Mayor actividad"
                icon="📍"
                color="red"
                tooltip="Provincia con mayor número de incautaciones"
            />
        </div>
    );
};

export default IncautacionesKPIs;

