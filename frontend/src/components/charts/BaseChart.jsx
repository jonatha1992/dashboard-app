import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

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

    const safeData = ensureDatasetColors(data);

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#0f172a', // slate-900
                    boxWidth: 12,
                }
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                titleColor: '#0f172a',
                bodyColor: '#0f172a'
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#334155',
                    maxRotation: 0,
                    autoSkip: true,
                    callback: (val, idx, ticks) => {
                        const label = (ticks && ticks[idx] && ticks[idx].label) ? String(ticks[idx].label) : '';
                        const s = label.length > 14 ? label.slice(0, 12) + '…' : label; // truncado para etiquetas largas (provincias)
                        return s;
                    }
                },
                grid: { color: 'rgba(203,213,225,0.3)' }
            },
            y: {
                ticks: { color: '#334155' },
                grid: { color: 'rgba(203,213,225,0.3)' }
            }
        },
        ...options,
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
                style={{ height, cursor: 'zoom-in' }}
                onClick={() => setShowModal(true)}
                title="click para ampliar"
            >
                {renderChart()}
            </div>
            {/* Overlay hint on hover */}
            <div className="pointer-events-none absolute top-2 right-2 hidden items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs text-white shadow-md group-hover:flex">
                <span>⬆ doble clic</span>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setShowModal(false)}
                    />
                    {/* Modal content */}
                    <div className="relative z-10 w-11/12 max-w-5xl p-4 bg-white rounded-lg shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-gray-700">
                                {title || 'Vista ampliada'}
                            </div>
                            <div className="flex items-center gap-2">
                                {granularity && onGranularityChange && (
                                    <div className="flex gap-1">
                                        <button
                                            className={`px-2 py-0.5 text-xs rounded ${granularity === 'month' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            onClick={() => onGranularityChange('month')}
                                        >
                                            Mes
                                        </button>
                                        <button
                                            className={`px-2 py-0.5 text-xs rounded ${granularity === 'week' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            onClick={() => onGranularityChange('week')}
                                        >
                                            Semana
                                        </button>
                                        <button
                                            className={`px-2 py-0.5 text-xs rounded ${granularity === 'day' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            onClick={() => onGranularityChange('day')}
                                        >
                                            Día
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-3 py-1 text-sm text-white bg-primary-600 rounded hover:bg-primary-700"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                        <div style={{ height: 500 }}>
                            {renderChart()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BaseChart;