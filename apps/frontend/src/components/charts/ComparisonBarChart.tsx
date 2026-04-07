import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTransactions } from '@/features/transactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ComparisonBarChart: React.FC = () => {
  const { data: infiniteData } = useTransactions();
  const transactions = React.useMemo(
    () => infiniteData?.pages.flat() || [],
    [infiniteData?.pages]
  );

  const getWeekData = React.useCallback(
    (weeksAgo: number) => {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - diffToMonday - weeksAgo * 7);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const weekExpenses = [0, 0, 0, 0, 0, 0, 0];

      transactions.forEach((t) => {
        if (t.type !== 'expense') return;
        const tDate = new Date(t.date);
        if (tDate >= startOfWeek && tDate <= endOfWeek) {
          const tDay = tDate.getDay();
          const tIndex = tDay === 0 ? 6 : tDay - 1;
          weekExpenses[tIndex] += t.amount;
        }
      });

      return weekExpenses;
    },
    [transactions]
  );

  const thisWeekData = React.useMemo(() => getWeekData(0), [getWeekData]);
  const lastWeekData = React.useMemo(() => getWeekData(1), [getWeekData]);

  const data = React.useMemo(
    () => ({
      labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
      datasets: [
        {
          label: 'Minggu Lalu',
          data: lastWeekData,
          backgroundColor: '#60a5fa', // Blue 400
          hoverBackgroundColor: '#3b82f6',
          borderRadius: 8,
          maxBarThickness: 15,
          borderSkipped: false,
        },
        {
          label: 'Minggu Ini',
          data: thisWeekData,
          backgroundColor: '#f472b6', // Pink 400
          hoverBackgroundColor: '#ec4899',
          borderRadius: 8,
          maxBarThickness: 15,
          borderSkipped: false,
        },
      ],
    }),
    [thisWeekData, lastWeekData]
  );

  const options: ChartOptions<'bar'> = React.useMemo(
    () => ({
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1e293b',
          bodyColor: '#1e293b',
          titleFont: { weight: 'bold', size: 14 },
          bodyFont: { weight: 'bold', size: 12 },
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 16,
          displayColors: true,
          callbacks: {
            label: (context: TooltipItem<'bar'>) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: {
              size: 10,
              weight: 'bold',
            },
            color: '#94a3b8',
          },
        },
        y: {
          display: false,
          grid: { display: false },
        },
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart',
      },
    }),
    []
  );

  return (
    <div className="h-full w-full p-2">
      <Bar data={data} options={options} />
    </div>
  );
};
