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
import { useFormatting } from '@/lib/hooks/useFormatting';
import { TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

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

interface WealthSimulationChartProps {
  data: {
    month: string;
    pessimistic: number;
    expected: number;
    optimistic: number;
  }[];
}

export const WealthSimulationChart: React.FC<WealthSimulationChartProps> = ({ data }) => {
  const { formatAmount } = useFormatting();

  if (!data || data.length === 0) return null;

  const labels = data.map((d) => d.month);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Optimistic (90th)',
        data: data.map((d) => d.optimistic),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: 1, // fill to the next dataset (expected)
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
      },
      {
        label: 'Expected (50th)',
        data: data.map((d) => d.expected),
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: 2, // fill to pessimistic
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 0,
      },
      {
        label: 'Pessimistic (10th)',
        data: data.map((d) => d.pessimistic),
        borderColor: '#f43f5e', // rose-500
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          font: { size: 10, weight: 'bold' },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 16,
        boxPadding: 8,
        usePointStyle: true,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            return ` ${context.dataset.label}: ${formatAmount(Number(context.parsed.y))}`;
          },
        },
      },
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
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
      <div className="absolute top-0 left-0 -mt-32 -ml-32 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
      
      <div className="relative z-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800">
              <Sparkles className="size-5 text-amber-500" />
              Proyeksi Masa Depan Kita
            </h3>
            <p className="mt-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Simulasi Monte Carlo (100 Skenario)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600 uppercase">
              <TrendingUp size={12} />
              Probabilistik
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <Line data={chartData} options={options} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-rose-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-rose-600">
              <AlertTriangle size={14} />
              <span className="text-[10px] font-black uppercase">Pessimistic</span>
            </div>
            <p className="text-lg font-black text-slate-800">
              {formatAmount(data[data.length-1].pessimistic)}
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
            <div className="mb-1 flex items-center gap-2 text-blue-600">
              <TrendingUp size={14} />
              <span className="text-[10px] font-black uppercase">Expected</span>
            </div>
            <p className="text-lg font-black text-slate-800">
              {formatAmount(data[data.length-1].expected)}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-emerald-600">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase">Optimistic</span>
            </div>
            <p className="text-lg font-black text-slate-800">
              {formatAmount(data[data.length-1].optimistic)}
            </p>
          </div>
        </div>
        
        <p className="mt-4 text-center text-[9px] font-bold text-slate-400 italic">
          *Proyeksi ini menggunakan simulasi acak berdasarkan trend tabungan & volatilitas pasar. Hasil aktual bisa berbeda ya Sayang! ❤️
        </p>
      </div>
    </Card>
  );
};
