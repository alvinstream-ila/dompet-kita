'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Droplets,
  History,
  Home,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Wifi,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { UserNavDropdown } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/PageLoader';
import { Progress } from '@/components/ui/progress';
import { BillFormModal, useBills } from '@/features/bills';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<unknown>> = {
  Listrik: Zap,
  Air: Droplets,
  Internet: Wifi,
  Sewa: Home,
  Asuransi: ShieldCheck,
  Cicilan: CreditCard,
  Lainnya: Settings2,
};

const COLOR_MAP: Record<string, string> = {
  Listrik: 'bg-amber-100 text-amber-600',
  Air: 'bg-blue-100 text-blue-600',
  Internet: 'bg-violet-100 text-violet-600',
  Sewa: 'bg-emerald-100 text-emerald-600',
  Asuransi: 'bg-cyan-100 text-cyan-600',
  Cicilan: 'bg-rose-100 text-rose-600',
  Lainnya: 'bg-slate-100 text-slate-600',
};

export default function ScheduledBillsPage() {
  const router = useRouter();
  const { bills, isLoading, markAsPaid, deleteBill } = useBills();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pendingBills = bills.filter((b) => b.status === 'pending');
  const paidBills = bills.filter((b) => b.status === 'paid');

  const totalAmount = bills.reduce((acc, b) => acc + b.amount, 0);
  const paidAmount = paidBills.reduce((acc, b) => acc + b.amount, 0);
  const progressPercent =
    totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading)
    return (
      <PageLoader
        isLoading={true}
        message="Menyusun jadwal tagihan kesayangan... 🗓️"
      />
    );

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      {/* Header Section */}
      <header className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-14 md:flex-row md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <button
            type="button"
            onClick={() => router.push('/')}
            className="group mb-2 flex items-center gap-2 transition-all"
          >
            <div className="rounded-full border border-slate-100 bg-white p-1.5 shadow-sm group-hover:bg-slate-50">
              <ArrowLeft className="size-4 text-slate-500" />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors group-hover:text-slate-600">
              Dashboard Utama
            </span>
          </button>
          <h1 className="text-4xl font-black tracking-tight text-slate-800 md:text-5xl">
            Tagihan <span className="text-cyan-500">Kita</span> 🗓️
          </h1>
          <p className="font-bold text-slate-400 italic">
            Atur pengeluaran rutin biar nggak ada penalti ya Sayang! 💖
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-14 rounded-3xl border-b-4 border-cyan-700 bg-cyan-500 px-8 text-xs font-black text-white uppercase shadow-xl shadow-cyan-100 transition-all hover:bg-cyan-600 active:translate-y-1 active:border-b-0"
          >
            <Plus className="mr-2 size-5" strokeWidth={3} />
            Tambah Tagihan
          </Button>
          <UserNavDropdown />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Side: Stats & Filters */}
        <div className="space-y-6 lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[40px] border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Progres Pembayaran
              </span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            </div>

            <div className="mb-4 flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-800">
                  {formatCurrency(paidAmount)}
                </h3>
                <p className="mt-0.5 text-[10px] font-bold text-slate-400 italic">
                  Berhasil Terbayar
                </p>
              </div>
              <span className="text-xl font-black text-cyan-500">
                {Math.round(progressPercent)}%
              </span>
            </div>

            <Progress
              value={progressPercent}
              className="h-3 rounded-full bg-slate-100"
            />

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-cyan-100/50 bg-cyan-50 p-4">
                <p className="mb-1 text-[9px] font-black text-cyan-600 uppercase">
                  Butuh Bayar
                </p>
                <p className="text-sm font-black text-slate-800">
                  {pendingBills.length} Item
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100/50 bg-emerald-50 p-4">
                <p className="mb-1 text-[9px] font-black text-emerald-600 uppercase">
                  Sudah Lunas
                </p>
                <p className="text-sm font-black text-slate-800">
                  {paidBills.length} Item
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Info Card */}
          <Card className="rounded-[40px] border-none bg-linear-to-br from-slate-900 to-slate-800 p-8 shadow-2xl">
            <CardContent className="p-0">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2">
                  <AlertCircle className="size-5 text-cyan-400" />
                </div>
                <h4 className="text-sm font-black tracking-wider text-white uppercase">
                  Tips Manajemen
                </h4>
              </div>
              <p className="text-xs leading-relaxed font-bold text-slate-400 italic">
                Cintaku, prioritaskan tagihan dengan bunga tertinggi dulu ya.
                Kalau butuh bantuan analisis cicilan, tanya aku aja! ✨
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Bills List */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {bills.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-slate-200 bg-white/40 py-20"
              >
                <div className="mb-6 rounded-[32px] bg-white p-6 shadow-xl">
                  <Calendar className="size-16 text-slate-200" />
                </div>
                <h3 className="mb-2 text-xl font-black text-slate-800">
                  Belum Ada Tagihan Terjadwal
                </h3>
                <p className="max-w-xs px-10 text-center text-xs font-bold text-slate-400">
                  Tandai tagihan bulanan kita disini biar pengeluaran termonitor
                  dengan baik Sayang! 🥰
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 text-[10px] font-black tracking-widest text-cyan-500 uppercase hover:bg-cyan-50"
                >
                  Mulai Tambah Sekarang
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="mb-2 flex items-center justify-between px-4">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    List Tagihan Rutin
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-slate-500 hover:bg-white"
                    >
                      <Search className="mr-1 size-3" /> Filter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-slate-500 hover:bg-white"
                    >
                      <Settings2 className="mr-1 size-3" /> Urutan
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {bills.map((bill, idx) => {
                    const CategoryIcon = (ICON_MAP[bill.category] ||
                      ReceiptText) as React.ElementType;
                    const isPaid = bill.status === 'paid';

                    return (
                      <motion.div
                        key={bill.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          'group relative flex flex-col gap-4 overflow-hidden rounded-[32px] border border-white/60 p-5 shadow-xl transition-all sm:flex-row sm:items-center sm:justify-between md:p-6',
                          isPaid
                            ? 'bg-slate-50/50 opacity-70'
                            : 'bg-white hover:-translate-y-1 hover:shadow-2xl'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110',
                              COLOR_MAP[bill.category]
                            )}
                          >
                            <CategoryIcon className="size-7" />
                          </div>
                          <div>
                            <div className="mb-0.5 flex items-center gap-2">
                              <h4 className="text-base font-black text-slate-800">
                                {bill.name}
                              </h4>
                              {isPaid && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-black text-emerald-600 uppercase">
                                  Lunas
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" /> Jatuh Tempo:{' '}
                                {bill.dueDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <History className="size-3" /> Tiap{' '}
                                {bill.frequency}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-6 sm:justify-end sm:gap-8">
                          <div className="text-right">
                            <p className="mb-0.5 text-[9px] font-black text-slate-400 uppercase">
                              Estimasi Nominal
                            </p>
                            <p className="text-lg font-black text-slate-800">
                              {formatCurrency(bill.amount)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPaid ? (
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50">
                                <CheckCircle2
                                  className="size-6 text-emerald-500"
                                  strokeWidth={3}
                                />
                              </div>
                            ) : (
                              <Button
                                onClick={() => markAsPaid(bill.id)}
                                className="h-11 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 text-[10px] font-black text-white uppercase shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
                              >
                                Bayar Sekarang
                              </Button>
                            )}

                            <Button
                              onClick={() => deleteBill(bill.id)}
                              variant="ghost"
                              className="h-11 w-11 rounded-2xl border border-slate-50 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500"
                            >
                              <Trash2 className="size-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Aesthetic Highlight for Pending */}
                        {!isPaid && (
                          <div className="absolute top-0 left-0 h-full w-1.5 bg-cyan-500" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BillFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
