import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GaugeChartProps {
  percentage: number;
  label?: string;
}

const getStatus = (p: number) => {
  if (p >= 80) return { color: '#059669', label: 'Sangat Sehat', bg: 'bg-emerald-50' }; 
  if (p >= 50) return { color: '#2563eb', label: 'Cukup Aman', bg: 'bg-blue-50' }; 
  if (p >= 25) return { color: '#d97706', label: 'Waspada', bg: 'bg-amber-50' }; 
  return { color: '#dc2626', label: 'Butuh Hemat', bg: 'bg-rose-50' }; 
};

export const GaugeChart: React.FC<GaugeChartProps> = ({ percentage }) => {
  const displayPercentage = Math.min(Math.max(Math.round(percentage), 0), 100);

  const status = React.useMemo(() => getStatus(displayPercentage), [displayPercentage]);

  const data = React.useMemo(() => ({
    datasets: [
      {
        data: [displayPercentage, 100 - displayPercentage],
        backgroundColor: [
          status.color,
          '#f1f5f9',
        ],
        borderWidth: 0,
        circumference: 220,
        rotation: 250,
        cutout: '75%',
        borderRadius: 20,
      },
    ],
  }), [displayPercentage, status.color]);

  const options: ChartOptions<'doughnut'> = React.useMemo(() => ({
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 3000,
      easing: 'easeOutQuart'
    }
  }), []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pt-4">
      <div className="w-full h-full flex items-center justify-center relative">
        <Doughnut data={data} options={options} />
        {/* Decorative inner circle - Adjusted size and opacity */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-slate-50 rounded-full -z-10 bg-linear-to-b from-white to-transparent opacity-30" />
      </div>
      <div className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-baseline gap-0.5"
        >
          <span className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter transition-all duration-1000 leading-none drop-shadow-xl" style={{ color: status.color }}>
            {displayPercentage}
          </span>
          <span className="text-lg sm:text-2xl font-black opacity-30 leading-none" style={{ color: status.color }}>%</span>
        </motion.div>
        <span className="text-[7px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-1 sm:mt-3">
          Wallet Health
        </span>
      </div>
      <div className="absolute -bottom-2 sm:-bottom-6 w-full text-center">
         <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.5, duration: 0.8 }}
           className={cn(
             "inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl shadow-2xl border-2 border-white/80 backdrop-blur-2xl transition-all duration-1000",
             status.bg
           )}
         >
            <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full animate-ping shadow-lg" style={{ backgroundColor: status.color }} />
            <span className="text-[10px] sm:text-[13px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-none" style={{ color: status.color }}>
              {status.label}
            </span>
         </motion.div>
      </div>
    </div>
  );
};
