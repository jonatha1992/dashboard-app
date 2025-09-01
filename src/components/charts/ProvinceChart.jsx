import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProvinceChart = ({ data, title, color = '#3B82F6', colors = null }) => {
  const provinces = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels: provinces,
    datasets: [
      {
        label: title,
        data: values,
        // If an explicit colors array is provided, use it (must match labels length).
        // Otherwise fall back to a single color string for all bars.
        backgroundColor: Array.isArray(colors) && colors.length >= provinces.length ? colors : color,
        borderColor: Array.isArray(colors) && colors.length >= provinces.length ? colors : color,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${title} por Provincia`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ProvinceChart;