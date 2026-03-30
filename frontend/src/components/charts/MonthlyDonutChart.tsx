import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTransactions } from '@/hooks/useTransactions';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

export const MonthlyDonutChart: React.FC = () => {
  const { data: infiniteData } = useTransactions();
  const transactions = React.useMemo(
    () => infiniteData?.pages.flat() || [],
    [infiniteData?.pages]
  );

  const totals = React.useMemo(
    () =>
      transactions.reduce(
        (acc, curr) => {
          if (curr.type === 'income') acc.income += curr.amount;
          else acc.expense += curr.amount;
          return acc;
        },
        { income: 0, expense: 0 }
      ),
    [transactions]
  );

  const data = React.useMemo(
    () => ({
      labels: ['Pemasukan', 'Pengeluaran'],
      datasets: [
        {
          data: [totals.income || 1, totals.expense || 0], // Fallback to 1 for income if empty to avoid empty chart
          backgroundColor: [
            '#60a5fa', // Blue 400
            '#f472b6', // Pink 400
          ],
          hoverBackgroundColor: ['#3b82f6', '#ec4899'],
          borderWidth: 0,
          cutout: '70%',
          borderRadius: 12,
          spacing: 5,
        },
      ],
    }),
    [totals]
  );

  const options: ChartOptions<'doughnut'> = React.useMemo(
    () => ({
      plugins: {
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1e293b',
          bodyColor: '#1e293b',
          titleFont: { weight: 'bold' },
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: (context: TooltipItem<'doughnut'>) => {
              const value = context.raw as number;
              return ` ${context.label}: Rp ${value.toLocaleString('id-ID')}`;
            },
          },
        },
        legend: { display: false },
      },
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2000,
        easing: 'easeOutElastic',
      },
    }),
    []
  );

  const totalAmount = totals.income + totals.expense;
  const incomePercentage = React.useMemo(
    () =>
      totalAmount > 0 ? Math.round((totals.income / totalAmount) * 100) : 0,
    [totalAmount, totals.income]
  );

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="relative aspect-square max-h-[160px] w-full md:max-h-[180px]">
        <Doughnut data={data} options={options} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="mb-1 text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
              Ratio
            </span>
            <span className="text-xl font-black tracking-tighter text-slate-800">
              {incomePercentage}%
            </span>
          </motion.div>
          <div className="absolute -z-10 h-16 w-16 animate-pulse rounded-full bg-slate-50/50" />
        </div>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 flex w-full flex-col items-center">
        <div className="mb-3 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            <span className="text-[10px] font-bold tracking-wide text-slate-600 uppercase">
              Pemasukan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[#f472b6] shadow-[0_0_8px_rgba(244,114,182,0.5)]" />
            <span className="text-[10px] font-bold tracking-wide text-slate-600 uppercase">
              Pengeluaran
            </span>
          </div>
        </div>

        <p className="max-w-[200px] text-center text-[9px] leading-relaxed font-medium text-slate-400 italic">
          Perbandingan antara uang masuk (Biru) dan uang yang kita gunakan
          (Pink) bulan ini.
        </p>
      </div>
    </div>
  );
};
