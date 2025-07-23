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

const BaseChart = ({ type = 'bar', data, options, title, className = '' }) => {
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
                return <Pie data={data} options={defaultOptions} />;
            case 'line':
                return <Line data={data} options={defaultOptions} />;
            case 'bar':
            default:
                return <Bar data={data} options={defaultOptions} />;
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            <div style={{ height: '400px' }}>
                {renderChart()}
            </div>
        </div>
    );
};

export default BaseChart;