import type { ChartOptions } from 'chart.js';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { motion } from 'framer-motion';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GaugeChartProps {
  percentage: number;
}

const getStatus = (p: number) => {
  if (p >= 80)
    return { color: '#059669', label: 'Sangat Sehat', bg: 'bg-emerald-50' };
  if (p >= 50)
    return { color: '#2563eb', label: 'Cukup Aman', bg: 'bg-blue-50' };
  if (p >= 25) return { color: '#d97706', label: 'Waspada', bg: 'bg-amber-50' };
  return { color: '#dc2626', label: 'Butuh Hemat', bg: 'bg-rose-50' };
};

export const GaugeChart: React.FC<GaugeChartProps> = ({ percentage }) => {
  const displayPercentage = Math.min(Math.max(Math.round(percentage), 0), 100);

  const status = React.useMemo(
    () => getStatus(displayPercentage),
    [displayPercentage]
  );

  const data = React.useMemo(
    () => ({
      datasets: [
        {
          data: [displayPercentage, 100 - displayPercentage],
          backgroundColor: [status.color, '#f1f5f9'],
          borderWidth: 0,
          circumference: 220,
          rotation: 250,
          cutout: '75%',
          borderRadius: 20,
        },
      ],
    }),
    [displayPercentage, status.color]
  );

  const options: ChartOptions<'doughnut'> = React.useMemo(
    () => ({
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
      },
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 3000,
        easing: 'easeOutQuart',
      },
    }),
    []
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center pt-4">
      <div className="relative flex h-full w-full items-center justify-center">
        <Doughnut data={data} options={options} />
        {/* Decorative inner circle - Adjusted size and opacity */}
        <div className="absolute top-[52%] left-1/2 -z-10 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-50 bg-linear-to-b from-white to-transparent opacity-30" />
      </div>
      <div className="absolute top-[62%] left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex items-baseline gap-0.5"
        >
          <span
            className="text-4xl leading-none font-black tracking-tighter drop-shadow-xl transition-all duration-1000 sm:text-6xl lg:text-7xl"
            style={{ color: status.color }}
          >
            {displayPercentage}
          </span>
          <span
            className="text-lg leading-none font-black opacity-30 sm:text-2xl"
            style={{ color: status.color }}
          >
            %
          </span>
        </motion.div>
        <span className="mt-1 text-[7px] font-black tracking-[0.3em] text-slate-400 uppercase sm:mt-3 sm:text-[10px] sm:tracking-[0.4em]">
          Wallet Health
        </span>
      </div>
      <div className="absolute -bottom-2 w-full text-center sm:-bottom-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={cn(
            'inline-flex items-center gap-2 rounded-2xl border-2 border-white/80 px-6 py-2.5 shadow-2xl backdrop-blur-2xl transition-all duration-1000 sm:gap-3 sm:px-8 sm:py-3.5',
            status.bg
          )}
        >
          <div
            className="h-2 w-2 animate-ping rounded-full shadow-lg sm:h-3 sm:w-3"
            style={{ backgroundColor: status.color }}
          />
          <span
            className="text-[10px] leading-none font-black tracking-[0.2em] uppercase sm:text-[13px] sm:tracking-[0.3em]"
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </motion.div>
      </div>
    </div>
  );
};
