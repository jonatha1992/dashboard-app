import React from 'react';
import MetricCard from '../../common/MetricCard';

const TrataKPIs = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <MetricCard
                title="Total Casos"
                value={analysis.totalCasos || 0}
                subtitle="Casos registrados"
                icon="📋"
                color="red"
                tooltip="Número total de casos de trata registrados"
            />
            
            <MetricCard
                title="Víctimas Rescatadas"
                value={analysis.victimasRescatadas || 0}
                subtitle="Personas liberadas"
                icon="🆘"
                color="green"
                tooltip="Víctimas rescatadas exitosamente"
            />
            
            <MetricCard
                title="Tratantes Detenidos"
                value={analysis.tratantesDetenidos || 0}
                subtitle="Responsables"
                icon="⛓️"
                color="yellow"
                tooltip="Tratantes y traficantes detenidos"
            />
            
            <MetricCard
                title="Tasa de Rescate"
                value={`${analysis.tasaRescate || 0}%`}
                subtitle="Efectividad"
                icon="📊"
                color="blue"
                tooltip="Porcentaje de efectividad en rescates"
            />

            <MetricCard
                title="Modalidad Principal"
                value={analysis.modalidadPrevalente || "N/A"}
                subtitle="Tipo más común"
                icon="🔍"
                color="purple"
                tooltip="Modalidad de trata más frecuente"
            />
        </div>
    );
};

export default TrataKPIs;