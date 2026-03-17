import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft,
  LayoutGrid,
  Trash2,
  AlertTriangle,
  History,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
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
import type { Loan } from '@/types';

const ITEMS_PER_PAGE = 15;

const LoanHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: loans = [], isLoading } = useLoans();
  const { mutate: deleteLoan } = useDeleteLoan();

  // Filter only PAID loans
  const historyLoans = loans
    .filter(l => l.status === 'paid')
    .filter(l => {
      const matchesSearch = l.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           l.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || l.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalPages = Math.ceil(historyLoans.length / ITEMS_PER_PAGE);
  const paginatedLoans = historyLoans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  if (isLoading) return <PageLoader isLoading={true} message="Membuka arsip titipan sayang..." />;

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
        <div className="bg-white/95 backdrop-blur-md py-4 md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl border border-white w-full transform-gpu">
          <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Hallo Sayang..</span>
            <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Ini Riwayat Titipan Lunas Kita Yaa ✨</span>
          </h2>
        </div>
      </div>

      {/* Header Row with Branding */}
      <header className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/loans')}>
          <div className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="size-5 md:size-6 text-slate-600" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-xs md:text-sm font-black text-slate-800 tracking-tight leading-none uppercase">
              Balik ke <span className="text-pink-500">Titipan</span>
            </h1>
          </div>
        </div>

        {/* Desktop Greeting */}
        <div className="hidden lg:flex bg-white/80 backdrop-blur-2xl py-6 px-[58px] rounded-[40px] items-center justify-center border border-white shadow-2xl transition-transform hover:scale-105 text-center transform-gpu">
          <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
            <span className="font-script text-[5rem] mr-4 text-pink-500 block lg:inline-block leading-none">Hallo Sayang,</span> 
            <span className="text-slate-600 font-bold italic">Ini Riwayat <span className="text-pink-600 not-italic">Titipan Lunas</span> Kita.. ✨</span>
            <span className="ml-2 inline-block animate-pulse">💖</span>
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
                   className="w-full h-full object-cover"
                />
            </div>
          </Button>
          <UserNavDropdown />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative pt-4 pb-12 overflow-hidden">

        {/* Search & Filters Bar Bar (Matches Loans.tsx) */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center mb-8 px-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:flex-1">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="rounded-2xl border-white/40 bg-white/60 backdrop-blur-md gap-2 font-bold px-4 md:px-6 shadow-sm h-12">
                <LayoutGrid className="w-4 h-4 text-slate-500" />
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/40 bg-white/90 backdrop-blur-xl">
                <SelectItem value="all" className="font-bold">Semua Tipe</SelectItem>
                <SelectItem value="utang" className="font-bold text-rose-500">Hutang Lunas</SelectItem>
                <SelectItem value="piutang" className="font-bold text-emerald-500">Piutang Lunas</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              <input 
                placeholder="Cari di arsip titipan..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(localSearch)}
                className="pl-11 pr-14 py-3 h-12 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm font-medium focus:ring-2 focus:ring-pink-400/20 w-full outline-hidden"
              />
              <Button 
                onClick={() => setSearchQuery(localSearch)}
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl hover:bg-pink-500 text-slate-400 hover:text-white transition-all duration-300 active:scale-95"
              >
                <Search className="w-5 h-5" strokeWidth={3} />
              </Button>
            </div>
          </div>
        </div>

        {/* Main List Container */}
        <div className="max-w-6xl mx-auto px-2">
          <div className="bg-white/40 md:bg-white/30 backdrop-blur-lg md:backdrop-blur-2xl rounded-[40px] border border-white/40 shadow-2xl p-5 md:p-10 min-h-[550px] relative overflow-hidden flex flex-col transform-gpu">
            
            {/* Background Aesthetic Globs - Optimized blur */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 blur-3xl md:blur-[100px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-400/10 blur-3xl md:blur-[100px] rounded-full -z-10" />

            <div className="space-y-4 relative z-10 flex-1">
              {paginatedLoans.length > 0 ? (
                paginatedLoans.map((loan, idx) => (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/95 md:bg-white/80 hover:bg-white md:backdrop-blur-md rounded-[28px] p-4 md:p-6 border border-white/60 shadow-lg group transition-all transform-gpu"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                      {/* Left Info Column */}
                      <div className="flex items-center gap-4 w-full md:w-44 shrink-0">
                        <div className={cn(
                          "w-2 h-14 rounded-full shadow-inner",
                          loan.type === 'piutang' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <div>
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            loan.type === 'piutang' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {loan.type === 'piutang' ? 'PIUTANG LUNAS' : 'HUTANG LUNAS'}
                          </p>
                          <p className="text-slate-400 text-[10px] font-bold">
                            {new Date(loan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-slate-800 text-xs font-black truncate max-w-[120px]">{loan.contact_name}</p>
                        </div>
                      </div>

                      {/* Center Stats Column */}
                      <div className="flex flex-1 items-center justify-between w-full gap-4 md:gap-8">
                         <div className="bg-slate-50/50 border border-slate-100 px-4 py-2.5 rounded-2xl shrink-0 min-w-[120px]">
                           <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-tight">Keterangan</p>
                           <p className="font-bold text-slate-600 text-xs italic truncate max-w-[150px]">"{loan.description}"</p>
                         </div>

                         {/* Lunas Visualization Tag */}
                         <div className="hidden sm:flex items-center gap-3 px-6 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-full">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={3} />
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Selesai Lunas</span>
                         </div>

                         <div className="bg-emerald-50/80 border border-emerald-100 px-4 py-2.5 rounded-2xl shrink-0 min-w-[120px]">
                           <p className="text-[10px] text-emerald-600/70 font-bold uppercase mb-0.5 tracking-tight">Nilai Total</p>
                           <p className="font-black text-emerald-700 text-sm md:text-base">{formatCurrency(loan.amount)}</p>
                         </div>
                      </div>

                      {/* Right Action Column */}
                      <div className="flex items-center gap-4 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                        <Button 
                          onClick={() => setLoanToDelete(loan)}
                          variant="ghost"
                          className="size-11 md:size-12 rounded-xl bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white transition-all duration-300 border border-rose-100"
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 flex-1">
                  <div className="bg-white/50 p-8 rounded-[40px] mb-6 shadow-xl border border-white/40">
                    <History className="w-20 h-20 text-slate-300/40" />
                  </div>
                  <p className="font-black text-xl text-slate-600 mb-2">Belum Ada Riwayat ✨</p>
                  <p className="font-medium text-slate-400 max-w-xs text-center">Arsip Sayang masih kosong, semangat selesaikan titipan aktifnya yaa!</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="h-10 w-10 md:w-auto md:px-6 rounded-xl border-white/60 bg-white/50 backdrop-blur-md shadow-lg font-black text-[10px] uppercase transition-all active:scale-95 disabled:opacity-30"
                  >
                    <ArrowLeft className="w-4 h-4 md:mr-2" strokeWidth={3} />
                    <span className="hidden md:inline">Sebelumnya</span>
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="h-10 w-10 md:w-auto md:px-6 rounded-xl border-white/60 bg-white/50 backdrop-blur-md shadow-lg font-black text-[10px] uppercase transition-all active:scale-95 disabled:opacity-30"
                  >
                    <span className="hidden md:inline">Selanjutnya</span>
                    <ArrowRight className="w-4 h-4 md:ml-2" strokeWidth={3} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistence Delete Confirmation (Styled to match Loans.tsx) */}
      <Dialog open={!!loanToDelete} onOpenChange={(open) => !open && setLoanToDelete(null)}>
        <DialogContent className="rounded-3xl border-none p-0 overflow-hidden bg-white max-w-[340px]">
          <div className="bg-rose-500 p-6 flex flex-col items-center gap-2 text-center">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md mb-2">
              <AlertTriangle className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <DialogTitle className="text-white font-black text-xl">Hapus Arsip?</DialogTitle>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <DialogDescription className="text-slate-500 font-bold text-sm leading-relaxed text-center">
              Yakin mau hapus permanen arsip dari <span className="text-rose-500">"{loanToDelete?.contact_name}"</span>?<br/>
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
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black h-12 rounded-xl shadow-lg border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all uppercase text-xs"
              >
                Hapus Permanen! 🗑️
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setLoanToDelete(null)} 
                className="w-full text-slate-400 font-black h-12 rounded-xl hover:bg-slate-50 uppercase text-xs"
              >
                Gak Jadi Sayang.. 🙏
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanHistory;
