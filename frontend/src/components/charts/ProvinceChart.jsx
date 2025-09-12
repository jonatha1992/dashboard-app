import React from 'react';
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
import BaseChart from './BaseChart';
import { abbreviateName, getEnhancedTooltipConfig } from '../../utils/chartUtils';

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
        backgroundColor: Array.isArray(colors) && colors.length >= provinces.length ? colors : color,
        borderColor: Array.isArray(colors) && colors.length >= provinces.length ? colors : color,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const customOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <BaseChart
        type="bar"
        data={chartData}
        options={customOptions}
        title={`${title} por Provincia`}
        height={400}
      />
    </div>
  );
};

export default ProvinceChart;