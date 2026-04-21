'use client';

import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { UserNavDropdown } from '@/components/layout';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { useFinancialSummary } from '@/features/transactions';
import { useLoans } from '@/features/loans';
import { AlertCircle, RefreshCcw, HandCoins, PiggyBank } from 'lucide-react';
import { useFormatting } from '@/lib/hooks/useFormatting';
import {
  AnalyticsSkeleton,
  RecentTransactionsSkeleton,
  StatCardSkeleton,
} from './DashboardSkeletons';
import { HomeGreeting } from './HomeGreeting';

const HomeAnalytics = dynamic(
  () => import('./HomeAnalytics').then((m) => m.HomeAnalytics),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

const HomeQuickActions = dynamic(
  () => import('./HomeQuickActions').then((m) => m.HomeQuickActions),
  {
    ssr: false,
  }
);

const HomeBudgeting = dynamic(
  () => import('./HomeBudgeting').then((m) => m.HomeBudgeting),
  {
    ssr: false,
  }
);

const HomeRecentTransactions = dynamic(
  () =>
    import('./HomeRecentTransactions').then((m) => m.HomeRecentTransactions),
  {
    loading: () => <RecentTransactionsSkeleton />,
    ssr: false,
  }
);

const ComparisonBarChart = dynamic(
  () =>
    import('@/components/charts/ComparisonBarChart').then(
      (m) => m.ComparisonBarChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full animate-pulse items-center justify-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
        Menghitung Tren Dengan Teliti...
      </div>
    ),
  }
);

export function DashboardView() {
  const { formatAmount } = useFormatting();
  const { user } = useAuth();

  const {
    cumulativeBalance,
    calendarIncome,
    calendarExpense,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    transactions,
  } = useFinancialSummary();

  const { data: loans = [] } = useLoans();

  const activeLoansSummary = React.useMemo(() => {
    const active = loans.filter((l) => l.status === 'active');
    const piutang = active
      .filter((l) => l.type === 'piutang')
      .reduce((acc, l) => acc + l.remaining_amount, 0);
    const utang = active
      .filter((l) => l.type === 'utang')
      .reduce((acc, l) => acc + l.remaining_amount, 0);
    return { piutang, utang, net: piutang - utang };
  }, [loans]);

  const healthPercentage = React.useMemo(() => {
    if (calendarIncome > 0) {
      return Math.max(
        0,
        ((calendarIncome - calendarExpense) / calendarIncome) * 100
      );
    }
    return calendarExpense > 0 ? 0 : 100;
  }, [calendarIncome, calendarExpense]);

  // Premium Welcome Toast for New Social Users
  useEffect(() => {
    const shouldShowToast = Cookies.get('show_welcome_toast');
    if (shouldShowToast && user) {
      const handle = user.name || 'Sayang';

      toast.success(`Yatta! 🎉 Selamat bergabung, ${handle}!`, {
        description: `Kami sudah siapkan dashboard masa depanmu. Username kamu saat ini: @${handle}. Kamu bisa ganti di profil kapan saja ya! ✨`,
        duration: 8000,
      });

      Cookies.remove('show_welcome_toast');
    }
  }, [user]);

  const userName =
    user?.full_name || user?.name || user?.email?.split('@')[0] || 'Sayang';

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      <HomeGreeting
        mobileTitle={`${userName}...`}
        mobileSubtitle={isRefetching ? 'Menyinkronkan data...' : undefined}
      />

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
          {isRefetching && (
            <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black tracking-widest text-blue-500 uppercase">
              <RefreshCcw className="h-3 w-3 animate-spin" />
              <span className="hidden md:inline">Syncing</span>
            </div>
          )}
          <UserNavDropdown />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-12 lg:gap-10">
        {isError ? (
          <div className="glass-premium col-span-full flex flex-col items-center justify-center space-y-6 rounded-[48px] border-none bg-white p-12 text-center shadow-xl shadow-slate-200/50">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 shadow-inner">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-800">
                Gagal Memuat Data
              </h2>
              <p className="text-sm font-medium text-slate-500">
                {error ||
                  'Terjadi kesalahan saat mengambil ringkasan keuangan kamu. Tenang, ini hanya masalah koneksi sementara.'}
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              className="group flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-6 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
            >
              <RefreshCcw
                className={`h-4 w-4 ${isRefetching ? 'animate-spin' : 'transition-transform duration-500 group-hover:rotate-180'}`}
              />
              Coba Sinkronkan Lagi
            </Button>
          </div>
        ) : (
          <>
            {/* Left Side: Analytics & Health */}
            {isLoading ? (
              <AnalyticsSkeleton />
            ) : (
              <HomeAnalytics healthPercentage={healthPercentage} />
            )}

            {/* Middle/Bottom: Stats & Main Charts */}
            <div className="space-y-6 md:col-span-2 md:space-y-8 lg:col-span-8 lg:space-y-10">
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <div className="grid grid-cols-2 gap-5 md:gap-8 lg:grid-cols-4">
                  <StatCard
                    title="Total Saldo"
                    amount={cumulativeBalance}
                    imageSrc="/icons/3d/wallet.webp"
                    variant="saldo"
                  />
                  <StatCard
                    title="Pemasukan"
                    amount={calendarIncome}
                    imageSrc="/icons/3d/income.webp"
                    variant="income"
                  />
                  <StatCard
                    title="Pengeluaran"
                    amount={calendarExpense}
                    imageSrc="/icons/3d/expense.webp"
                    variant="expense"
                  />
                  <StatCard
                    title="Sisa Bulan Ini"
                    amount={calendarIncome - calendarExpense}
                    icon={PiggyBank}
                    variant="surplus"
                  />
                </div>
              )}

              {/* Amanah Summary Row */}
              {!isLoading && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
                  <Card className="glass-premium flex items-center justify-between overflow-hidden rounded-[32px] border-none bg-white p-6 shadow-xl shadow-slate-100/50">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                        <HandCoins className="size-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          Amanah Keluar (Piutang)
                        </p>
                        <p className="text-lg font-black text-slate-800">
                          {formatAmount(activeLoansSummary.piutang)}
                        </p>
                      </div>
                    </div>
                    <div className="h-10 w-1 rounded-full bg-emerald-200" />
                  </Card>
                  <Card className="glass-premium flex items-center justify-between overflow-hidden rounded-[32px] border-none bg-white p-6 shadow-xl shadow-slate-100/50">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                        <HandCoins className="size-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          Amanah Masuk (Hutang)
                        </p>
                        <p className="text-lg font-black text-slate-800">
                          {formatAmount(activeLoansSummary.utang)}
                        </p>
                      </div>
                    </div>
                    <div className="h-10 w-1 rounded-full bg-rose-200" />
                  </Card>
                </div>
              )}

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
            {isLoading ? (
              <RecentTransactionsSkeleton />
            ) : (
              <HomeRecentTransactions
                transactions={transactions}
                onNavigate={() => {}}
                onRefetch={refetch}
                formatAmount={formatAmount}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
