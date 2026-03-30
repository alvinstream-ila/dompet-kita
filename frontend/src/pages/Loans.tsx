import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLoans, useDeleteLoan } from '@/hooks/useLoans';
import { PageLoader } from '@/components/ui/PageLoader';
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import { AddLoanModal } from '../components/features/AddLoanModal';
import { LoanCard } from '../components/features/LoanCard';
import { LoanStats } from '../components/features/LoanStats';
import { LoanFilters } from '../components/features/LoanFilters';
import { LoanDeleteConfirm } from '../components/features/LoanDeleteConfirm';
import type { Loan } from '@/types';

const ITEMS_PER_PAGE = 12;

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
  const deleteMutation = useDeleteLoan();

  const filteredLoans = loans
    .filter(l => {
      const matchesSearch = l.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           l.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || l.type === filterType;
      const matchesTab = activeTab === 'active' ? l.status === 'active' : l.status === 'paid';
      return matchesSearch && matchesType && matchesTab;
    })
    .sort((a, b) => {
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);
  const paginatedLoans = filteredLoans.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  React.useEffect(() => { setCurrentPage(1); }, [filterType, searchQuery, activeTab]);

  if (isLoading) return <PageLoader isLoading={true} message="Lagi ngitung titipan sayang kita... 🤝💰" />;

  const totalPiutang = loans.filter(l => l.type === 'piutang').reduce((acc, l) => acc + l.remaining_amount, 0);
  const totalHutang = loans.filter(l => l.type === 'utang').reduce((acc, l) => acc + l.remaining_amount, 0);
  const netPosition = totalPiutang - totalHutang;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-10 text-center">
         <div className="glass-premium py-6 px-10 rounded-[32px] items-center justify-center shadow-2xl w-full border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1 uppercase">Titipan Sayang</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Mencatat Amanah & Rezeki Kita... 🤝💰</span>
            </h2>
         </div>
      </div>

      <header className="flex items-center justify-between mb-12 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 transition-transform hover:rotate-3">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
                Titipan<span className="text-pink-600">Sayang</span>
              </h1>
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono leading-none">
                Loan Tracking Hub
              </span>
            </div>
         </div>

         <div className="hidden lg:flex glass-premium py-6 px-[64px] rounded-[48px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50 relative group overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-pink-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight relative z-10 flex items-center">
               <span className="font-script text-[4.2rem] mr-5 text-pink-500 block lg:inline-block leading-none">Sayang,</span> 
               <div className="flex flex-col">
                  <span className="text-slate-600 font-bold">Cek Daftar Titipan Sayang Kita Yuk... 😉</span>
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400 mt-2 opacity-60">Setiap Amanah Adalah Perjalanan Cinta 💖</span>
               </div>
               <span className="ml-2 inline-block animate-pulse">✨</span>
            </h2>
         </div>

         <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-full border border-slate-100/50 shadow-sm transition-all hover:bg-white hover:shadow-md">
            <UserNavDropdown />
         </div>
      </header>

      <LoanStats 
        totalPiutang={totalPiutang} 
        totalHutang={totalHutang} 
        netPosition={netPosition} 
      />

      <div className="flex justify-center mb-10">
        <div className="bg-white/80 backdrop-blur-3xl p-2 rounded-full border border-slate-100 shadow-xl flex gap-2 w-full max-w-[420px] transform-gpu transition-all hover:shadow-2xl">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 h-14 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === 'active' ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <Clock className="size-4" strokeWidth={3} />
            Titipan Aktif
          </button>
          <button
            onClick={() => setActiveTab('finished')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 h-14 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === 'finished' ? "bg-pink-500 text-white shadow-xl shadow-pink-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <CheckCircle2 className="size-4" strokeWidth={3} />
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

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-16 scale-110">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="rounded-2xl h-14 w-14 border border-slate-100 bg-white shadow-sm hover:shadow-md hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ArrowLeft className="size-5" strokeWidth={3} />
          </Button>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-6 py-3 bg-white/50 backdrop-blur-md border border-slate-100 rounded-2xl">
            {currentPage} dari {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="rounded-2xl h-14 w-14 border border-slate-100 bg-white shadow-sm hover:shadow-md hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ArrowRight className="size-5" strokeWidth={3} />
          </Button>
        </div>
      )}

      <AddLoanModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <AddLoanModal isOpen={!!loanToEdit} onClose={() => setLoanToEdit(null)} loan={loanToEdit || undefined} />
      <LoanDeleteConfirm 
        loan={loanToDelete} 
        onClose={() => setLoanToDelete(null)} 
        onConfirm={() => { if (loanToDelete) { deleteMutation.mutate(loanToDelete.id); setLoanToDelete(null); } }} 
        isLoading={deleteMutation.isPending} 
      />
    </div>
  );
};

export default Loans;
