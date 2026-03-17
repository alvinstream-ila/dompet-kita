import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Sparkles,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditTransactionModal } from '../components/features/EditTransactionModal';
import { CategoryManagementModal } from '../components/features/CategoryManagementModal';
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import { PageLoader } from '../components/ui/PageLoader';
import { useFormatting } from '@/hooks/useFormatting';
import { cn } from "@/lib/utils";
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import type { Transaction } from '@/types';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
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
    fetchNextPage,
    isFetchingNextPage
  } = useTransactions();
  
  const transactions = data?.pages.flat() || [];
  const deleteMutation = useDeleteTransaction();
  const { formatAmount } = useFormatting();

  // Reset to page 1 when filters change (not strictly needed with infinite scroll but good for UX)
  React.useEffect(() => {
    // We might want to scroll to top or refetch with query filters
  }, [searchQuery, selectedCategory]);

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

  const filteredTransactions = transactions.filter(t => {
    const description = t.note || t.category;
    const matchesSearch = description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', ...Array.from(new Set(transactions.map(t => t.category)))];

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini, Sayang? 🥺')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const TransactionSkeleton = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-4 md:p-6 flex items-center gap-4 md:gap-6 shadow-sm border border-white animate-pulse">
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-slate-100 rounded-lg w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-slate-50 rounded-full w-24" />
          <div className="h-6 bg-slate-50 rounded-full w-24" />
        </div>
      </div>
      <div className="h-8 bg-slate-100 rounded-lg w-28" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Full screen loader only for catastrophic load, else use inline skeletons */}
      {isLoading && transactions.length === 0 && (
        <PageLoader isLoading={true} message="Tunggu sebentar ya Sayang, aku lagi siapkan datanya... ✨" />
      )}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
        <div className="bg-white/95 backdrop-blur-md py-4 md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl border border-white w-full transform-gpu">
          <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            <span className="font-script text-5xl md:text-8xl text-blue-500 block mb-1">Hallo Sayang..</span>
            <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Ini Daftar Transaksi Kita Yaa ❤️</span>
          </h2>
        </div>
      </div>

      {/* Header Row */}
      <header className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
            <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none">
              Dompet<span className="text-blue-600">Kita</span>
            </h1>
            <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">
              Financial Hub
            </span>
          </div>
        </div>

        {/* Desktop Greeting */}
        <div className="hidden lg:flex bg-white/80 backdrop-blur-2xl py-6 px-[58px] rounded-[40px] items-center justify-center border border-white shadow-2xl transition-transform hover:scale-105 text-center transform-gpu">
          <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
            <span className="font-script text-[5rem] mr-4 text-blue-500 block lg:inline-block leading-none">Hallo Sayang,</span> 
            <span className="text-slate-600 font-bold italic">Lihat <span className="text-blue-600 not-italic">Daftar Transaksi</span> Kita Disini.. ❤️</span>
            <span className="ml-2 inline-block animate-pulse">✨</span>
          </h2>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <Button variant="outline" size="icon" className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/95 backdrop-blur-lg md:backdrop-blur-xl shadow-xl border-white active:scale-95 transition-all p-0 group overflow-hidden relative transform-gpu">
            <motion.div 
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ willChange: 'opacity' }}
              className="absolute inset-0 bg-linear-to-tr from-yellow-200/50 via-yellow-100/30 to-white/10 blur-xl"
            />
            <div className="w-full h-full flex items-center justify-center z-10 rounded-full overflow-hidden">
              <video 
                src="/icons/3d/turtle-moon.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover scale-[1.2]" 
              />
            </div>
          </Button>
          <UserNavDropdown />
        </div>
      </header>

      {/* Search & Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
             <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center">
                <span className="text-sm font-bold">¥</span>
             </div>
          </div>
          <Input 
            placeholder="Cari Transaksi..." 
            className="h-14 pl-14 pr-4 bg-white/70 backdrop-blur-xl border-white rounded-[24px] shadow-sm text-slate-700 font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 placeholder:italic transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
            <Search className="w-5 h-5" />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative group/filter">
            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] px-6 h-14 flex items-center gap-4 shadow-sm min-w-[220px] cursor-pointer hover:bg-white/90 transition-all">
              <span className="text-slate-400 font-bold text-sm whitespace-nowrap">Filter Kategori</span>
              <div className="h-8 w-px bg-slate-100" />
              <div className="flex items-center justify-between flex-1">
                <span className="font-bold text-slate-700 text-sm">{selectedCategory}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
              </div>
            </div>
            
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-2xl border border-white rounded-[24px] shadow-2xl overflow-hidden opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all z-50">
              <div className="max-h-60 overflow-y-auto p-2">
                {categories.map((cat) => (
                  <div 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-3 rounded-xl cursor-pointer font-bold text-sm transition-all",
                      selectedCategory === cat ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="h-14 px-6 bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-[24px] border-none shadow-sm flex items-center gap-2 group transition-all"
          >
            <Settings2 className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-bold uppercase tracking-wider text-xs">Kategori</span>
          </Button>
        </div>
      </div>

      {/* Transaction List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 md:bg-white/60 backdrop-blur-lg md:backdrop-blur-3xl border border-white/80 rounded-[48px] p-4 md:p-8 min-h-[60vh] shadow-xl relative overflow-hidden transform-gpu">
        <div className="absolute top-1/4 left-10 opacity-10 pointer-events-none text-center">
          <div className="w-20 h-20 bg-pink-300 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-10 pointer-events-none text-center">
          <div className="w-32 h-32 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="space-y-4 relative z-10">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <TransactionSkeleton key={i} />)
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((t) => (
              <motion.div 
                key={t.id} 
                layout 
                className="bg-white/95 md:bg-white/90 md:backdrop-blur-sm rounded-[32px] p-4 md:p-6 flex items-center gap-4 md:gap-6 shadow-sm border border-white hover:shadow-md transition-all group overflow-hidden transform-gpu"
                style={{ willChange: 'transform, opacity' }}
              >
                <div className={cn(
                  "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  t.type === 'income' ? 'bg-emerald-50 text-emerald-500 shadow-sm shadow-emerald-100' : 'bg-pink-50 text-pink-500 shadow-sm shadow-pink-100'
                )}>
                  {getCategoryIcon(t.category, t.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-base md:text-xl tracking-tight leading-none mb-2 truncate uppercase group-hover:text-blue-600 transition-colors">
                    {t.note || t.category}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] md:text-xs font-bold text-slate-400 tracking-wider">
                    <div className="flex items-center gap-1.5 py-1 px-3 bg-slate-50 rounded-full border border-slate-100">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="uppercase">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-1 px-3 bg-slate-50 rounded-full border border-slate-100">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span className="uppercase">{t.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className={cn(
                    "font-black text-lg md:text-2xl tracking-tighter whitespace-nowrap drop-shadow-sm",
                    t.type === 'income' ? 'text-emerald-500' : 'text-pink-500'
                  )}>
                    {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => {
                        setSelectedTransaction(t);
                        setIsEditModalOpen(true);
                      }}
                      className="w-9 h-9 md:w-11 md:h-11 rounded-xl hover:bg-blue-50 group/edit flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400 group-hover/edit:text-blue-500" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="w-9 h-9 md:w-11 md:h-11 rounded-xl hover:bg-red-50 group/delete flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 group-hover/delete:text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 opacity-30 text-center">
              <ReceiptText className="w-16 h-16 mb-4" strokeWidth={1} />
              <p className="font-black uppercase tracking-[0.3em] text-sm">Tidak ada transaksi ditemukan</p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasNextPage && (
          <div className="mt-10 flex items-center justify-center relative z-20">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-10 h-14 rounded-2xl bg-white border border-slate-100 shadow-xl hover:bg-blue-50 text-slate-800 font-black uppercase tracking-widest text-[11px] disabled:opacity-50 transition-all"
            >
              {isFetchingNextPage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Memuat...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Lihat Transaksi Lainnya
                </>
              )}
            </Button>
          </div>
        )}

        {/* Background Fetching Indicator */}
        {!isLoading && isFetching && !isFetchingNextPage && (
          <div className="absolute bottom-6 right-8 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg animate-bounce z-30">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Updating...</span>
          </div>
        )}
      </motion.div>

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSuccess={() => refetch()}
        transaction={selectedTransaction}
      />

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};

export default Transactions;
