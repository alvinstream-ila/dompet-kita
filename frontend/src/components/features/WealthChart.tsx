import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WealthChartProps {
  data: { month: string; value: number }[];
  totalWealth: number;
  formatAmount: (amount: number) => string;
}

export const WealthChart: React.FC<WealthChartProps> = ({
  data,
  totalWealth,
  formatAmount,
}) => {
  const chartLabels =
    data.length > 0
      ? data.map((h) => h.month)
      : [new Date().toLocaleDateString('id-ID', { month: 'short' })];

  const chartValues =
    data.length > 0 ? data.map((h) => h.value) : [totalWealth];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: 'Kekayaan Kita',
        data: chartValues,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.45,
        borderWidth: 4,
        pointRadius: 0,
        pointHitRadius: 20,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 4,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 16,
        boxPadding: 8,
        usePointStyle: true,
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 14, weight: '900' },
        callbacks: {
          label: (context: TooltipItem<'line'>) =>
            ` ${formatAmount(Number(context.parsed.y))}`,
        },
      },
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9', borderDash: [4, 4] },
        ticks: {
          callback: (value) => formatAmount(Number(value)),
          font: { size: 10, weight: 'bold' },
          color: '#94a3b8',
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' },
      },
    },
  };

  return (
    <Card className="group relative overflow-hidden rounded-[40px] border-none bg-white p-8 shadow-2xl">
      <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl transition-transform group-hover:scale-110" />
      <div className="relative z-10">
        <div className="mb-10">
          <h3 className="text-xl font-black tracking-tight text-slate-800">
            Grafik Pertumbuhan
          </h3>
          <p className="mt-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Harta kolektif bulanan kita ❤️
          </p>
        </div>
        <div className="h-[400px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </Card>
  );
};
