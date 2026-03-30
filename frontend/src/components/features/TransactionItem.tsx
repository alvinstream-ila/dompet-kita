import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Trash2,
  Edit3,
  Utensils,
  Car,
  Home as HomeIcon,
  ShoppingBag,
  Gamepad,
  Heart,
  GraduationCap,
  Zap as ZapIcon,
  Briefcase,
  TrendingUp,
  Gift,
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
  formatAmount: (amount: number) => string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string, type: string) => {
  const cat = category.toLowerCase();
  if (type === 'income') {
    if (cat.includes('gaji')) return <Briefcase className="h-5 w-5" />;
    if (cat.includes('investasi') || cat.includes('tabungan'))
      return <TrendingUp className="h-5 w-5" />;
    if (cat.includes('hadiah') || cat.includes('bonus'))
      return <Gift className="h-5 w-5" />;
    if (cat.includes('bisnis') || cat.includes('jual'))
      return <Coins className="h-5 w-5" />;
    return <ArrowUpCircle className="h-5 w-5" />;
  }

  if (cat.includes('makan') || cat.includes('minum'))
    return <Utensils className="h-5 w-5" />;
  if (
    cat.includes('transport') ||
    cat.includes('ojek') ||
    cat.includes('bensin')
  )
    return <Car className="h-5 w-5" />;
  if (cat.includes('rumah') || cat.includes('kos'))
    return <HomeIcon className="h-5 w-5" />;
  if (cat.includes('belanja') || cat.includes('market'))
    return <ShoppingBag className="h-5 w-5" />;
  if (
    cat.includes('hiburan') ||
    cat.includes('jalan') ||
    cat.includes('nonton')
  )
    return <Gamepad className="h-5 w-5" />;
  if (cat.includes('sehat') || cat.includes('obat') || cat.includes('skincare'))
    return <Heart className="h-5 w-5" />;
  if (
    cat.includes('didik') ||
    cat.includes('kuliah') ||
    cat.includes('sekolah')
  )
    return <GraduationCap className="h-5 w-5" />;
  if (
    cat.includes('tagihan') ||
    cat.includes('listrik') ||
    cat.includes('pulsa') ||
    cat.includes('wifi')
  )
    return <ZapIcon className="h-5 w-5" />;
  return <ArrowDownCircle className="h-5 w-5" />;
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  index,
  formatAmount,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-4 rounded-[32px] border border-slate-100/50 bg-white p-4 shadow-sm transition-all hover:border-blue-100 hover:shadow-xl md:gap-6 md:p-6"
    >
      <div
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 md:size-16',
          transaction.type === 'income'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-600'
        )}
      >
        {getCategoryIcon(transaction.category, transaction.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2 focus-within:ring-2">
          <h3 className="truncate text-sm leading-none font-black tracking-tight text-slate-800 uppercase md:text-base">
            {transaction.description || transaction.category}
          </h3>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase shadow-xs',
              transaction.type === 'income'
                ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                : 'border-rose-100 bg-rose-50 text-rose-600'
            )}
          >
            {transaction.type}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 transition-colors group-hover:text-slate-500">
            <CalendarIcon size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-black tracking-[0.15em] uppercase">
              {new Date(transaction.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 transition-colors group-hover:text-slate-500">
            <div className="size-1.5 rounded-full bg-slate-200 transition-all group-hover:bg-blue-400" />
            <span className="text-[10px] font-black tracking-[0.15em] uppercase">
              {transaction.category}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <p
          className={cn(
            'text-base font-black tracking-tighter transition-all group-hover:scale-105 md:text-2xl',
            transaction.type === 'income'
              ? 'text-emerald-600'
              : 'text-slate-800'
          )}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatAmount(transaction.amount)}
        </p>
        <div className="flex translate-x-2 transform items-center gap-1.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl border border-transparent shadow-sm transition-all hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md active:scale-90"
            onClick={() => onEdit(transaction)}
          >
            <Edit3 size={15} strokeWidth={2.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl border border-transparent shadow-sm transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 hover:shadow-md active:scale-90"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 size={15} strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
