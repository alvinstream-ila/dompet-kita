'use client';

import { ReceiptText } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserNavDropdown } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PageLoader } from '@/components/ui/PageLoader';
import { CategoryManagementModal } from '@/features/settings';
import { useFormatting } from '@/lib/hooks/useFormatting';
import type { Transaction } from '@/types';

import { EditTransactionModal } from './EditTransactionModal';
import { useDeleteTransaction, useTransactions } from './hooks/useTransactions';
import { TransactionFilters } from './TransactionFilters';
import { TransactionItem } from './TransactionItem';

export function TransactionsView() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const { data, isLoading, isFetching, refetch, hasNextPage, fetchNextPage } =
    useTransactions();

  const { mutateAsync: deleteTransaction, isPending: isDeleting } =
    useDeleteTransaction();

  const transactions = data?.pages.flat() || [];
  const { formatAmount } = useFormatting();

  const filteredTransactions = transactions.filter((t: Transaction) => {
    const title = t.description || t.category;
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'Semua',
    ...Array.from(new Set(transactions.map((t: Transaction) => t.category))),
  ];

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteTransaction(transactionToDelete);
    } catch (error) {
      // Error handled by hook toast
    } finally {
      setTransactionToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (isLoading && transactions.length === 0) {
    return (
      <PageLoader
        isLoading={true}
        message="Tunggu sebentar ya Sayang, aku lagi siapkan datanya... ✨"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      <div className="mb-10 flex justify-center text-center lg:hidden">
        <div className="glass-premium w-full items-center justify-center rounded-[32px] border border-white/50 px-10 py-6 shadow-2xl">
          <h2 className="text-xl leading-tight font-black tracking-tight text-slate-800 md:text-3xl">
            <span className="font-script text-pink-primary mb-1 block text-5xl md:text-8xl">
              Cuan & Jajan
            </span>
            <span className="block text-xs leading-none font-bold tracking-widest text-slate-500 md:text-lg">
              Mencatat Jejak Langkah Cuan Kita... 📝💰
            </span>
          </h2>
        </div>
      </div>

      <header className="mb-8 flex items-center justify-between gap-3 md:mb-12">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-100 md:h-14 md:w-14">
            <Image
              src="/logo-utama.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-sm leading-none font-black tracking-tight text-slate-800 uppercase md:text-2xl">
              Riwayat<span className="text-blue-royal">Transaksi</span>
            </h1>
            <span className="font-mono text-[8px] font-bold tracking-[0.3em] text-slate-400 uppercase md:text-[10px]">
              Money Journals
            </span>
          </div>
        </div>

        <div className="glass-premium group relative hidden transform-gpu items-center justify-center overflow-hidden rounded-[48px] border border-white/50 px-[64px] py-8 shadow-2xl transition-transform hover:scale-105 lg:flex">
          <div className="from-blue-royal/10 to-pink-primary/10 absolute inset-0 bg-linear-to-r opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <h2 className="relative z-10 flex items-center text-2xl font-black tracking-tight whitespace-nowrap text-slate-800">
            <span className="font-script text-pink-primary mr-5 block -rotate-2 transform text-[4.5rem] leading-none transition-transform group-hover:rotate-0 lg:inline-block">
              Sayang,
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-slate-600">
                Lihat Jejak Cuan & Jajan Kita Yuk... 😉✨
              </span>
              <span className="mt-2 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase opacity-60">
                Paling Jago Kalau Soal Hemat! 💖
              </span>
            </div>
          </h2>
        </div>

        <div className="flex items-center gap-4 rounded-full border border-slate-100/50 bg-white/50 p-2 shadow-sm backdrop-blur-md">
          <UserNavDropdown />
        </div>
      </header>

      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      <div className="space-y-5">
        {filteredTransactions.map((t: Transaction, index: number) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            index={index}
            formatAmount={formatAmount}
            onEdit={(trans) => {
              setSelectedTransaction(trans);
              setIsEditModalOpen(true);
            }}
            onDelete={() => handleDelete(t)}
          />
        ))}

        {transactions.length > 0 && hasNextPage && (
          <div className="flex justify-center pt-10">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              className="hover:border-blue-royal/30 hover:text-blue-royal h-14 rounded-2xl border-2 border-dashed px-12 text-[11px] font-black tracking-[0.25em] text-slate-500 uppercase transition-all hover:bg-slate-50 active:scale-95"
            >
              Lihat Lebih Banyak Rekaman Mimpi ✨
            </Button>
          </div>
        )}

        {transactions.length === 0 && !isLoading && (
          <div className="space-y-6 rounded-[48px] border-2 border-dashed border-slate-200 bg-white/50 py-28 text-center">
            <div className="group mx-auto flex size-24 animate-pulse items-center justify-center rounded-full bg-white text-slate-200 shadow-xl shadow-slate-100">
              <ReceiptText size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h4 className="mb-1 text-[12px] font-black tracking-[0.4em] text-slate-600 uppercase">
                Jejak Belum Ditemukan
              </h4>
              <p className="text-[10px] font-bold text-slate-400 italic opacity-70">
                &quot;Setiap keping jajan kita berharga, catat yuk Sayang!
                ✨&quot;
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => (globalThis.location.href = '/')}
              className="border-blue-royal/10 text-blue-royal hover:bg-blue-royal/5 h-12 rounded-full border px-8 text-[10px] font-black tracking-widest uppercase"
            >
              Mulai Mencatat
            </Button>
          </div>
        )}
      </div>

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={selectedTransaction}
        onSuccess={() => refetch()}
      />

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
