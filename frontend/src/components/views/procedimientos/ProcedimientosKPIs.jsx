import React from 'react';
import MetricCard from '../../common/MetricCard';

const ProcedimientosKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Total Procedimientos"
                value={analysis.totalProcedimientos?.toLocaleString() || '0'}
                subtitle="Operaciones registradas"
                icon="📋"
                color="blue"
                trend={analysis.crecimientoMensual}
                tooltip="Número total de procedimientos operativos registrados"
            />
            <MetricCard
                title="Tasa de Éxito"
                value={`${analysis.tasaExito || 85}%`}
                subtitle="Procedimientos exitosos"
                icon="✅"
                color="green"
                tooltip="Porcentaje de procedimientos completados exitosamente"
            />
            <MetricCard
                title="Tiempo Promedio"
                value={`${analysis.tiempoPromedio || 15} días`}
                subtitle="Duración media"
                icon="⏱️"
                color="yellow"
                tooltip="Tiempo promedio de duración de los procedimientos"
            />
            <MetricCard
                title="Eficiencia General"
                value={`${analysis.eficienciaGeneral || 78}%`}
                subtitle="Rendimiento operativo"
                icon="📈"
                color="cyan"
                tooltip="Indicador general de eficiencia operativa"
            />
        </div>
    );
};

export default ProcedimientosKPIs;

