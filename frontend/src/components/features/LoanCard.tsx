import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pencil, 
  Trash2, 
  History as HistoryIcon,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  formatCurrency
}) => {
  const progress = ((loan.amount - loan.remaining_amount) / loan.amount) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-white rounded-[40px] p-8 border border-slate-100/50 shadow-sm hover:shadow-2xl transition-all duration-500 transform-gpu hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xs",
          loan.type === 'utang' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
        )}>
          {loan.type === 'utang' ? 'Titipan Masuk' : 'Titipan Keluar'}
        </div>
        {isEditMode && (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            {loan.status !== 'paid' && (
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100 shadow-sm transition-all active:scale-90"
                onClick={() => onEdit(loan)}
              >
                <Pencil className="size-4" strokeWidth={2.5} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 shadow-sm transition-all active:scale-90"
              onClick={() => onDelete(loan)}
            >
              <Trash2 className="size-4" strokeWidth={2.5} />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2 group-hover:text-pink-600 transition-colors">
            {loan.contact_name}
          </h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] leading-relaxed max-w-[200px] line-clamp-1">
            {loan.description || 'Tanpa keterangan'}
          </p>
        </div>

        <div className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 shadow-inner group-hover:bg-white transition-all">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Sisa Tagihan</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">
                {formatCurrency(loan.remaining_amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center justify-end gap-1.5">
                <div className={cn("size-1.5 rounded-full", loan.status === 'paid' ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  loan.status === 'paid' ? "text-emerald-500" : "text-amber-500"
                )}>
                  {loan.status === 'paid' ? 'Lunas' : 'Berjalan'}
                </p>
              </div>
            </div>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-white">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                loan.type === 'utang' ? "bg-linear-to-r from-rose-400 to-rose-600" : "bg-linear-to-r from-emerald-400 to-emerald-600"
              )}
            />
          </div>
        </div>

        {loan.due_date && (
          <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
            <HistoryIcon size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Jatuh Tempo: {new Date(loan.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
