import React from 'react';
import { Card } from '@/components/ui/card';
import { AIInsightCard } from '@/components/features/AIInsightCard';

const GaugeChart = React.lazy(() =>
  import('@/components/charts/GaugeChart').then((m) => ({
    default: m.GaugeChart,
  }))
);

interface HomeAnalyticsProps {
  healthPercentage: number;
}

export const HomeAnalytics: React.FC<HomeAnalyticsProps> = ({
  healthPercentage,
}) => {
  return (
    <div className="flex flex-col gap-4 space-y-4 sm:flex-row sm:gap-6 md:col-span-2 md:space-y-6 lg:col-span-4 lg:flex-col lg:gap-0">
      <Card className="glass-premium group relative flex min-h-[280px] flex-1 transform-gpu flex-col items-center justify-center overflow-hidden rounded-[32px] border border-white/60 bg-white p-4 shadow-2xl transition-all hover:shadow-pink-100/50 md:rounded-[48px] md:p-10">
        <div className="pointer-events-none absolute top-0 left-0 p-8 opacity-20 transition-transform group-hover:scale-110">
          <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
            Health Meter
          </p>
        </div>
        <div className="mt-4 aspect-square w-full max-w-[200px] transform-gpu md:max-w-[320px]">
          <React.Suspense
            fallback={
              <div className="flex h-full w-full animate-pulse items-center justify-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Analisis Kesehatan...
              </div>
            }
          >
            <GaugeChart percentage={healthPercentage} />
          </React.Suspense>
        </div>
        <div className="mt-4 text-center">
          <h4 className="mb-1 text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">
            Financial Score
          </h4>
          <p className="text-xl font-black tracking-tighter text-slate-800">
            Sangat Sehat, Sayang! ✨
          </p>
        </div>
      </Card>
      <div className="w-full flex-1 scale-100 transition-transform duration-500 hover:scale-[1.02]">
        <AIInsightCard />
      </div>
    </div>
  );
};
