'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  Zap as ZapIcon,
  Utensils,
  Car,
  Home as HomeIcon,
  ShoppingBag,
  Heart,
  Briefcase,
  Gift,
  Coins,
  Gamepad as GamepadIcon,
  GraduationCap,
} from 'lucide-react';
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
      <Card className="glass-premium group relative overflow-hidden rounded-[32px] border border-none border-white/60 bg-white p-6 shadow-2xl sm:p-8 md:rounded-[64px] md:p-12 backdrop-blur-lg">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-400/10 blur-[120px] transition-transform duration-1000 group-hover:scale-125" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-pink-400/10 blur-[120px] transition-transform duration-1000 group-hover:scale-125" />

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center md:mb-12 md:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-2 rounded-full bg-slate-900" />
              <h3 className="text-2xl font-black tracking-tighter text-slate-800 uppercase md:text-3xl">
                Jejak Cuan & Jajan
              </h3>
            </div>
            <p className="ml-5 text-[11px] font-black tracking-[0.3em] text-slate-400 uppercase italic">
              Semua catatan mimpi kita ada di sini ❤️
            </p>
          </div>

          <div className="ml-5 flex items-center gap-3 sm:ml-0">
            {transactions.length > 6 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('/transactions')}
                className="flex h-12 items-center gap-2 rounded-2xl border-2 border-blue-100/50 bg-white/80 px-6 text-[12px] font-black tracking-[0.15em] text-blue-600 uppercase shadow-lg shadow-blue-50/50 backdrop-blur-md transition-all hover:bg-blue-50 hover:shadow-blue-100 active:scale-95"
              >
                Lihat Semua Koleksi ✨
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl border border-slate-100 bg-white/80 shadow-md shadow-slate-100/50 backdrop-blur-md transition-all duration-500 hover:rotate-180 hover:bg-white/90 active:scale-90"
              onClick={onRefetch}
            >
              <RefreshCcw
                className="h-5 w-5 text-slate-500"
                strokeWidth={2.5}
              />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {transactions.length > 0 ? (
            transactions.slice(0, 6).map((t: Transaction, idx: number) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: idx * 0.08,
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: 'circOut' },
                }}
                onClick={() => onNavigate('/transactions')}
                className={cn(
                  'group hover:shadow-3xl relative flex cursor-pointer items-center gap-5 overflow-hidden rounded-[40px] border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md transition-all hover:shadow-slate-200/60 transform-gpu',
                  t.type === 'income'
                    ? 'hover:border-emerald-200/50'
                    : 'hover:border-pink-200/50'
                )}
              >
                {/* Status Accent Circle */}
                <div
                  className={cn(
                    'absolute top-4 right-4 h-2 w-2 rounded-full',
                    t.type === 'income'
                      ? 'bg-emerald-400 group-hover:scale-150'
                      : 'bg-pink-400 group-hover:scale-150',
                    'animate-pulse transition-transform'
                  )}
                />

                <div
                  className={cn(
                    'relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] shadow-inner transition-all duration-500 group-hover:rotate-12',
                    t.type === 'income'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-pink-50 text-pink-600'
                  )}
                >
                  {getCategoryIcon(t.category, t.type)}
                  {t.type === 'income' && (
                    <Sparkles className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 animate-bounce text-amber-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="truncate pr-2 text-[15px] font-black tracking-tight text-slate-800 uppercase transition-colors group-hover:text-blue-600">
                      {t.description || t.category}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={cn(
                        'text-xl font-black tracking-tighter tabular-nums drop-shadow-sm',
                        t.type === 'income'
                          ? 'text-emerald-500'
                          : 'text-pink-500'
                      )}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatAmount(t.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.25em] whitespace-nowrap text-slate-400 uppercase">
                    <span className="rounded-full border border-slate-100/50 bg-slate-50/80 px-3 py-1 text-slate-500 transition-all group-hover:border-blue-100 group-hover:bg-white">
                      {new Date(t.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span className="h-1.5 w-1.5 self-center rounded-full bg-slate-400 opacity-30 transition-colors group-hover:bg-blue-400" />
                    <span className="max-w-[90px] truncate text-[10px] transition-colors group-hover:text-slate-600">
                      {t.category}
                    </span>
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
                className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50/80 shadow-inner transition-all group-hover:border-blue-200 group-hover:bg-white"
              >
                <Wallet
                  className="h-14 w-14 text-slate-300 transition-colors group-hover:text-blue-300"
                  strokeWidth={1.5}
                />
              </motion.div>
              <h4 className="mb-2 text-[13px] font-black tracking-[0.4em] text-slate-500 uppercase">
                Belum Ada Jejak Mimpi ✨
              </h4>
              <p className="mx-auto max-w-xs text-[10px] font-bold text-slate-300 italic opacity-70">
                &quot;Setiap keping tabungan adalah batu bata untuk istana masa depan
                kita, Sayang. Mulai catat yuk! ❤️&quot;
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
