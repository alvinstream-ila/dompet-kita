import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';
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
  Plane
} from 'lucide-react';
import { UserNavDropdown } from '@/components/features/UserNavDropdown';
import { useFormatting } from '@/hooks/useFormatting';
import { BudgetGuardCard } from '@/components/features/BudgetGuardCard';
import { AIInsightCard } from '@/components/features/AIInsightCard';
const GaugeChart = React.lazy(() => import('@/components/charts/GaugeChart').then(m => ({ default: m.GaugeChart })));
const MonthlyDonutChart = React.lazy(() => import('@/components/charts/MonthlyDonutChart').then(m => ({ default: m.MonthlyDonutChart })));
const ComparisonBarChart = React.lazy(() => import('@/components/charts/ComparisonBarChart').then(m => ({ default: m.ComparisonBarChart })));
import { PageLoader } from '@/components/ui/PageLoader';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import type { Transaction } from '@/types';

const getCategoryIcon = (category: string, type: string) => {
  const cat = category.toLowerCase();
  if (type === 'income') {
    if (cat.includes('gaji')) return <Briefcase className="w-4 h-4" />;
    if (cat.includes('investasi') || cat.includes('tabungan')) return <TrendingUpIcon className="w-4 h-4" />;
    if (cat.includes('hadiah') || cat.includes('bonus')) return <Gift className="w-4 h-4" />;
    if (cat.includes('bisnis') || cat.includes('jual')) return <Coins className="w-4 h-4" />;
    return <ArrowUpCircle className="w-4 h-4" />;
  }
  
  if (cat.includes('makan') || cat.includes('minum')) return <Utensils className="w-4 h-4" />;
  if (cat.includes('transport') || cat.includes('ojek') || cat.includes('bensin')) return <Car className="w-4 h-4" />;
  if (cat.includes('rumah') || cat.includes('kos')) return <HomeIcon className="w-4 h-4" />;
  if (cat.includes('belanja') || cat.includes('market')) return <ShoppingBag className="w-4 h-4" />;
  if (cat.includes('hiburan') || cat.includes('jalan') || cat.includes('nonton')) return <GamepadIcon className="w-4 h-4" />;
  if (cat.includes('sehat') || cat.includes('obat') || cat.includes('skincare')) return <Heart className="w-4 h-4" />;
  if (cat.includes('didik') || cat.includes('kuliah') || cat.includes('sekolah')) return <GraduationCap className="w-4 h-4" />;
  if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('pulsa') || cat.includes('wifi')) return <ZapIcon className="w-4 h-4" />;
  return <ArrowDownCircle className="w-4 h-4" />;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  // Use custom hook for accurate financial stats
  const { 
    income: totalIncome, 
    expense: totalExpense, 
    balance: totalBalance, 
    isLoading, 
    refetch,
    transactions 
  } = useFinancialSummary();

  const totals = { income: totalIncome, expense: totalExpense };

  const healthPercentage = React.useMemo(() => {
    return totals.income > 0 
      ? Math.max(0, ((totals.income - totals.expense) / totals.income) * 100) 
      : (totals.expense > 0 ? 0 : 100);
  }, [totals]);

  const { formatAmount } = useFormatting();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageLoader isLoading={isLoading} message="Tunggu sebentar ya Cintaku, aku lagi siapin catatan masa depan kita... ✨" />
      
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
         <div className="glass-premium py-4 h-auto md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl w-full transform-gpu">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Sayang...</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Demi Mimpi Indah Kita Bersama ❤️</span>
            </h2>
         </div>
      </div>

      {/* Header Row */}
      <header className="flex items-center justify-between mb-6 md:mb-8 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                Dompet<span className="text-blue-600">Kita</span>
              </h1>
              <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">
                Financial Hub
              </span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50">
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
               <span className="font-script text-[5rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span> 
               <span className="text-slate-600 font-bold">Bangun Masa Depan Kita Yuk... ❤️</span>
               <span className="ml-2 inline-block animate-pulse">✨</span>
            </h2>
         </div>

         <div className="flex items-center gap-4 md:gap-8">
            <UserNavDropdown />
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-8">
         {/* Top Section - Health & Analytics */}
         <div className="md:col-span-2 lg:col-span-4 space-y-4 md:space-y-6 flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-6 lg:gap-0">
            <Card className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-6 glass-premium shadow-xl rounded-[32px] md:rounded-[40px] overflow-hidden transform-gpu min-h-[200px]">
               <div className="w-full aspect-square max-w-[200px] md:max-w-[280px] transform-gpu">
                  <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analisis Kesehatan...</div>}>
                    <GaugeChart percentage={healthPercentage} />
                  </React.Suspense>
               </div>
            </Card>
            <div className="flex-1">
              <AIInsightCard />
            </div>
         </div>

         {/* Top Section - Stats & Main Chart */}
         <div className="md:col-span-2 lg:col-span-8 space-y-4 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
               <StatCard title="Total Saldo" amount={totalBalance} imageSrc="/icons/3d/wallet.webp" variant="saldo" />
               <StatCard title="Pemasukan" amount={totalIncome} imageSrc="/icons/3d/income.webp" variant="income" />
               <StatCard title="Pengeluaran" amount={totalExpense} imageSrc="/icons/3d/expense.webp" variant="expense" />
            </div>
            <Card className="glass-premium p-4 md:p-8 shadow-xl rounded-[32px] md:rounded-[40px]">
               <CardHeader className="p-0 mb-4 md:mb-6"><CardTitle className="text-base md:text-lg font-black text-slate-800 tracking-tight">Analisis Pengeluaran Mingguan</CardTitle></CardHeader>
               <div className="h-48 md:h-64">
                 <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Menghitung Tren...</div>}>
                   <ComparisonBarChart />
                 </React.Suspense>
               </div>
               <p className="text-[8px] md:text-[10px] text-slate-400 text-center mt-4 uppercase font-bold tracking-widest leading-normal">Perbandingan performa dengan periode sebelumnya</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-8">
               {/* Quick Feature Buttons */}
               <div className="md:col-span-2 lg:col-span-3 grid grid-cols-3 lg:grid-cols-1 gap-3">
                  {[
                    { id: 'scan', icon: Sparkles, label: 'Scan Struk', path: '/scan', gradient: 'bg-linear-to-br from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
                    { id: 'holiday', icon: Plane, label: 'Liburan', path: '/holiday', gradient: 'bg-linear-to-br from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
                    { id: 'mimpi', icon: Sparkles, label: 'Mimpi', path: '/mimpi-kita', gradient: 'bg-linear-to-br from-pink-500 to-rose-600', shadow: 'shadow-pink-200' },
                    { id: 'wealth', icon: TrendingUpIcon, label: 'Wealth', path: '/wealth', gradient: 'bg-linear-to-br from-indigo-500 to-violet-600', shadow: 'shadow-indigo-200' },
                  ].map((btn) => (
                    <motion.button
                      key={btn.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(btn.path)}
                      className={cn(
                        "flex flex-col lg:flex-row items-center gap-2 lg:gap-4 p-3 sm:p-4 rounded-[24px] md:rounded-[28px] border-none shadow-lg transition-all group overflow-hidden relative",
                        btn.gradient,
                        btn.shadow
                      )}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                        <btn.icon className="size-4 md:size-5 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-black uppercase tracking-widest text-[8px] sm:text-[10px] text-white text-center lg:text-left leading-none">
                        {btn.label}
                      </span>
                    </motion.button>
                  ))}
               </div>

               <Card className="md:col-span-1 lg:col-span-4 flex flex-col p-4 md:p-6 bg-white/70 backdrop-blur-xl border-white/60 shadow-lg rounded-[32px] md:rounded-[40px]">
                  <CardHeader className="p-0 mb-4"><CardTitle className="text-sm md:text-base font-black text-slate-800 uppercase tracking-tighter">Budgeting</CardTitle></CardHeader>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <React.Suspense fallback={<div className="w-full h-32 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat Budget...</div>}>
                      <MonthlyDonutChart />
                    </React.Suspense>
                  </div>
               </Card>
               <div className="md:col-span-1 lg:col-span-5">
                  <BudgetGuardCard />
               </div>
            </div>
         </div>

          {/* Bottom Section - Riwayat */}
          <div className="lg:col-span-12">
               <Card className="glass-premium p-6 md:p-8 rounded-[40px] shadow-2xl overflow-hidden relative group border-none">
                  {/* Decorative background gradients */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-[100px] -z-10" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/5 rounded-full blur-[100px] -z-10" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Jejak Cuan & Jajan</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-3.5">Catatan perjalanan dompet kita</p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-3.5 sm:ml-0">
                      {transactions.length > 6 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate('/transactions')}
                          className="flex items-center gap-1.5 text-blue-600 font-black hover:bg-blue-50 rounded-2xl px-5 h-10 uppercase text-[11px] tracking-widest border border-blue-100/50 bg-white/50 backdrop-blur-sm"
                        >
                          Lihat Semua
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 hover:bg-white/80 border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm" onClick={() => refetch()}>
                        <RefreshCcw className="w-4 h-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                     {transactions.length > 0 ? transactions.slice(0, 6).map((t: Transaction, idx: number) => (
                        <motion.div 
                          key={t.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ 
                            y: -5,
                            transition: { duration: 0.2, ease: "easeOut" }
                          }}
                          onClick={() => navigate('/transactions')}
                          className={cn(
                            "group relative bg-white/80 backdrop-blur-md rounded-[32px] p-5 flex items-center gap-4 transition-all hover:shadow-2xl hover:shadow-slate-200/50 cursor-pointer overflow-hidden border border-white/80",
                            t.type === 'income' ? 'hover:border-emerald-100' : 'hover:border-pink-100'
                          )}
                        >
                           {/* Left Accent Bar */}
                           <div className={cn(
                             "absolute left-0 top-0 bottom-0 w-1.5",
                             t.type === 'income' ? 'bg-emerald-500' : 'bg-pink-500'
                           )} />

                           <div className={cn(
                             "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative group-hover:scale-110 transition-transform duration-500",
                             t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-pink-600'
                           )}>
                             {getCategoryIcon(t.category, t.type)}
                             {t.type === 'income' && (
                               <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400 animate-pulse" />
                             )}
                           </div>
 
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                 <span className="font-black text-slate-800 text-[14px] uppercase tracking-tight">{t.note || t.category}</span>
                                 <span className={cn(
                                    "font-black tracking-tighter text-[15px] whitespace-nowrap drop-shadow-sm",
                                    t.type === 'income' ? 'text-emerald-600' : 'text-pink-600'
                                 )}>
                                    {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                                 </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                 <span className="bg-slate-100/80 px-2.5 py-1 rounded-full text-slate-500">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                 <span className="opacity-20 self-center h-1 w-1 bg-slate-400 rounded-full" />
                                 <span className="truncate max-w-[80px] text-[9px]">{t.category}</span>
                              </div>
                           </div>
                        </motion.div>
                     )) : (
                       <div className="col-span-full py-20 text-center relative">
                          <div className="bg-slate-50/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                            <Wallet className="w-10 h-10 text-slate-300" strokeWidth={1} />
                          </div>
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Belum ada Jejak Cuan & Jajan</p>
                          <p className="text-[9px] font-bold text-slate-300 italic">Mulai catat transaksi pertama kita yuk, Sayang! ✨</p>
                       </div>
                     )}
                 </div>
              </Card>
         </div>
      </div>
    </div>
  );
};


export default Home;
