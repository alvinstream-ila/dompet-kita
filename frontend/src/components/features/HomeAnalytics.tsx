import React from 'react';
import { Card } from "@/components/ui/card";
import { AIInsightCard } from '@/components/features/AIInsightCard';

const GaugeChart = React.lazy(() => import('@/components/charts/GaugeChart').then(m => ({ default: m.GaugeChart })));

interface HomeAnalyticsProps {
  healthPercentage: number;
}

export const HomeAnalytics: React.FC<HomeAnalyticsProps> = ({ healthPercentage }) => {
  return (
    <div className="md:col-span-2 lg:col-span-4 space-y-4 md:space-y-6 flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-6 lg:gap-0">
      <Card className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-10 glass-premium shadow-2xl rounded-[32px] md:rounded-[48px] overflow-hidden transform-gpu min-h-[280px] bg-white border border-white/60 group hover:shadow-pink-100/50 transition-all">
        <div className="absolute top-0 left-0 p-8 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Health Meter</p>
        </div>
        <div className="w-full aspect-square max-w-[200px] md:max-w-[320px] transform-gpu mt-4">
          <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analisis Kesehatan...</div>}>
            <GaugeChart percentage={healthPercentage} />
          </React.Suspense>
        </div>
        <div className="mt-4 text-center">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Financial Score</h4>
            <p className="text-xl font-black text-slate-800 tracking-tighter">Sangat Sehat, Sayang! ✨</p>
        </div>
      </Card>
      <div className="flex-1 w-full scale-100 hover:scale-[1.02] transition-transform duration-500">
        <AIInsightCard />
      </div>
    </div>
  );
};
