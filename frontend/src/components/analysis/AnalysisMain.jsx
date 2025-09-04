import React, { useState } from 'react';
import TimeAnalysis from './TimeAnalysis';
import GeographicAnalysis from './GeographicAnalysis';
import ComparisonDashboard from './ComparisonDashboard';

const AnalysisMain = () => {
  const [activeTab, setActiveTab] = useState('temporal');

  const tabs = [
    {
      id: 'temporal',
      label: '🕒 Análisis Temporal',
      component: TimeAnalysis,
      description: 'Evolución de métricas a lo largo del tiempo'
    },
    {
      id: 'geographic',
      label: '🗺️ Análisis Geográfico',
      component: GeographicAnalysis,
      description: 'Distribución espacial por provincias y departamentos'
    },
    {
      id: 'comparison',
      label: '⚖️ Dashboard Comparativo',
      component: ComparisonDashboard,
      description: 'Comparación entre múltiples provincias'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Análisis del Data Warehouse
          </h1>
          <p className="text-gray-600">
            Análisis dimensional avanzado de datos operacionales de seguridad
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">{tab.label}</span>
                    <span className="text-xs text-gray-500 hidden md:block">
                      {tab.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Component */}
        <div className="transition-opacity duration-300">
          {ActiveComponent && <ActiveComponent />}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            💡 Guía de Uso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-1">🕒 Análisis Temporal</h4>
              <p>Visualiza tendencias mensuales y trimestrales por provincia. Ideal para identificar patrones estacionales y comparar períodos.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">🗺️ Análisis Geográfico</h4>
              <p>Examina distribución espacial de operaciones. Permite drill-down desde provincias hasta departamentos específicos.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">⚖️ Dashboard Comparativo</h4>
              <p>Compara múltiples provincias simultáneamente. Perfecto para benchmarking y análisis de performance relativa.</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            🏗️ Data Warehouse | 
            📊 {tabs.length} tipos de análisis disponibles | 
            ⏱️ Datos actualizados via ETL
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisMain;