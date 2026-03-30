import React, { useState } from 'react';
import { 
  ReceiptText,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch,
    hasNextPage,
    fetchNextPage
  } = useTransactions();
  
  const transactions = data?.pages.flat() || [];
  const deleteMutation = useDeleteTransaction();
  const { formatAmount } = useFormatting();

  const filteredTransactions = transactions.filter((t: Transaction) => {
    const title = t.description || t.category;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', ...Array.from(new Set(transactions.map((t: Transaction) => t.category)))];

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
    return <PageLoader isLoading={true} message="Tunggu sebentar ya Sayang, aku lagi siapkan datanya... ✨" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-10 text-center">
         <div className="glass-premium py-6 px-10 rounded-[32px] items-center justify-center shadow-2xl w-full border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Cuan & Jajan</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-widest leading-none">Mencatat Jejak Langkah Cuan Kita... 📝💰</span>
            </h2>
         </div>
      </div>

      {/* Header Row */}
      <header className="flex items-center justify-between mb-10 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
                Riwayat<span className="text-blue-600">Transaksi</span>
              </h1>
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 font-mono uppercase tracking-[0.3em]">
                Money Journals
              </span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-8 px-[64px] rounded-[48px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50 relative group overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight relative z-10 flex items-center">
               <span className="font-script text-[4.5rem] mr-5 text-pink-500 block lg:inline-block leading-none transform -rotate-2 group-hover:rotate-0 transition-transform">Sayang,</span> 
               <div className="flex flex-col">
                  <span className="text-slate-600 font-bold">Lihat Jejak Cuan & Jajan Kita Yuk... 😉✨</span>
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400 mt-2 opacity-60">Paling Jago Kalau Soal Hemat! 💖</span>
               </div>
            </h2>
         </div>

         <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-full border border-slate-100/50 shadow-sm">
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
              className="h-14 px-12 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] text-slate-500 hover:text-blue-600 hover:border-blue-200 border-dashed border-2 transition-all hover:bg-slate-50 active:scale-95"
            >
              Lihat Lebih Banyak Rekaman Mimpi ✨
            </Button>
          </div>
        )}

        {/* Empty State */}
        {transactions.length === 0 && !isLoading && (
          <div className="py-28 text-center space-y-6 bg-white/50 rounded-[48px] border-2 border-dashed border-slate-200">
            <div className="size-24 bg-white shadow-xl shadow-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-200 group animate-pulse">
              <ReceiptText size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-slate-600 uppercase tracking-[0.4em] text-[12px] mb-1">Jejak Belum Ditemukan</h4>
              <p className="text-slate-400 text-[10px] font-bold italic opacity-70">"Setiap keping jajan kita berharga, catat yuk Sayang! ✨"</p>
            </div>
            <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-50 px-8 h-12 rounded-full border border-blue-100"
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
