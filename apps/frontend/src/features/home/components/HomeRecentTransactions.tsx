'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Briefcase,
  Car,
  Coins,
  Gamepad as GamepadIcon,
  Gift,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  RefreshCcw,
  ShoppingBag,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  Utensils,
  Wallet,
  Zap as ZapIcon,
} from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

interface HomeRecentTransactionsProps {
  transactions: Transaction[];
  onNavigate: (path: string) => void;
  onRefetch: () => void;
  formatAmount: (amount: number) => string;
}

const getIncomeIcon = (cat: string) => {
  if (cat.includes('gaji')) return <Briefcase className="h-5 w-5" />;
  if (cat.includes('investasi') || cat.includes('tabungan'))
    return <TrendingUpIcon className="h-5 w-5" />;
  if (cat.includes('hadiah') || cat.includes('bonus'))
    return <Gift className="h-5 w-5" />;
  if (cat.includes('bisnis') || cat.includes('jual'))
    return <Coins className="h-5 w-5" />;
  return <ArrowUpCircle className="h-5 w-5" />;
};

const getExpenseIcon = (cat: string) => {
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
    return <GamepadIcon className="h-5 w-5" />;
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

const getCategoryIcon = (category: string, type: string) => {
  const cat = category.toLowerCase();
  return type === 'income' ? getIncomeIcon(cat) : getExpenseIcon(cat);
};

export const HomeRecentTransactions: React.FC<HomeRecentTransactionsProps> = ({
  transactions,
  onNavigate,
  onRefetch,
  formatAmount,
}) => {
  return (
    <div className="mt-8 pb-12 md:mt-12 lg:col-span-12">
      <Card className="glass-premium group relative overflow-hidden rounded-[32px] border border-slate-200/50 bg-slate-50/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:rounded-[64px] md:p-12 dark:border-slate-800/50 dark:bg-slate-900/40">
        {/* Decorative background gradients */}
        <div className="bg-blue-royal/10 absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full blur-[120px] transition-transform duration-1000 group-hover:scale-110" />
        <div className="bg-pink-primary/10 absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full blur-[120px] transition-transform duration-1000 group-hover:scale-110" />

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center md:mb-12 md:gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-2.5 rounded-full bg-slate-900 dark:bg-slate-100" />
              <h3 className="text-2xl font-black tracking-tighter text-slate-800 uppercase md:text-4xl dark:text-slate-100">
                Jejak Cuan & Jajan
              </h3>
            </div>
            <p className="ml-5 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase italic">
              Semua catatan finansial kita ada di sini ❤️
            </p>
          </div>

          <div className="ml-5 flex items-center gap-3 sm:ml-0">
            {transactions.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('/transactions')}
                className="border-blue-royal/20 text-blue-royal shadow-blue-royal/10 hover:bg-blue-royal/5 hover:shadow-blue-royal/20 dark:border-blue-royal/50 dark:text-blue-royal/80 flex h-12 items-center gap-2 rounded-2xl border bg-white px-6 text-[11px] font-black tracking-widest uppercase shadow-xl transition-all active:scale-95 dark:bg-slate-800"
              >
                Riwayat Lengkap
                <ArrowDownCircle className="h-3.5 w-3.5 rotate-225" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-slate-200 bg-white shadow-xl shadow-slate-200/30 transition-all duration-500 hover:rotate-180 hover:bg-slate-50 active:scale-90 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none"
              onClick={onRefetch}
            >
              <RefreshCcw
                className="h-5 w-5 text-slate-500"
                strokeWidth={2.5}
              />
            </Button>
          </div>
        </div>

        {/* Inner Content Area with Contrast */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {transactions.slice(0, 5).length > 0 ? (
            transactions.slice(0, 5).map((t: Transaction, idx: number) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: idx * 0.05,
                  type: 'spring',
                  stiffness: 120,
                  damping: 12,
                }}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  transition: { duration: 0.2 },
                }}
                onClick={() => onNavigate('/transactions')}
                className={cn(
                  'group relative flex cursor-pointer flex-col gap-5 overflow-hidden rounded-[40px] border border-slate-200/60 bg-white p-7 shadow-xl transition-all hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/80',
                  t.type === 'income'
                    ? 'hover:border-green-stat/30 dark:hover:border-green-stat/50'
                    : 'hover:border-red-stat/30 dark:hover:border-red-stat/50'
                )}
              >
                {/* Visual Accent Bar */}
                <div
                  className={cn(
                    'absolute top-0 right-0 bottom-0 w-1 transition-all group-hover:w-2',
                    t.type === 'income' ? 'bg-green-stat' : 'bg-red-stat'
                  )}
                />

                <div className="flex items-center gap-5">
                  <div
                    className={cn(
                      'relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl shadow-inner transition-transform duration-500 group-hover:-rotate-12',
                      t.type === 'income'
                        ? 'bg-green-stat/10 text-green-stat dark:bg-green-stat/20 dark:text-green-stat'
                        : 'bg-red-stat/10 text-red-stat dark:bg-red-stat/20 dark:text-red-stat'
                    )}
                  >
                    {getCategoryIcon(t.category, t.type)}
                    {t.type === 'income' && (
                      <Sparkles className="absolute -top-1 -right-1 h-5 w-5 animate-pulse text-amber-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 truncate text-[11px] font-black tracking-widest text-slate-400 uppercase">
                      {t.category}
                    </p>
                    <h5 className="group-hover:text-blue-royal truncate text-lg font-black tracking-tight text-slate-800 transition-colors dark:text-slate-100">
                      {t.description || t.category}
                    </h5>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                      {new Date(t.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <span
                      className={cn(
                        'text-2xl font-black tracking-tighter tabular-nums',
                        t.type === 'income'
                          ? 'text-green-stat'
                          : 'text-red-stat'
                      )}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatAmount(t.amount)}
                    </span>
                  </div>

                  <div className="group-hover:bg-blue-royal/5 group-hover:text-blue-royal flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 transition-colors dark:bg-slate-800">
                    <ArrowDownCircle
                      className={cn(
                        'h-5 w-5',
                        t.type === 'income' ? 'rotate-180' : ''
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="group relative col-span-full py-28 text-center">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut',
                }}
                className="group-hover:border-blue-royal/30 mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50/80 shadow-inner transition-all group-hover:bg-white dark:border-slate-800 dark:bg-slate-900/50"
              >
                <Wallet
                  className="group-hover:text-blue-royal/40 h-14 w-14 text-slate-300 transition-colors"
                  strokeWidth={1.5}
                />
              </motion.div>
              <h4 className="mb-2 text-[13px] font-black tracking-[0.4em] text-slate-500 uppercase">
                Belum Ada Riwayat Transaksi ✨
              </h4>
              <p className="mx-auto max-w-xs text-[10px] font-bold text-slate-300 italic opacity-70">
                &quot;Setiap catatan transaksi adalah langkah menuju masa depan
                kita, Sayang. Mulai catat yuk! ❤️&quot;
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
