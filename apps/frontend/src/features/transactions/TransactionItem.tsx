import { motion } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Briefcase,
  Calendar as CalendarIcon,
  Car,
  Coins,
  Edit3,
  Gamepad,
  Gift,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Utensils,
  Zap as ZapIcon,
} from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

interface TransactionItemProps {
  readonly transaction: Transaction;
  readonly index: number;
  readonly formatAmount: (amount: number) => string;
  readonly onEdit: (transaction: Transaction) => void;
  readonly onDelete: (id: string) => void;
}

const CATEGORY_MAP: Record<
  string,
  { keywords: string[]; icon: React.ReactNode }
> = {
  gaji: { keywords: ['gaji'], icon: <Briefcase className="h-5 w-5" /> },
  investasi: {
    keywords: ['investasi', 'tabungan'],
    icon: <TrendingUp className="h-5 w-5" />,
  },
  hadiah: { keywords: ['hadiah', 'bonus'], icon: <Gift className="h-5 w-5" /> },
  bisnis: { keywords: ['bisnis', 'jual'], icon: <Coins className="h-5 w-5" /> },
  makan: {
    keywords: ['makan', 'minum'],
    icon: <Utensils className="h-5 w-5" />,
  },
  transport: {
    keywords: ['transport', 'ojek', 'bensin'],
    icon: <Car className="h-5 w-5" />,
  },
  rumah: { keywords: ['rumah', 'kos'], icon: <HomeIcon className="h-5 w-5" /> },
  belanja: {
    keywords: ['belanja', 'market'],
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  hiburan: {
    keywords: ['hiburan', 'jalan', 'nonton'],
    icon: <Gamepad className="h-5 w-5" />,
  },
  sehat: {
    keywords: ['sehat', 'obat', 'skincare'],
    icon: <Heart className="h-5 w-5" />,
  },
  didik: {
    keywords: ['didik', 'kuliah', 'sekolah'],
    icon: <GraduationCap className="h-5 w-5" />,
  },
  tagihan: {
    keywords: ['tagihan', 'listrik', 'pulsa', 'wifi'],
    icon: <ZapIcon className="h-5 w-5" />,
  },
};

const getCategoryIcon = (category: string, type: string) => {
  const cat = category.toLowerCase();

  for (const key of Object.keys(CATEGORY_MAP)) {
    if (CATEGORY_MAP[key].keywords.some((kw) => cat.includes(kw))) {
      return CATEGORY_MAP[key].icon;
    }
  }

  return type === 'income' ? (
    <ArrowUpCircle className="h-5 w-5" />
  ) : (
    <ArrowDownCircle className="h-5 w-5" />
  );
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
      className="group hover:border-blue-royal/20 flex items-center gap-4 rounded-[32px] border border-slate-100/50 bg-white p-4 shadow-sm transition-all hover:shadow-xl md:gap-6 md:p-6"
    >
      <div
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 md:size-16',
          transaction.type === 'income'
            ? 'bg-green-stat/10 text-green-stat'
            : 'bg-red-stat/10 text-red-stat'
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
                ? 'border-green-stat/20 bg-green-stat/5 text-green-stat'
                : 'border-red-stat/20 bg-red-stat/5 text-red-stat'
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
            <div className="group-hover:bg-blue-royal size-1.5 rounded-full bg-slate-200 transition-all" />
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
            transaction.type === 'income' ? 'text-green-stat' : 'text-slate-800'
          )}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatAmount(transaction.amount)}
        </p>
        <div className="flex translate-x-2 transform items-center gap-1.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="hover:border-blue-royal/30 hover:bg-blue-royal/5 hover:text-blue-royal size-9 rounded-xl border border-transparent shadow-sm transition-all hover:shadow-md active:scale-90"
            onClick={() => onEdit(transaction)}
          >
            <Edit3 size={15} strokeWidth={2.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:border-red-stat/30 hover:bg-red-stat/5 hover:text-red-stat size-9 rounded-xl border border-transparent shadow-sm transition-all hover:shadow-md active:scale-90"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 size={15} strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
