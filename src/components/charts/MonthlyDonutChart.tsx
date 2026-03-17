import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTransactions } from '@/hooks/useTransactions';
import { motion } from 'framer-motion';
import { useSettings } from '@/hooks/useSettings';

ChartJS.register(ArcElement, Tooltip, Legend);

export const MonthlyDonutChart: React.FC = () => {
  const { data: infiniteData } = useTransactions();
  const transactions = React.useMemo(() => infiniteData?.pages.flat() || [], [infiniteData?.pages]);
  const { isEcoMode } = useSettings();

  const totals = React.useMemo(() => transactions.reduce((acc, curr) => {
    if (curr.type === 'income') acc.income += curr.amount;
    else acc.expense += curr.amount;
    return acc;
  }, { income: 0, expense: 0 }), [transactions]);

  const data = React.useMemo(() => ({
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [
      {
        data: [totals.income || 1, totals.expense || 0], // Fallback to 1 for income if empty to avoid empty chart
        backgroundColor: [
          '#60a5fa', // Blue 400
          '#f472b6', // Pink 400
        ],
        hoverBackgroundColor: [
          '#3b82f6',
          '#ec4899',
        ],
        borderWidth: 0,
        cutout: '70%',
        borderRadius: 12,
        spacing: 5,
      },
    ],
  }), [totals]);

  const options: ChartOptions<'doughnut'> = React.useMemo(() => ({
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
          }
        }
      },
      legend: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isEcoMode ? 100 : 2000,
      easing: 'easeOutElastic'
    }
  }), [isEcoMode]);

  const totalAmount = totals.income + totals.expense;
  const incomePercentage = React.useMemo(() => 
    totalAmount > 0 ? Math.round((totals.income / totalAmount) * 100) : 0
  , [totalAmount, totals.income]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="relative w-full aspect-square max-h-[160px] md:max-h-[180px]">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="flex flex-col items-center"
           >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ratio</span>
              <span className="text-xl font-black text-slate-800 tracking-tighter">{incomePercentage}%</span>
           </motion.div>
           <div className="absolute w-16 h-16 bg-slate-50/50 rounded-full -z-10 animate-pulse" />
        </div>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 flex flex-col items-center w-full">
        <div className="flex items-center justify-center gap-6 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f472b6] shadow-[0_0_8px_rgba(244,114,182,0.5)]" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Pengeluaran</span>
          </div>
        </div>
        
        <p className="text-[9px] text-slate-400 font-medium text-center max-w-[200px] leading-relaxed italic">
          Perbandingan antara uang masuk (Biru) dan uang yang kita gunakan (Pink) bulan ini.
        </p>
      </div>
    </div>
  );
};
