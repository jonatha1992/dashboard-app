import React, { useRef, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
} from 'chart.js';
import { Chart, Bar, Line, Pie } from 'react-chartjs-2';
import { abbreviateName, getEnhancedTooltipConfig, getChartClickHandler } from '../../utils/chartUtils';
import ChartModal from '../common/ChartModal';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const BaseChart = ({ type = 'bar', data, options, title, className = '', height = 300, granularity, onGranularityChange, chartKey }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    // Paleta en tonos de azul
    const bluePalette = [
        '#0ea5e9', // sky-500
        '#0284c7', // sky-600
        '#2563eb', // indigo-600
        '#1d4ed8', // blue-700
        '#38bdf8', // sky-400
        '#60a5fa', // blue-400
        '#3b82f6', // blue-500
        '#1e40af', // indigo-800
        '#93c5fd', // blue-300
        '#0ea5e9'  // repeat for safety
    ];

    // Si el dataset no trae colores, aplicamos la paleta por defecto
    const ensureDatasetColors = (incoming) => {
        try {
            if (!incoming || !incoming.datasets) return incoming;
            const ds = incoming.datasets.map((d, idx) => ({
                ...d,
                backgroundColor: d.backgroundColor || (type === 'line' ? 'rgba(37, 99, 235, 0.25)' : bluePalette[idx % bluePalette.length]),
                borderColor: d.borderColor || '#1d4ed8',
                borderWidth: d.borderWidth ?? (type === 'line' ? 2 : 1)
            }));
            return { ...incoming, datasets: ds };
        } catch {
            return incoming;
        }
    };

    // Procesar datos con abreviaciones
    const processDataWithAbbreviations = (incoming) => {
        if (!incoming || !incoming.labels) return incoming;
        
        const abbreviatedLabels = incoming.labels.map(label => abbreviateName(label, 12));
        
        return {
            ...incoming,
            labels: abbreviatedLabels,
            originalLabels: incoming.labels // Guardar etiquetas originales para el modal
        };
    };

    const processedData = processDataWithAbbreviations(data);
    const safeData = ensureDatasetColors(processedData);

    // Handler para clics en el gráfico
    const handleChartClick = (clickData) => {
        console.log('Chart clicked:', clickData); // Debug
        const { index } = clickData;
        
        if (index !== undefined && index !== null) {
            setModalData({
                labels: processedData.originalLabels || processedData.labels,
                datasets: safeData.datasets,
                clickedIndex: index,
                clickedLabel: (processedData.originalLabels || processedData.labels)[index]
            });
            setShowModal(true);
        }
    };

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#e5e7eb', // gris más claro (gray-200)
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    boxWidth: 12,
                    padding: 15
                }
            },
            title: {
                display: !!title,
                text: title,
                color: '#e5e7eb', // gris más claro (gray-200)
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                ...getEnhancedTooltipConfig(title),
                callbacks: {
                    label: function(context) {
                        const value = context.parsed.y || context.parsed;
                        const dataset = context.dataset;
                        const total = dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                        
                        return `${context.dataset.label || 'Valor'}: ${value} (${percentage}%)`;
                    },
                    afterLabel: function(context) {
                        const dataset = context.dataset;
                        const total = dataset.data.reduce((sum, val) => sum + val, 0);
                        return `Total del dataset: ${total}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#d1d5db', // gris más claro (gray-300)
                    font: {
                        size: 12,
                        weight: '600'
                    },
                    maxRotation: 0,
                    autoSkip: true,
                    padding: 8
                },
                grid: { 
                    color: 'rgba(209, 213, 219, 0.2)', // gris claro con transparencia
                    lineWidth: 1
                },
                border: {
                    color: 'rgba(209, 213, 219, 0.4)' // gris claro con transparencia
                }
            },
            y: {
                ticks: { 
                    color: '#d1d5db', // gris más claro (gray-300)
                    font: {
                        size: 12,
                        weight: '600'
                    },
                    padding: 10
                },
                grid: { 
                    color: 'rgba(209, 213, 219, 0.2)', // gris claro con transparencia
                    lineWidth: 1
                },
                border: {
                    color: 'rgba(209, 213, 219, 0.4)' // gris claro con transparencia
                }
            }
        },
        ...options,
        onClick: getChartClickHandler(handleChartClick),
    };

    const renderChart = () => {
        switch (type) {
            case 'pie':
                return <Pie key={chartKey} data={safeData} options={defaultOptions} />;
            case 'line':
                return <Line key={chartKey} data={safeData} options={defaultOptions} />;
            case 'bar':
            default:
                return <Bar key={chartKey} data={safeData} options={defaultOptions} />;
        }
    };

    return (
        <div className={`group relative ${className}`}>
            <div
                className="w-full overflow-hidden"
                style={{ height }}
                title="click en elementos para detalles"
            >
                <div className="w-full h-full">
                    {renderChart()}
                </div>
            </div>
            {/* Overlay hint on hover */}
            <div className="pointer-events-none absolute top-2 right-2 hidden items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs text-white shadow-md group-hover:flex">
                <span>📊 clic para detalles</span>
            </div>

            <ChartModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                data={modalData}
                title={title}
                type={type}
            />
        </div>
    );
};

export default BaseChart;