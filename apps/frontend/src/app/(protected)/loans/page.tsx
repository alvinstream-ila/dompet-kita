'use client';

import { AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2 as CheckCircleIcon,
  Clock as ClockIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteLoan, useLoans } from '@/features/loans';
import {
  LoanCardSkeleton,
  LoanStatSkeleton,
} from '@/features/loans/components/LoanSkeletons';
import { cn } from '@/lib/utils';

const LoanStats = dynamic(
  () => import('@/features/loans').then((m) => m.LoanStats),
  {
    loading: () => <LoanStatSkeleton />,
    ssr: false,
  }
);

const LoanCard = dynamic(
  () => import('@/features/loans').then((m) => m.LoanCard),
  {
    ssr: false,
  }
);

const LoanFilters = dynamic(
  () => import('@/features/loans').then((m) => m.LoanFilters),
  {
    ssr: false,
  }
);

const AddLoanModal = dynamic(
  () => import('@/features/loans').then((m) => m.AddLoanModal),
  {
    ssr: false,
  }
);

const LoanDeleteConfirm = dynamic(
  () => import('@/features/loans').then((m) => m.LoanDeleteConfirm),
  {
    ssr: false,
  }
);

import { UserNavDropdown } from '@/components/layout';
import type { Loan } from '@/types';

const ITEMS_PER_PAGE = 12;

/**
 * Loans Page - Debt & Credit Tracker 🤝
 * Ported to Next.js 15 (App Router)
 */
export default function LoansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'finished'>('active');

  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [loanToEdit, setLoanToEdit] = useState<Loan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: loans = [], isLoading } = useLoans();
  const deleteMutation = useDeleteLoan();

  const filteredLoans = loans
    .filter((l) => {
      const matchesSearch =
        l.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || l.type === filterType;
      const matchesTab =
        activeTab === 'active' ? l.status === 'active' : l.status === 'paid';
      return matchesSearch && matchesType && matchesTab;
    })
    .sort((a, b) => {
      if (a.due_date && b.due_date)
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, []);

  const totalPiutang = loans
    .filter((l) => l.type === 'piutang')
    .reduce((acc, l) => acc + l.remaining_amount, 0);
  const totalHutang = loans
    .filter((l) => l.type === 'utang')
    .reduce((acc, l) => acc + l.remaining_amount, 0);
  const netPosition = totalPiutang - totalHutang;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      {/* Mobile Header Greeting */}
      <div className="mb-10 flex justify-center text-center lg:hidden">
        <div className="glass-premium w-full items-center justify-center rounded-[32px] border border-white/50 px-10 py-6 shadow-2xl">
          <h2 className="text-xl leading-tight font-black tracking-tight text-slate-800 md:text-3xl">
            <span className="font-script mb-1 block text-5xl text-pink-600 md:text-8xl">
              Titipan Sayang
            </span>
            <span className="block text-xs font-bold tracking-normal text-slate-500 md:text-lg">
              Mencatat Amanah & Rezeki Kita... 🤝💰
            </span>
          </h2>
        </div>
      </div>

      <header className="mb-12 flex items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-100 transition-transform hover:rotate-3 md:h-14 md:w-14">
            <Image
              src="/logo-utama.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-sm leading-none font-black tracking-tight text-slate-800 uppercase md:text-2xl">
              Titipan<span className="text-pink-600">Sayang</span>
            </h1>
            <span className="font-mono text-[8px] leading-none font-black tracking-[0.3em] text-slate-400 uppercase md:text-[10px]">
              Loan Tracking Hub
            </span>
          </div>
        </div>

        <div className="glass-premium group relative hidden transform-gpu items-center justify-center overflow-hidden rounded-[48px] border border-white/50 px-[64px] py-6 shadow-2xl transition-transform hover:scale-105 lg:flex">
          <div className="absolute inset-0 bg-linear-to-r from-pink-50/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <h2 className="relative z-10 flex items-center text-2xl font-black tracking-tight whitespace-nowrap text-slate-800">
            <span className="font-script mr-5 block text-[4.2rem] leading-none text-pink-600 lg:inline-block">
              Sayang,
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-slate-600">
                Cek Daftar Titipan Sayang Kita Yuk... 😉
              </span>
              <span className="mt-2 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase opacity-60">
                Setiap Amanah Adalah Perjalanan Cinta 💖
              </span>
            </div>
            <span className="ml-2 inline-block animate-pulse">✨</span>
          </h2>
        </div>

        <div className="flex items-center gap-4 rounded-full border border-slate-100/50 bg-white/50 p-2 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md">
          <UserNavDropdown />
        </div>
      </header>

      {isLoading ? (
        <LoanStatSkeleton />
      ) : (
        <LoanStats
          totalPiutang={totalPiutang}
          totalHutang={totalHutang}
          netPosition={netPosition}
        />
      )}

      <div className="mb-10 flex justify-center">
        <div className="flex w-full max-w-[420px] transform-gpu gap-2 rounded-full border border-slate-100 bg-white/80 p-2 shadow-xl backdrop-blur-3xl transition-all hover:shadow-2xl">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              'flex h-14 flex-1 items-center justify-center gap-3 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all',
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            )}
          >
            <ClockIcon className="size-4" strokeWidth={3} />
            Titipan Aktif
          </button>
          <button
            onClick={() => setActiveTab('finished')}
            className={cn(
              'flex h-14 flex-1 items-center justify-center gap-3 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all',
              activeTab === 'finished'
                ? 'bg-pink-500 text-white shadow-xl shadow-pink-100'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            )}
          >
            <CheckCircleIcon className="size-4" strokeWidth={3} />
            Sudah Selesai
          </button>
        </div>
      </div>

      <LoanFilters
        localSearch={localSearch}
        onLocalSearchChange={setLocalSearch}
        onSearchSubmit={() => setSearchQuery(localSearch)}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      <div className="mt-12">
        {isLoading ? (
          <LoanCardSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {paginatedLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  isEditMode={isEditMode}
                  onEdit={(l) => setLoanToEdit(l)}
                  onDelete={(l) => setLoanToDelete(l)}
                  formatCurrency={formatCurrency}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-16 flex scale-110 items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="h-14 w-14 rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
          >
            <ArrowLeft className="size-5" strokeWidth={3} />
          </Button>
          <span className="rounded-2xl border border-slate-100 bg-white/50 px-6 py-3 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase backdrop-blur-md">
            {currentPage} dari {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="h-14 w-14 rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
          >
            <ArrowRight className="size-5" strokeWidth={3} />
          </Button>
        </div>
      )}

      <AddLoanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <AddLoanModal
        isOpen={!!loanToEdit}
        onClose={() => setLoanToEdit(null)}
        loan={loanToEdit || undefined}
      />
      <LoanDeleteConfirm
        loan={loanToDelete}
        onClose={() => setLoanToDelete(null)}
        onConfirm={async () => {
          if (loanToDelete) {
            await deleteMutation.mutateAsync(loanToDelete.id);
            setLoanToDelete(null);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
