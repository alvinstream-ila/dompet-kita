import React, { useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditTransactionModal } from '@/components/features/EditTransactionModal';
import { CategoryManagementModal } from '@/components/features/CategoryManagementModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { UserNavDropdown } from '@/components/features/UserNavDropdown';
import { PageLoader } from '@/components/ui/PageLoader';
import { useFormatting } from '@/hooks/useFormatting';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import type { Transaction } from '@/types';

import { TransactionItem } from '../components/features/TransactionItem';
import { TransactionFilters } from '../components/features/TransactionFilters';

const Transactions: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  const { data, isLoading, isFetching, refetch, hasNextPage, fetchNextPage } =
    useTransactions();

  const transactions = data?.pages.flat() || [];
  const deleteMutation = useDeleteTransaction();
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

  const handleDelete = async (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteMutation.mutateAsync(transactionToDelete);
      setTransactionToDelete(null);
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
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="mb-10 flex justify-center text-center lg:hidden">
        <div className="glass-premium w-full items-center justify-center rounded-[32px] border border-white/50 px-10 py-6 shadow-2xl">
          <h2 className="text-xl leading-tight font-black tracking-tight text-slate-800 md:text-3xl">
            <span className="font-script mb-1 block text-5xl text-pink-500 md:text-8xl">
              Cuan & Jajan
            </span>
            <span className="block text-xs leading-none font-bold tracking-widest text-slate-500 md:text-lg">
              Mencatat Jejak Langkah Cuan Kita... 📝💰
            </span>
          </h2>
        </div>
      </div>

      {/* Header Row */}
      <header className="mb-10 flex items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-100 md:h-14 md:w-14">
            <img
              src="/logo-utama.svg"
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-sm leading-none font-black tracking-tight text-slate-800 uppercase md:text-2xl">
              Riwayat<span className="text-blue-600">Transaksi</span>
            </h1>
            <span className="font-mono text-[8px] font-bold tracking-[0.3em] text-slate-400 uppercase md:text-[10px]">
              Money Journals
            </span>
          </div>
        </div>

        {/* Desktop Greeting */}
        <div className="glass-premium group relative hidden transform-gpu items-center justify-center overflow-hidden rounded-[48px] border border-white/50 px-[64px] py-8 shadow-2xl transition-transform hover:scale-105 lg:flex">
          <div className="absolute inset-0 bg-linear-to-r from-blue-50/50 to-pink-50/50 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <h2 className="relative z-10 flex items-center text-2xl font-black tracking-tight whitespace-nowrap text-slate-800">
            <span className="font-script mr-5 block -rotate-2 transform text-[4.5rem] leading-none text-pink-500 transition-transform group-hover:rotate-0 lg:inline-block">
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

      {/* Control Buttons and Filters */}
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

      {/* Transaction List */}
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
            onDelete={handleDelete}
          />
        ))}

        {/* Dynamic Pagination Loader */}
        {transactions.length > 0 && hasNextPage && (
          <div className="flex justify-center pt-10">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              className="h-14 rounded-2xl border-2 border-dashed px-12 text-[11px] font-black tracking-[0.25em] text-slate-500 uppercase transition-all hover:border-blue-200 hover:bg-slate-50 hover:text-blue-600 active:scale-95"
            >
              Lihat Lebih Banyak Rekaman Mimpi ✨
            </Button>
          </div>
        )}

        {/* Empty State */}
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
                "Setiap keping jajan kita berharga, catat yuk Sayang! ✨"
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = '/')}
              className="h-12 rounded-full border border-blue-100 px-8 text-[10px] font-black tracking-widest text-blue-500 uppercase hover:bg-blue-50"
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
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Transactions;
