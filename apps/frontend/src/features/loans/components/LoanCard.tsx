import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, History as HistoryIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Loan } from '@/types';

interface LoanCardProps {
  loan: Loan;
  isEditMode: boolean;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  formatCurrency: (amount: number) => string;
}

export const LoanCard: React.FC<LoanCardProps> = ({
  loan,
  isEditMode,
  onEdit,
  onDelete,
  formatCurrency,
}) => {
  const progress = ((loan.amount - loan.remaining_amount) / loan.amount) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative transform-gpu rounded-[40px] border border-slate-100/50 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-6 flex items-start justify-between">
        <div
          className={cn(
            'rounded-full px-4 py-1.5 text-[9px] font-black tracking-[0.2em] uppercase shadow-xs',
            loan.type === 'utang'
              ? 'border border-rose-100 bg-rose-50 text-rose-600'
              : 'border border-emerald-100 bg-emerald-50 text-emerald-600'
          )}
        >
          {loan.type === 'utang' ? 'Titipan Masuk' : 'Titipan Keluar'}
        </div>
        {isEditMode && (
          <div className="flex translate-x-2 transform items-center gap-1.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
            {loan.status !== 'paid' && (
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl border border-transparent shadow-sm transition-all hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                onClick={() => onEdit(loan)}
              >
                <Pencil className="size-4" strokeWidth={2.5} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl border border-transparent shadow-sm transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 active:scale-90"
              onClick={() => onDelete(loan)}
            >
              <Trash2 className="size-4" strokeWidth={2.5} />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-xl leading-none font-black tracking-tight text-slate-800 transition-colors group-hover:text-pink-600">
            {loan.contact_name}
          </h3>
          <p className="line-clamp-1 max-w-[200px] text-[10px] leading-relaxed font-black tracking-[0.15em] text-slate-400 uppercase">
            {loan.description || 'Tanpa keterangan'}
          </p>
        </div>

        <div className="rounded-[32px] border border-slate-100 bg-slate-50/50 p-6 shadow-inner transition-all group-hover:bg-white">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                Sisa Tagihan
              </p>
              <p className="text-2xl font-black tracking-tighter text-slate-900 tabular-nums">
                {formatCurrency(loan.remaining_amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                Status
              </p>
              <div className="flex items-center justify-end gap-1.5">
                <div
                  className={cn(
                    'size-1.5 rounded-full',
                    loan.status === 'paid'
                      ? 'bg-emerald-500'
                      : 'animate-pulse bg-amber-500'
                  )}
                />
                <p
                  className={cn(
                    'text-[9px] font-black tracking-widest uppercase',
                    loan.status === 'paid'
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                  )}
                >
                  {loan.status === 'paid' ? 'Lunas' : 'Berjalan'}
                </p>
              </div>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full border border-white bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] transition-all duration-700',
                loan.type === 'utang'
                  ? 'bg-linear-to-r from-rose-400 to-rose-600'
                  : 'bg-linear-to-r from-emerald-400 to-emerald-600'
              )}
            />
          </div>
        </div>

        {loan.due_date && (
          <div className="flex items-center gap-2 text-slate-400 transition-colors group-hover:text-slate-500">
            <HistoryIcon size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
              Jatuh Tempo:{' '}
              {new Date(loan.due_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
