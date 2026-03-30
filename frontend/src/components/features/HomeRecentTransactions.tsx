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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Transaction } from '@/types';

interface HomeRecentTransactionsProps {
  transactions: Transaction[];
  onNavigate: (path: string) => void;
  onRefetch: () => void;
  formatAmount: (amount: number) => string;
}

const getIncomeIcon = (cat: string) => {
  if (cat.includes('gaji')) return <Briefcase className="w-5 h-5" />;
  if (cat.includes('investasi') || cat.includes('tabungan')) return <TrendingUpIcon className="w-5 h-5" />;
  if (cat.includes('hadiah') || cat.includes('bonus')) return <Gift className="w-5 h-5" />;
  if (cat.includes('bisnis') || cat.includes('jual')) return <Coins className="w-5 h-5" />;
  return <ArrowUpCircle className="w-5 h-5" />;
};

const getExpenseIcon = (cat: string) => {
  if (cat.includes('makan') || cat.includes('minum')) return <Utensils className="w-5 h-5" />;
  if (cat.includes('transport') || cat.includes('ojek') || cat.includes('bensin')) return <Car className="w-5 h-5" />;
  if (cat.includes('rumah') || cat.includes('kos')) return <HomeIcon className="w-5 h-5" />;
  if (cat.includes('belanja') || cat.includes('market')) return <ShoppingBag className="w-5 h-5" />;
  if (cat.includes('hiburan') || cat.includes('jalan') || cat.includes('nonton')) return <GamepadIcon className="w-5 h-5" />;
  if (cat.includes('sehat') || cat.includes('obat') || cat.includes('skincare')) return <Heart className="w-5 h-5" />;
  if (cat.includes('didik') || cat.includes('kuliah') || cat.includes('sekolah')) return <GraduationCap className="w-5 h-5" />;
  if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('pulsa') || cat.includes('wifi')) return <ZapIcon className="w-5 h-5" />;
  return <ArrowDownCircle className="w-5 h-5" />;
};

const getCategoryIcon = (category: string, type: string) => {
  const cat = category.toLowerCase();
  return type === 'income' ? getIncomeIcon(cat) : getExpenseIcon(cat);
};

export const HomeRecentTransactions: React.FC<HomeRecentTransactionsProps> = ({
  transactions,
  onNavigate,
  onRefetch,
  formatAmount
}) => {
  return (
    <div className="lg:col-span-12 mt-12 pb-12">
        <Card className="glass-premium p-8 md:p-12 rounded-[48px] md:rounded-[64px] shadow-2xl overflow-hidden relative group border-none bg-white border border-white/60">
            {/* Decorative background gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] -z-10 transition-transform group-hover:scale-125 duration-1000" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/10 rounded-full blur-[120px] -z-10 transition-transform group-hover:scale-125 duration-1000" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-slate-900 rounded-full" />
                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter">Jejak Cuan & Jajan</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] ml-5 italic">Semua catatan mimpi kita ada di sini ❤️</p>
                </div>
                
                <div className="flex items-center gap-3 ml-5 sm:ml-0">
                    {transactions.length > 6 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onNavigate('/transactions')}
                            className="flex items-center gap-2 text-blue-600 font-black hover:bg-blue-50 rounded-2xl px-6 h-12 uppercase text-[12px] tracking-[0.15em] border-2 border-blue-100/50 bg-white/80 backdrop-blur-md shadow-lg shadow-blue-50/50 hover:shadow-blue-100 transition-all active:scale-95"
                        >
                            Lihat Semua Koleksi ✨
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-white/90 border border-slate-100 bg-white/80 backdrop-blur-md shadow-md shadow-slate-100/50 transition-all hover:rotate-180 duration-500 active:scale-90" onClick={onRefetch}>
                        <RefreshCcw className="w-5 h-5 text-slate-500" strokeWidth={2.5} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transactions.length > 0 ? transactions.slice(0, 6).map((t: Transaction, idx: number) => (
                    <motion.div 
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ 
                            delay: idx * 0.08, 
                            type: "spring", 
                            stiffness: 100, 
                            damping: 15 
                        }}
                        whileHover={{ 
                            y: -8,
                            scale: 1.02,
                            transition: { duration: 0.3, ease: "circOut" }
                        }}
                        onClick={() => onNavigate('/transactions')}
                        className={cn(
                            "group relative bg-white/90 backdrop-blur-xl rounded-[40px] p-6 flex items-center gap-5 transition-all hover:shadow-3xl hover:shadow-slate-200/60 cursor-pointer overflow-hidden border border-white/80 shadow-xl shadow-slate-100/50",
                            t.type === 'income' ? 'hover:border-emerald-200/50' : 'hover:border-pink-200/50'
                        )}
                    >
                        {/* Status Accent Circle */}
                        <div className={cn(
                            "absolute top-4 right-4 w-2 h-2 rounded-full",
                            t.type === 'income' ? 'bg-emerald-400 group-hover:scale-150' : 'bg-pink-400 group-hover:scale-150',
                            "transition-transform animate-pulse"
                        )} />

                        <div className={cn(
                            "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-inner relative group-hover:rotate-12 transition-all duration-500",
                            t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-pink-600'
                        )}>
                            {getCategoryIcon(t.category, t.type)}
                            {t.type === 'income' && (
                                <Sparkles className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 text-amber-400 animate-bounce" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black text-slate-800 text-[15px] uppercase tracking-tight group-hover:text-blue-600 transition-colors truncate pr-2">
                                    {t.description || t.category}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={cn(
                                    "font-black tracking-tighter text-xl drop-shadow-sm tabular-nums",
                                    t.type === 'income' ? 'text-emerald-500' : 'text-pink-500'
                                )}>
                                    {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] whitespace-nowrap">
                                <span className="bg-slate-50/80 px-3 py-1 rounded-full text-slate-500 border border-slate-100/50 group-hover:bg-white group-hover:border-blue-100 transition-all">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                <span className="opacity-30 self-center h-1.5 w-1.5 bg-slate-400 rounded-full group-hover:bg-blue-400 transition-colors" />
                                <span className="truncate max-w-[90px] text-[10px] group-hover:text-slate-600 transition-colors">{t.category}</span>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-28 text-center relative group">
                        <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="bg-slate-50/80 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-slate-200 group-hover:border-blue-200 group-hover:bg-white transition-all shadow-inner"
                        >
                            <Wallet className="w-14 h-14 text-slate-300 group-hover:text-blue-300 transition-colors" strokeWidth={1.5} />
                        </motion.div>
                        <h4 className="text-[13px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Belum Ada Jejak Mimpi ✨</h4>
                        <p className="text-[10px] font-bold text-slate-300 italic max-w-xs mx-auto opacity-70">"Setiap keping tabungan adalah batu bata untuk istana masa depan kita, Sayang. Mulai catat yuk! ❤️"</p>
                    </div>
                )}
            </div>
        </Card>
    </div>
  );
};
