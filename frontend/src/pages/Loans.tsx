import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Pencil,
  LayoutGrid,
  Trash2,
  AlertTriangle,
  History as HistoryIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLoans, useDeleteLoan } from '@/hooks/useLoans';
import { PageLoader } from '@/components/ui/PageLoader';
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import { AddLoanModal } from '../components/features/AddLoanModal';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Loan } from '@/types';

const ITEMS_PER_PAGE = 15;

const Loans: React.FC = () => {
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
  const { mutate: deleteLoan } = useDeleteLoan();

  const filteredLoans = loans
    .filter(l => {
      const matchesSearch = l.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           l.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || l.type === filterType;
      const matchesTab = activeTab === 'active' ? l.status === 'active' : l.status === 'paid';
      return matchesSearch && matchesType && matchesTab;
    })
    .sort((a, b) => {
      // If both have due dates, compare them
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      // Prioritize items WITH due dates over those WITHOUT
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      // If none have due dates, sort by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  if (isLoading) return <PageLoader isLoading={true} message="Lagi ngitung titipan sayang kita..." />;

  const totalPiutang = loans.filter(l => l.type === 'piutang').reduce((acc, l) => acc + l.remaining_amount, 0);
  const totalHutang = loans.filter(l => l.type === 'utang').reduce((acc, l) => acc + l.remaining_amount, 0);
  const netPosition = totalPiutang - totalHutang;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
         <div className="glass-premium py-4 h-auto md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl w-full transform-gpu border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Titipan Sayang</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Mencatat Amanah & Rezeki Kita... 🤝💰</span>
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
                Titipan<span className="text-pink-600">Sayang</span>
              </h1>
              <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">
                Loan Tracking
              </span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50">
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
               <span className="font-script text-[4rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span> 
               <span className="text-slate-600 font-bold">Cek Daftar Titipan Sayang Kita Yuk... 📝✨</span>
               <span className="ml-2 inline-block animate-pulse">✨</span>
            </h2>
         </div>

         <div className="flex items-center gap-4 md:gap-8">


            <UserNavDropdown />
         </div>
      </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Titipan Keluar (Rezeki)" amount={totalPiutang} imageSrc="/icons/3d/income.webp" variant="income" />
          <StatCard title="Titipan Masuk (Amanah)" amount={totalHutang} imageSrc="/icons/3d/expense.webp" variant="expense" />
          <StatCard 
            title="Posisi Bersih" 
            amount={netPosition} 
            imageSrc="/icons/3d/wallet.webp" 
            variant={netPosition >= 0 ? "income" : "expense"}
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/50 backdrop-blur-xl p-1.5 rounded-[24px] border border-slate-100 shadow-sm flex gap-1">
            <button
              onClick={() => setActiveTab('active')}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-[18px] text-sm font-black transition-all",
                activeTab === 'active' 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-white"
              )}
            >
              <Clock className="size-4" />
              Titipan Aktif
            </button>
            <button
              onClick={() => setActiveTab('finished')}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-[18px] text-sm font-black transition-all",
                activeTab === 'finished' 
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-200" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-white"
              )}
            >
              <CheckCircle2 className="size-4" />
              Titipan Selesai
            </button>
          </div>
        </div>


        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-1 w-full gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              <Input 
                placeholder="Cari titipan..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(localSearch)}
                className="h-12 pl-12 rounded-2xl bg-white border-slate-100 font-bold focus:ring-pink-500/10 shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-12 rounded-2xl bg-white border-slate-100 font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="size-4 text-slate-400" />
                    <SelectValue placeholder="Tipe" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="utang">Titipan Masuk</SelectItem>
                  <SelectItem value="piutang">Titipan Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                "h-12 w-12 rounded-2xl border-slate-100 transition-all",
                isEditMode ? "bg-slate-900 text-white border-slate-900" : "bg-white"
              )}
            >
              <Pencil className="size-4" />
            </Button>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold flex items-center gap-2 shadow-xl shadow-slate-200"
            >
              <Plus className="size-4" />
              Tambah Titipan Sayang
            </Button>
          </div>
        </div>

        <div className="mt-8 mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {paginatedLoans.map((loan) => (
              <motion.div
                key={loan.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    loan.type === 'utang' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {loan.type === 'utang' ? 'Masuk' : 'Keluar'}
                  </div>
                  {isEditMode && (
                    <div className="flex items-center gap-1">
                      {loan.status !== 'paid' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => setLoanToEdit(loan)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => setLoanToDelete(loan)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">
                      {loan.contact_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {loan.description || 'Tanpa keterangan'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Sisa Tagihan</p>
                        <p className="text-xl font-black text-slate-800 tracking-tighter">
                          {formatCurrency(loan.remaining_amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          loan.status === 'paid' ? "text-emerald-500" : "text-amber-500"
                        )}>
                          {loan.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((loan.amount - loan.remaining_amount) / loan.amount) * 100}%` }}
                        className={cn(
                          "h-full rounded-full",
                          loan.type === 'utang' ? "bg-rose-500" : "bg-emerald-500"
                        )}
                      />
                    </div>
                  </div>

                  {loan.due_date && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <HistoryIcon size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Jatuh Tempo: {new Date(loan.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="rounded-full h-12 w-12 border-slate-100"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="rounded-full h-12 w-12 border-slate-100"
            >
              <ArrowRight className="size-4" />
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

      <Dialog open={!!loanToDelete} onOpenChange={() => setLoanToDelete(null)}>
        <DialogContent className="rounded-[32px] border-none shadow-2xl p-8 max-w-[400px]">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
              <AlertTriangle className="size-10" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Hapus Titipan?</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold leading-relaxed">
              Yakin ingin menghapus catatan titipan dari <span className="text-slate-800 font-black">{loanToDelete?.contact_name}</span>? 🥺
            </DialogDescription>
            <div className="flex gap-3 w-full pt-4">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-2xl font-bold border-slate-100"
                onClick={() => setLoanToDelete(null)}
              >
                Batal
              </Button>
              <Button 
                className="flex-1 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-xl shadow-rose-200"
                onClick={() => {
                  if (loanToDelete) {
                    deleteLoan(loanToDelete.id);
                    setLoanToDelete(null);
                  }
                }}
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Loans;
