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
  ArrowDownCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    if (cat.includes('gaji')) return <Briefcase className="w-5 h-5" />;
    if (cat.includes('investasi') || cat.includes('tabungan')) return <TrendingUp className="w-5 h-5" />;
    if (cat.includes('hadiah') || cat.includes('bonus')) return <Gift className="w-5 h-5" />;
    if (cat.includes('bisnis') || cat.includes('jual')) return <Coins className="w-5 h-5" />;
    return <ArrowUpCircle className="w-5 h-5" />;
  }
  
  if (cat.includes('makan') || cat.includes('minum')) return <Utensils className="w-5 h-5" />;
  if (cat.includes('transport') || cat.includes('ojek') || cat.includes('bensin')) return <Car className="w-5 h-5" />;
  if (cat.includes('rumah') || cat.includes('kos')) return <HomeIcon className="w-5 h-5" />;
  if (cat.includes('belanja') || cat.includes('market')) return <ShoppingBag className="w-5 h-5" />;
  if (cat.includes('hiburan') || cat.includes('jalan') || cat.includes('nonton')) return <Gamepad className="w-5 h-5" />;
  if (cat.includes('sehat') || cat.includes('obat') || cat.includes('skincare')) return <Heart className="w-5 h-5" />;
  if (cat.includes('didik') || cat.includes('kuliah') || cat.includes('sekolah')) return <GraduationCap className="w-5 h-5" />;
  if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('pulsa') || cat.includes('wifi')) return <ZapIcon className="w-5 h-5" />;
  return <ArrowDownCircle className="w-5 h-5" />;
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  index,
  formatAmount,
  onEdit,
  onDelete
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-[32px] p-4 md:p-6 flex items-center gap-4 md:gap-6 shadow-sm border border-slate-100/50 hover:shadow-xl hover:border-blue-100 transition-all group"
    >
      <div className={cn(
        "size-12 md:size-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner",
        transaction.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        {getCategoryIcon(transaction.category, transaction.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 focus-within:ring-2">
          <h3 className="font-black text-slate-800 tracking-tight truncate uppercase text-sm md:text-base leading-none">
            {transaction.description || transaction.category}
          </h3>
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-xs",
            transaction.type === 'income' 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
              : "bg-rose-50 text-rose-600 border-rose-100"
          )}>
            {transaction.type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-500 transition-colors">
            <CalendarIcon size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-500 transition-colors">
            <div className="size-1.5 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-all" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              {transaction.category}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <p className={cn(
          "text-base md:text-2xl font-black tracking-tighter transition-all group-hover:scale-105",
          transaction.type === 'income' ? "text-emerald-600" : "text-slate-800"
        )}>
          {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
        </p>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100 shadow-sm hover:shadow-md transition-all active:scale-90"
            onClick={() => onEdit(transaction)}
          >
            <Edit3 size={15} strokeWidth={2.5} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 shadow-sm hover:shadow-md transition-all active:scale-90"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 size={15} strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
