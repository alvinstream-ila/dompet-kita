import React from 'react';
import { 
  TrendingUp, 
  Target,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WealthStatsProps {
  totalWealth: number;
  growthPercentage: number;
  freedomProgress: number;
  freedomMessage: string;
  formatAmount: (amount: number) => string;
}

export const WealthStats: React.FC<WealthStatsProps> = ({
  totalWealth,
  growthPercentage,
  freedomProgress,
  freedomMessage,
  formatAmount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="rounded-[32px] border-none shadow-xl bg-slate-900 text-white p-8 group relative overflow-hidden transition-all hover:bg-slate-950">
        <TrendingUp className="absolute top-4 right-4 size-24 text-white/5 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Wealth</p>
          <h2 className="text-4xl font-black tracking-tighter mb-5 transition-transform group-hover:translate-x-1">{formatAmount(totalWealth)}</h2>
          <div className={cn(
            "inline-flex items-center px-3.5 py-1.5 rounded-xl text-[10px] font-black gap-2 backdrop-blur-md border border-white/5",
            growthPercentage >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          )}>
             <ArrowUpRight className={cn("size-3.5", growthPercentage < 0 && "rotate-90")} strokeWidth={3} />
             {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}% {growthPercentage >= 0 ? 'NAIK' : 'TURUN'}
          </div>
        </div>
      </Card>

      <Card className="rounded-[32px] border-none shadow-xl bg-white p-8 border border-slate-100 group">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Target Kita</h3>
            <p className="text-xl font-bold text-slate-800 tracking-tight">Menuju Kebebasan Financial ✨</p>
          </div>
          <div className="p-3 bg-pink-50 rounded-2xl group-hover:bg-pink-100 transition-colors">
            <Target className="size-6 text-pink-500" />
          </div>
        </div>
        <div className="space-y-5">
          <div className="flex justify-between items-end px-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Progress Freedom</span>
            <span className="text-2xl font-black text-slate-800 tabular-nums">{freedomProgress}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
            <Progress 
                value={freedomProgress} 
                className="h-full rounded-full bg-linear-to-r from-pink-500 to-rose-500 transition-all duration-1000" 
            />
          </div>
          <p className="text-[10px] font-black text-slate-400 italic px-1 bg-slate-50 py-2 rounded-lg border-l-4 border-pink-400 line-clamp-1">
            "{freedomMessage}"
          </p>
        </div>
      </Card>
    </div>
  );
};
