import React, { useState } from 'react';
import { 
  Search,
  Settings2,
  Edit3,
  Trash2,
  Calendar,
  ReceiptText,
  ChevronDown,
  RefreshCw,
  Utensils,
  Car,
  Home as HomeIcon,
  ShoppingBag,
  Gamepad,
  Heart,
  GraduationCap,
  Zap as ZapIcon,
  Briefcase,
  TrendingUp,
  Gift,
  Coins,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditTransactionModal } from '@/components/features/EditTransactionModal';
import { CategoryManagementModal } from '@/components/features/CategoryManagementModal';
import { UserNavDropdown } from '@/components/features/UserNavDropdown';
import { PageLoader } from '@/components/ui/PageLoader';
import { useFormatting } from '@/hooks/useFormatting';
import { cn } from "@/lib/utils";
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import type { Transaction } from '@/types';

const Transactions: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

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

  const getCategoryIcon = (category: string, type: string) => {
    const cat = category.toLowerCase();
    if (type === 'income') {
      if (cat.includes('gaji')) return <Briefcase className="w-5 h-5" />;
      if (cat.includes('investasi') || cat.includes('tabungan')) return <TrendingUp className="w-5 h-5" />;
      if (cat.includes('hadiah') || cat.includes('bonus')) return <Gift className="w-5 h-5" />;
      if (cat.includes('bisnis') || cat.includes('jual')) return <Coins className="w-5 h-5" />;
      return <ArrowUpCircle className="w-5 h-5" />;
    }
    
    if (cat.includes('makan') || cat.includes('minum')) return <Utensils className="w-5 h-5" />;
    if (cat.includes('transport') || cat.includes('ojek') || cat.includes('bensin')) return <Car className="w-5 h-5" />;
    if (cat.includes('rumah') || cat.includes('kos')) return <HomeIcon className="w-5 h-5" />;
    if (cat.includes('belanja') || cat.includes('market')) return <ShoppingBag className="w-5 h-5" />;
    if (cat.includes('hiburan') || cat.includes('jalan') || cat.includes('nonton')) return <Gamepad className="w-5 h-5" />;
    if (cat.includes('sehat') || cat.includes('obat') || cat.includes('skincare')) return <Heart className="w-5 h-5" />;
    if (cat.includes('didik') || cat.includes('kuliah') || cat.includes('sekolah')) return <GraduationCap className="w-5 h-5" />;
    if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('pulsa') || cat.includes('wifi')) return <ZapIcon className="w-5 h-5" />;
    return <ArrowDownCircle className="w-5 h-5" />;
  };

  const filteredTransactions = transactions.filter((t: Transaction) => {
    const description = t.note || t.category;
    const matchesSearch = description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', ...Array.from(new Set(transactions.map((t: Transaction) => t.category)))];

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini, Sayang? 🥺')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading && transactions.length === 0) {
    return <PageLoader isLoading={true} message="Tunggu sebentar ya Sayang, aku lagi siapkan datanya... ✨" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
         <div className="glass-premium py-4 h-auto md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl w-full transform-gpu border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Cuan & Jajan</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Mencatat Setiap Langkah Cuan Kita... 📝💰</span>
            </h2>
         </div>
      </div>

      {/* Header Row */}
      <header className="flex items-center justify-between mb-10 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                Riwayat<span className="text-blue-600">Transaksi</span>
              </h1>
              <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">
                Money Journals
              </span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50">
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
               <span className="font-script text-[4rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span> 
               <span className="text-slate-600 font-bold">Lihat Jejak Cuan & Jajan Kita Yuk... 😉✨</span>
               <span className="ml-2 inline-block animate-pulse">✨</span>
            </h2>
         </div>

         <div className="flex items-center gap-4 md:gap-8">


            <UserNavDropdown />
         </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div className="flex flex-1 w-full gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 rounded-2xl bg-white border-slate-100 font-bold focus:ring-blue-500/10 shadow-sm"
            />
          </div>
          <div className="relative group">
            <Settings2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-12 pl-12 pr-10 rounded-2xl bg-white border-slate-100 font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm min-w-[160px]"
            >
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex-1 md:flex-none h-12 px-6 rounded-2xl border-slate-100 font-bold bg-white"
          >
            Kategori
          </Button>
          <Button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold flex items-center gap-2 shadow-xl shadow-slate-200"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.map((t: Transaction, index: number) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white rounded-[32px] p-4 md:p-6 flex items-center gap-4 md:gap-6 shadow-sm border border-slate-100/50 hover:shadow-xl hover:border-blue-100 transition-all group"
          >
            <div className={cn(
              "size-12 md:size-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
              t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {getCategoryIcon(t.category, t.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-slate-800 tracking-tight truncate">
                  {t.note || t.category}
                </h3>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                  t.type === 'income' 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                  {t.type}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {new Date(t.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="size-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <p className={cn(
                "text-base md:text-xl font-black tracking-tight",
                t.type === 'income' ? "text-emerald-600" : "text-slate-800"
              )}>
                {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
              </p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 rounded-xl hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => {
                    setSelectedTransaction(t);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit3 size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {transactions.length > 0 && hasNextPage && (
          <div className="flex justify-center pt-8">
            <Button 
              variant="ghost" 
              onClick={() => fetchNextPage()}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500"
            >
              Lihat Lebih Banyak...
            </Button>
          </div>
        )}

        {transactions.length === 0 && !isLoading && (
          <div className="py-20 text-center space-y-4">
            <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <ReceiptText size={40} />
            </div>
            <div className="space-y-1">
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Belum Ada Transaksi</p>
              <p className="text-slate-400 text-xs font-bold">Catat transaksi pertama kita yuk, Sayang! ✨</p>
            </div>
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
    </div>
  );
};

export default Transactions;
