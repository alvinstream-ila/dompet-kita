import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTransactions } from '@/features/transactions';
import { parseLocalDate } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ComparisonBarChart: React.FC = () => {
  const {
    data: infiniteData,
    isLoading,
    isFetching,
    isError,
  } = useTransactions(undefined, undefined, 20);
  const transactions = React.useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flatMap((page) => page.items);
  }, [infiniteData]);

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
        const tDate = parseLocalDate(t.date);
        if (tDate >= startOfWeek && tDate <= endOfWeek) {
          const tDay = tDate.getDay();
          const tIndex = tDay === 0 ? 6 : tDay - 1;
          weekExpenses[tIndex] += Number(t.amount);
        }
      });

      return weekExpenses;
    },
    [transactions]
  );

  const thisWeekData = React.useMemo(() => getWeekData(0), [getWeekData]);
  const lastWeekData = React.useMemo(() => getWeekData(1), [getWeekData]);

  const hasData = React.useMemo(() => {
    return thisWeekData.some((v) => v > 0) || lastWeekData.some((v) => v > 0);
  }, [thisWeekData, lastWeekData]);

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

  if (isLoading && !infiniteData) {
    return (
      <div className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-2">
        <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          Mencari Jejak Cuan...
        </div>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-100">
          <div className="animate-shimmer h-full w-1/2 bg-pink-400" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
        <div className="text-[10px] font-black tracking-widest text-red-400 uppercase">
          Koneksi Terputus 🥺
        </div>
        <p className="text-[9px] leading-tight font-bold text-slate-400">
          Gagal mengambil data transaksi.
          <br />
          Cek koneksi API lokal kamu.
        </p>
      </div>
    );
  }

  // Only show "no data" when not fetching to avoid glitch during refetch
  if (!hasData && !isFetching) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
        <div className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
          Belum Ada Data 🍃
        </div>
        <p className="text-[9px] leading-tight font-bold text-slate-400">
          Catat pengeluaran minggu ini
          <br />
          untuk melihat perbandingannya!
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2">
      <Bar data={data} options={options} />
    </div>
  );
};
