import React from 'react';
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Settings2, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useBudgetGuard } from '@/hooks/useBudgetGuard';
import { useSettings } from '@/hooks/useSettings';
import { useFormatting } from '@/hooks/useFormatting';

export const BudgetGuardCard = React.memo(() => {
  const { spent, limit, remaining, progress, aiMessage, status } = useBudgetGuard();
  const { updateSettings } = useSettings();
  const { formatAmount } = useFormatting();
  const [isEditing, setIsEditing] = React.useState(false);
  const [newLimit, setNewLimit] = React.useState(limit.toString());

  React.useEffect(() => {
    setNewLimit(limit.toString());
  }, [limit]);

  const handleUpdate = () => {
    const val = parseInt(newLimit.replace(/\D/g, ''));
    if (!isNaN(val)) {
      updateSettings({ monthlyBudgetLimit: val });
    }
    setIsEditing(false);
  };

  const statusColors: Record<string, string> = {
    SAFE: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    CAUTION: 'text-blue-500 bg-blue-50 border-blue-100',
    WARNING: 'text-amber-500 bg-amber-50 border-amber-100',
    DANGER: 'text-rose-500 bg-rose-50 border-rose-100',
  };

  const progressColors: Record<string, string> = {
    SAFE: 'bg-emerald-500',
    CAUTION: 'bg-blue-500',
    WARNING: 'bg-amber-500',
    DANGER: 'bg-rose-500',
  };

  return (
    <Card className="flex flex-col p-6 bg-white/70 backdrop-blur-xl border-white/60 shadow-lg rounded-[40px] overflow-hidden relative group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <ShieldAlert className={cn("size-5", statusColors[status].split(' ')[0])} />
           <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-tighter">Budget Guard AI</CardTitle>
        </div>
        <div className={cn("px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest", statusColors[status])}>
          {status}
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terpakai</span>
            <span className="text-xl font-black text-slate-800 tracking-tighter">{formatAmount(spent)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Sisa Budget</span>
            <span className={cn("text-lg font-black tracking-tighter", statusColors[status].split(' ')[0])}>
              {formatAmount(remaining)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", progressColors[status])} 
              style={{ width: `${Math.min(100, progress)}%` }} 
            />
          </Progress>
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span>0%</span>
            <div className="flex items-center gap-1">
              {isEditing ? (
                <div className="flex flex-col items-end gap-1 -mt-1 scale-90 origin-right relative">
                  <Input 
                    autoFocus
                    value={newLimit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLimit(e.target.value)}
                    onBlur={handleUpdate}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleUpdate()}
                    className="h-7 w-32 px-2 py-0 text-[10px] font-black border-slate-200 rounded-lg text-right shadow-sm focus-visible:ring-emerald-500/20"
                  />
                  <div className="text-[8px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/50 whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-200">
                    {formatAmount(parseInt(newLimit.replace(/\D/g, '')) || 0, true)}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                >
                  Limit: {formatAmount(limit)} <Settings2 className="size-2.5 opacity-50" />
                </button>
              )}
            </div>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className={cn("p-4 rounded-2xl border leading-relaxed relative overflow-hidden", statusColors[status])}>
           <div className="absolute top-0 right-0 p-2 opacity-10">
             <Sparkles className="size-8" />
           </div>
           <p className="text-[11px] font-bold italic relative z-10">
             "{aiMessage}"
           </p>
        </div>
      </div>
    </Card>
  );
});

BudgetGuardCard.displayName = 'BudgetGuardCard';
