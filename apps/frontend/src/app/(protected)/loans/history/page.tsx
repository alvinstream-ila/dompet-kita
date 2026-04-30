'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  History,
  LayoutGrid,
  Search,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserNavDropdown } from '@/components/layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/PageLoader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeleteLoan, useLoans } from '@/features/loans';
import { cn } from '@/lib/utils';
import type { Loan } from '@/types';

const ITEMS_PER_PAGE = 15;

/**
 * Loan History Page - Completed Loans Archive 📁
 * Ported to Next.js 15 (App Router)
 * - Replaces `useNavigate` from react-router-dom with `useRouter` from next/navigation
 */
export default function LoanHistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: loans = [], isLoading } = useLoans();
  const { mutate: deleteLoan, isPending: isDeleting } = useDeleteLoan();

  // Filter only PAID loans
  const historyLoans = loans
    .filter((l) => l.status === 'paid')
    .filter((l) => {
      const matchesSearch =
        l.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || l.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const totalPages = Math.ceil(historyLoans.length / ITEMS_PER_PAGE);
  const paginatedLoans = historyLoans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes

  if (isLoading)
    return (
      <PageLoader isLoading={true} message="Membuka arsip titipan sayang..." />
    );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      <header className="mb-12">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            {/* Back button — uses `useRouter` in place of `useNavigate` */}
            <button
              type="button"
              className="mb-3 flex appearance-none items-center justify-start gap-3 border-none bg-transparent px-0 text-left"
              onClick={() => router.push('/loans')}
            >
              <div className="rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-colors hover:bg-slate-50">
                <ArrowLeft className="size-5 text-slate-600" />
              </div>
              <span className="inline-block cursor-pointer rounded-full border border-pink-100/50 bg-pink-50 px-3 py-1 text-[10px] font-black tracking-widest text-pink-600 uppercase transition-colors hover:bg-pink-100">
                Arsip Titipan Lunas ✨
              </span>
            </button>
            <h1 className="text-4xl font-black tracking-tighter text-slate-800 md:text-5xl">
              Riwayat <span className="text-pink-500">Titipan</span>
            </h1>
            <p className="mt-2 font-bold text-slate-500 italic">
              Semua titipan yang udah lunas aman disini ya Sayang! 💖
            </p>
          </motion.div>
          <UserNavDropdown />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full flex-1 gap-2">
            <div className="group relative flex-1">
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-pink-500" />
              <Input
                placeholder="Cari arsip titipan..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && setSearchQuery(localSearch)
                }
                className="h-12 rounded-2xl border-slate-100 bg-white pl-12 font-bold shadow-sm focus:ring-pink-500/10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-12 w-[140px] rounded-2xl border-slate-100 bg-white font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="size-4 text-slate-400" />
                    <SelectValue placeholder="Tipe" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="utang">Hutang Lunas</SelectItem>
                  <SelectItem value="piutang">Piutang Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main List Container */}
      <div className="mx-auto max-w-6xl px-2">
        <div className="relative flex min-h-[550px] transform-gpu flex-col overflow-hidden rounded-[40px] border border-slate-100 bg-white p-5 shadow-2xl md:p-10">
          {/* Background Aesthetic Blobs */}
          <div className="absolute top-0 right-0 -z-10 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl md:blur-[100px]" />
          <div className="absolute bottom-0 left-0 -z-10 h-80 w-80 rounded-full bg-pink-400/10 blur-3xl md:blur-[100px]" />

          <div className="relative z-10 flex-1 space-y-4">
            {paginatedLoans.length > 0 ? (
              paginatedLoans.map((loan, idx) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group transform-gpu rounded-[28px] border border-white/60 bg-white/95 p-4 shadow-lg transition-all hover:bg-white md:bg-white/80 md:p-6 md:backdrop-blur-md"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
                    {/* Left Info Column */}
                    <div className="flex w-full shrink-0 items-center gap-4 md:w-44">
                      <div
                        className={cn(
                          'h-14 w-2 rounded-full shadow-inner',
                          loan.type === 'piutang'
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        )}
                      />
                      <div>
                        <p
                          className={cn(
                            'text-[10px] font-black tracking-widest uppercase',
                            loan.type === 'piutang'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          )}
                        >
                          {loan.type === 'piutang'
                            ? 'PIUTANG LUNAS'
                            : 'HUTANG LUNAS'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {new Date(loan.created_at).toLocaleDateString(
                            'id-ID',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )}
                        </p>
                        <p className="max-w-[120px] truncate text-xs font-black text-slate-800">
                          {loan.contact_name}
                        </p>
                      </div>
                    </div>

                    {/* Center Stats Column */}
                    <div className="flex w-full flex-1 items-center justify-between gap-4 md:gap-8">
                      <div className="min-w-[120px] shrink-0 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-2.5">
                        <p className="mb-0.5 text-[10px] font-bold tracking-tight text-slate-400 uppercase">
                          Keterangan
                        </p>
                        <p className="max-w-[150px] truncate text-xs font-bold text-slate-600 italic">
                          &quot;{loan.description}&quot;
                        </p>
                      </div>

                      {/* Lunas Badge */}
                      <div className="hidden items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50/50 px-6 py-2.5 sm:flex">
                        <CheckCircle2
                          className="h-5 w-5 text-emerald-500"
                          strokeWidth={3}
                        />
                        <span className="text-xs font-black tracking-widest text-emerald-600 uppercase">
                          Selesai Lunas
                        </span>
                      </div>

                      <div className="min-w-[120px] shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-2.5">
                        <p className="mb-0.5 text-[10px] font-bold tracking-tight text-emerald-600/70 uppercase">
                          Nilai Total
                        </p>
                        <p className="text-sm font-black text-emerald-700 md:text-base">
                          {formatCurrency(loan.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Right Action Column */}
                    <div className="mt-2 flex w-full shrink-0 items-center gap-4 md:mt-0 md:w-auto">
                      <Button
                        onClick={() => setLoanToDelete(loan)}
                        variant="ghost"
                        className="size-11 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 transition-all duration-300 hover:bg-rose-500 hover:text-white md:size-12"
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-24 text-slate-400">
                <div className="mb-6 rounded-[40px] border border-white/40 bg-white/50 p-8 shadow-xl">
                  <History className="h-20 w-20 text-slate-300/40" />
                </div>
                <p className="mb-2 text-xl font-black text-slate-600">
                  Belum Ada Riwayat ✨
                </p>
                <p className="max-w-xs text-center font-medium text-slate-400">
                  Arsip Sayang masih kosong, semangat selesaikan titipan
                  aktifnya yaa!
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-8">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="h-10 w-10 rounded-xl border-white/60 bg-white/50 text-[10px] font-black uppercase shadow-lg backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 md:w-auto md:px-6"
                >
                  <ArrowLeft className="h-4 w-4 md:mr-2" strokeWidth={3} />
                  <span className="hidden md:inline">Sebelumnya</span>
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="h-10 w-10 rounded-xl border-white/60 bg-white/50 text-[10px] font-black uppercase shadow-lg backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 md:w-auto md:px-6"
                >
                  <span className="hidden md:inline">Selanjutnya</span>
                  <ArrowRight className="h-4 w-4 md:ml-2" strokeWidth={3} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!loanToDelete}
        onOpenChange={(open: boolean) => !open && setLoanToDelete(null)}
      >
        <DialogContent className="max-w-[340px] overflow-hidden rounded-3xl border-none bg-white p-0">
          <div className="flex flex-col items-center gap-2 bg-rose-500 p-6 text-center">
            <div className="mb-2 rounded-2xl bg-white/20 p-3 backdrop-blur-md">
              <AlertTriangle className="h-8 w-8 text-white" strokeWidth={3} />
            </div>
            <DialogTitle className="text-xl font-black text-white">
              Hapus Arsip?
            </DialogTitle>
          </div>

          <div className="space-y-4 p-6 text-center">
            <DialogDescription className="text-center text-sm leading-relaxed font-bold text-slate-500">
              Yakin mau hapus permanen arsip dari{' '}
              <span className="text-rose-500">
                &quot;{loanToDelete?.contact_name}&quot;
              </span>
              ?<br />
              Data sejarah ini bakal hilang selamanya lho Sayang.. 🥺
            </DialogDescription>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  if (loanToDelete) {
                    deleteLoan(loanToDelete.id);
                    setLoanToDelete(null);
                  }
                }}
                disabled={isDeleting}
                className="h-12 w-full rounded-xl border-b-4 border-rose-700 bg-rose-500 text-xs font-black text-white uppercase shadow-lg transition-all hover:bg-rose-600 active:translate-y-1 active:border-b-0 disabled:opacity-70"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus Permanen! 🗑️'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLoanToDelete(null)}
                className="h-12 w-full rounded-xl text-xs font-black text-slate-400 uppercase hover:bg-slate-50"
              >
                Gak Jadi Sayang.. 🙏
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
