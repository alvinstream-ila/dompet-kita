'use client';

import React from 'react';
import Image from 'next/image';
import { StatCard } from '@/components/ui/StatCard';
import { UserNavDropdown } from '@/components/layout';
import { useFormatting } from '@/lib/hooks/useFormatting';
import { PageLoader } from '@/components/ui/PageLoader';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialSummary } from '@/features/transactions';
import { useAuth } from '@/features/auth';
import dynamic from 'next/dynamic';

import { HomeGreeting } from './HomeGreeting';
import { HomeAnalytics } from './HomeAnalytics';
import { HomeQuickActions } from './HomeQuickActions';
import { HomeBudgeting } from './HomeBudgeting';
import { HomeRecentTransactions } from './HomeRecentTransactions';

const ComparisonBarChart = dynamic(() =>
  import('@/components/charts/ComparisonBarChart').then((m) => m.ComparisonBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full animate-pulse items-center justify-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
        Menghitung Tren Dengan Teliti...
      </div>
    )
  }
);

export function DashboardView() {
  const { formatAmount } = useFormatting();
  const { user } = useAuth();

  const {
    income: totalIncome,
    expense: totalExpense,
    balance: totalBalance,
    isLoading,
    refetch,
    transactions,
  } = useFinancialSummary();

  const healthPercentage = React.useMemo(() => {
    if (totalIncome > 0) {
      return Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100);
    }
    return totalExpense > 0 ? 0 : 100;
  }, [totalIncome, totalExpense]);

  const userName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Sayang';

  return (
    <div className="container mx-auto px-4 py-6 md:px-8 md:py-10 pb-36 md:pb-40 lg:px-12 lg:py-12">
      <PageLoader
        isLoading={isLoading}
        message="Tunggu sebentar ya Cintaku, aku lagi siapin catatan masa depan kita... ✨"
      />

      <HomeGreeting mobileTitle={`${userName}...`} />

      {/* Main Header Row */}
      <header className="mt-4 mb-8 flex items-center justify-between gap-3 md:mt-8 md:mb-12 lg:mt-12 lg:mb-16">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-4 shadow-slate-100 ring-slate-50 md:h-14 md:w-14">
            <Image
              src="/logo-utama.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg leading-none font-black tracking-tight text-slate-800 uppercase md:text-2xl">
              Dompet<span className="text-blue-600">Kita</span>
            </h1>
            <span className="font-mono text-[8px] leading-none font-black tracking-[0.3em] text-slate-400 uppercase md:text-[10px]">
              Masa Depan Bersama
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-full border border-slate-100/50 bg-white/50 p-2 shadow-sm backdrop-blur-md md:gap-8">
          <UserNavDropdown />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Side: Analytics & Health */}
        <HomeAnalytics healthPercentage={healthPercentage} />

        {/* Middle/Bottom: Stats & Main Charts */}
        <div className="space-y-6 md:col-span-2 md:space-y-8 lg:col-span-8 lg:space-y-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-8">
            <StatCard
              title="Total Saldo"
              amount={totalBalance}
              imageSrc="/icons/3d/wallet.webp"
              variant="saldo"
            />
            <StatCard
              title="Pemasukan"
              amount={totalIncome}
              imageSrc="/icons/3d/income.webp"
              variant="income"
            />
            <StatCard
              title="Pengeluaran"
              amount={totalExpense}
              imageSrc="/icons/3d/expense.webp"
              variant="expense"
            />
          </div>

          <HomeQuickActions />

          <Card className="glass-premium shadow-3xl group relative overflow-hidden rounded-[48px] border-none bg-white p-6 shadow-slate-200/50 md:rounded-[64px] md:p-10">
            <div className="absolute top-0 left-0 p-8 opacity-0 transition-opacity group-hover:opacity-10">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Weekly Performance Report
              </span>
            </div>
            <CardHeader className="mb-8 p-0">
              <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-800 md:text-2xl">
                <div
                  className="h-6 w-2 rounded-full"
                  style={{ background: 'var(--color-blue-royal)' }}
                />
                Analisis Pengeluaran Mingguan
              </CardTitle>
            </CardHeader>
            <div className="h-64 w-full md:h-80">
              <ComparisonBarChart />
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-slate-100/50 bg-slate-50 py-3 text-center text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase md:text-[11px]">
              <div className="h-1 w-1 animate-ping rounded-full bg-blue-400" />
              Perbandingan performa dengan periode sebelumnya ✨
            </p>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-12 lg:gap-10">
            <HomeBudgeting />
          </div>
        </div>

        {/* Bottom Row: Recent Transactions */}
        <HomeRecentTransactions
          transactions={transactions}
          onNavigate={() => {}} 
          onRefetch={refetch}
          formatAmount={formatAmount}
        />
      </div>
    </div>
  );
}
