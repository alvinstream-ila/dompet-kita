import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';
import { UserNavDropdown } from '@/components/features/UserNavDropdown';
import { useFormatting } from '@/hooks/useFormatting';
import { PageLoader } from '@/components/ui/PageLoader';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialSummary } from '@/hooks/useFinancialSummary';

import { HomeGreeting } from '../components/features/HomeGreeting';
import { HomeAnalytics } from '../components/features/HomeAnalytics';
import { HomeQuickActions } from '../components/features/HomeQuickActions';
import { HomeBudgeting } from '../components/features/HomeBudgeting';
import { HomeRecentTransactions } from '../components/features/HomeRecentTransactions';

const ComparisonBarChart = React.lazy(() => import('@/components/charts/ComparisonBarChart').then(m => ({ default: m.ComparisonBarChart })));

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { formatAmount } = useFormatting();
  
  const { 
    income: totalIncome, 
    expense: totalExpense, 
    balance: totalBalance, 
    isLoading, 
    refetch,
    transactions 
  } = useFinancialSummary();

  const healthPercentage = React.useMemo(() => {
    if (totalIncome > 0) {
      return Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100);
    }
    return totalExpense > 0 ? 0 : 100;
  }, [totalIncome, totalExpense]);

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <PageLoader isLoading={isLoading} message="Tunggu sebentar ya Cintaku, aku lagi siapin catatan masa depan kita... ✨" />
      
      <HomeGreeting />

      {/* Main Header Row */}
      <header className="flex items-center justify-between mb-10 mt-6 lg:mt-12 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 ring-4 ring-slate-50">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
                Dompet<span className="text-blue-600">Kita</span>
              </h1>
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono leading-none">
                Masa Depan Bersama
              </span>
            </div>
         </div>

         <div className="flex items-center gap-4 md:gap-8 bg-white/50 backdrop-blur-md p-2 rounded-full border border-slate-100/50 shadow-sm">
            <UserNavDropdown />
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-10">
         {/* Left Side: Analytics & Health */}
         <HomeAnalytics healthPercentage={healthPercentage} />

         {/* Middle/Bottom: Stats & Main Charts */}
         <div className="md:col-span-2 lg:col-span-8 space-y-6 md:space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
               <StatCard title="Total Saldo" amount={totalBalance} imageSrc="/icons/3d/wallet.webp" variant="saldo" />
               <StatCard title="Pemasukan" amount={totalIncome} imageSrc="/icons/3d/income.webp" variant="income" />
               <StatCard title="Pengeluaran" amount={totalExpense} imageSrc="/icons/3d/expense.webp" variant="expense" />
            </div>

            <Card className="glass-premium p-6 md:p-10 shadow-3xl shadow-slate-200/50 rounded-[48px] md:rounded-[64px] border-none bg-white relative overflow-hidden group">
               <div className="absolute top-0 left-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekly Performance Report</span>
               </div>
               <CardHeader className="p-0 mb-8">
                <CardTitle className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <div className="w-2 h-6 bg-blue-500 rounded-full" />
                    Analisis Pengeluaran Mingguan
                </CardTitle>
               </CardHeader>
               <div className="h-64 md:h-80 w-full">
                 <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Menghitung Tren Dengan Teliti...</div>}>
                   <ComparisonBarChart />
                 </React.Suspense>
               </div>
               <p className="text-[9px] md:text-[11px] text-slate-400 text-center mt-6 uppercase font-black tracking-[0.3em] bg-slate-50 py-3 rounded-2xl border border-slate-100/50 flex items-center justify-center gap-2">
                 <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                 Perbandingan performa dengan periode sebelumnya ✨
               </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-10">
               {/* Shortcuts */}
               <HomeQuickActions />
               
               {/* Budgeting & Guard */}
               <HomeBudgeting />
            </div>
         </div>

          {/* Bottom Row: Recent Transactions */}
          <HomeRecentTransactions 
            transactions={transactions} 
            onNavigate={navigate} 
            onRefetch={refetch} 
            formatAmount={formatAmount} 
          />
      </div>
    </div>
  );
};

export default Home;
