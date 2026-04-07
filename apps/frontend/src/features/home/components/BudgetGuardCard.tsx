import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Settings2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBudgetGuard } from '../hooks/useBudgetGuard';
import { useSettings } from '@/features/settings';
import { useFormatting } from '@/lib/hooks/useFormatting';

export const BudgetGuardCard = React.memo(() => {
  const { spent, limit, remaining, progress, aiMessage, status } =
    useBudgetGuard();
  const { updateSettings } = useSettings();
  const { formatAmount } = useFormatting();
  const [isEditing, setIsEditing] = React.useState(false);
  const [newLimit, setNewLimit] = React.useState(limit.toString());

  React.useEffect(() => {
    setNewLimit(limit.toString());
  }, [limit]);

  const handleUpdate = () => {
    const val = Number.parseInt(newLimit.replaceAll(/\D/g, ''), 10);
    if (!Number.isNaN(val)) {
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
    <Card className="group relative flex flex-col overflow-hidden rounded-[40px] border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert
            className={cn('size-5', statusColors[status].split(' ')[0])}
          />
          <CardTitle className="text-sm font-black tracking-tighter text-slate-800 uppercase">
            Budget Guard AI
          </CardTitle>
        </div>
        <div
          className={cn(
            'rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase',
            statusColors[status]
          )}
        >
          {status}
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Terpakai
            </span>
            <span className="text-xl font-black tracking-tighter text-slate-800">
              {formatAmount(spent)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Sisa Budget
            </span>
            <span
              className={cn(
                'text-lg font-black tracking-tighter',
                statusColors[status].split(' ')[0]
              )}
            >
              {formatAmount(remaining)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Progress
            value={progress}
            className="h-3 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className={cn(
                'h-full transition-all duration-1000',
                progressColors[status]
              )}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </Progress>
          <div className="flex justify-between text-[9px] font-black tracking-widest text-slate-400 uppercase">
            <span>0%</span>
            <div className="flex items-center gap-1">
              {isEditing ? (
                <div className="relative -mt-1 flex origin-right scale-90 flex-col items-end gap-1">
                  <Input
                    autoFocus
                    value={newLimit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewLimit(e.target.value)
                    }
                    onBlur={handleUpdate}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      e.key === 'Enter' && handleUpdate()
                    }
                    className="h-7 w-32 rounded-lg border-slate-200 px-2 py-0 text-right text-[10px] font-black shadow-sm focus-visible:ring-emerald-500/20"
                  />
                  <div className="animate-in fade-in slide-in-from-top-1 rounded-md border border-emerald-100/50 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap text-emerald-500 duration-200">
                    {formatAmount(
                      Number.parseInt(newLimit.replaceAll(/\D/g, ''), 10) || 0,
                      true
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 transition-colors hover:text-slate-600"
                >
                  Limit: {formatAmount(limit)}{' '}
                  <Settings2 className="size-2.5 opacity-50" />
                </button>
              )}
            </div>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border p-4 leading-relaxed',
            statusColors[status]
          )}
        >
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Sparkles className="size-8" />
          </div>
          <p className="relative z-10 text-[11px] font-bold italic">
            &quot;{aiMessage}&quot;
          </p>
        </div>
      </div>
    </Card>
  );
});

BudgetGuardCard.displayName = 'BudgetGuardCard';
