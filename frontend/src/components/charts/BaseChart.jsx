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
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
        ...options,
    };

    const renderChart = () => {
        switch (type) {
            case 'pie':
                return <Pie key={chartKey} data={data} options={defaultOptions} />;
            case 'line':
                return <Line key={chartKey} data={data} options={defaultOptions} />;
            case 'bar':
            default:
                return <Bar key={chartKey} data={data} options={defaultOptions} />;
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
                                            className={`px-2 py-0.5 text-xs rounded ${granularity === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            onClick={() => onGranularityChange('month')}
                                        >
                                            Mes
                                        </button>
                                        <button
                                            className={`px-2 py-0.5 text-xs rounded ${granularity === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            onClick={() => onGranularityChange('week')}
                                        >
                                            Semana
                                        </button>
                                        <button
                                            className={`px-2 py-0.5 text-xs rounded ${granularity === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            onClick={() => onGranularityChange('day')}
                                        >
                                            Día
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
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