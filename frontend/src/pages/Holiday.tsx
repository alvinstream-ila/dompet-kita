import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Plane, 
  Search,
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import { PageLoader } from '../components/ui/PageLoader';
import { cn } from '@/lib/utils';
import { useHolidays, useDeleteHoliday, useAddHoliday, useUpdateHoliday, type Holiday as HolidayType } from '@/hooks/useHolidays';
import { useFormatting } from '@/hooks/useFormatting';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatCard } from '../components/ui/StatCard';

import { HolidayForm } from '../components/features/HolidayForm';
import { HolidayTripCard } from '../components/features/HolidayTripCard';
import { HolidayExpenseModal } from '../components/features/HolidayExpenseModal';
import { HolidayDeleteConfirm } from '../components/features/HolidayDeleteConfirm';

const Holiday: React.FC = () => {
  const { data: holidays = [], isLoading } = useHolidays();
  const deleteHolidayMutation = useDeleteHoliday();
  const addHolidayMutation = useAddHoliday();
  const updateHolidayMutation = useUpdateHoliday();
  const { formatAmount } = useFormatting();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayType | null>(null);
  const [expenseTrip, setExpenseTrip] = useState<HolidayType | null>(null);
  const [confirmDeleteHoliday, setConfirmDeleteHoliday] = useState<HolidayType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'booked' | 'completed'>('all');

  const handleHolidaySubmit = async (formData: any) => {
    if (editingHoliday) {
      updateHolidayMutation.mutate({ id: editingHoliday.id, ...formData }, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setEditingHoliday(null);
        }
      });
    } else {
      addHolidayMutation.mutate(formData, {
        onSuccess: () => setIsAddDialogOpen(false),
      });
    }
  };

  const handleToggleFavorite = (holiday: HolidayType) => {
    updateHolidayMutation.mutate({ id: holiday.id, is_favorite: !holiday.is_favorite });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteHoliday) {
      deleteHolidayMutation.mutate(confirmDeleteHoliday.id, {
        onSuccess: () => setConfirmDeleteHoliday(null)
      });
    }
  };

  const handleStatusUpdate = (holiday: HolidayType, nextStatus: HolidayType['status']) => {
    updateHolidayMutation.mutate({ id: holiday.id, status: nextStatus });
  };

  const handleAddExpense = (amount: number) => {
    if (!expenseTrip) return;
    updateHolidayMutation.mutate({ 
      id: expenseTrip.id, 
      spent: (expenseTrip.spent || 0) + amount 
    }, {
      onSuccess: () => setExpenseTrip(null)
    });
  };

  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || holiday.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = holidays.reduce((sum, h) => sum + (h.budget || 0), 0);
  const totalSpent = holidays.reduce((sum, h) => sum + (h.spent || 0), 0);

  if (isLoading) {
    return <PageLoader isLoading={true} message="Mencari destinasi liburan romantis... ✈️✨" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
         <div className="glass-premium py-4 h-auto md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl w-full transform-gpu border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Liburan Kita...</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Menjelajahi Dunia Bareng Kamu Selamanya ✨</span>
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
                Liburan<span className="text-pink-600">Kita</span>
              </h1>
              <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">
                Explore Together
              </span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50">
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
               <span className="font-script text-[4rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span> 
               <span className="text-slate-600 font-bold">Ayo Rencanakan Liburan Indah Kita Lagi... ✈️</span>
               <span className="ml-2 inline-block animate-pulse">✨</span>
            </h2>
         </div>

         <div className="flex items-center gap-4 md:gap-8">
            <Button 
                onClick={() => {
                  setEditingHoliday(null);
                  setIsAddDialogOpen(true);
                }}
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 h-11 w-11 md:h-14 md:w-14 items-center justify-center p-0 shadow-xl"
            >
                <Plus className="size-5 md:size-6" />
            </Button>
            <UserNavDropdown />
         </div>
      </header>

      {/* Modals Section */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && (setIsAddDialogOpen(false), setEditingHoliday(null))}>
        <DialogContent className="max-w-2xl rounded-[32px] p-8">
          <DialogHeader>
             <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">
               {editingHoliday ? 'Edit Liburan ✨' : 'Rencana Liburan ✨'}
             </DialogTitle>
             <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Tentukan Destinasi Impian Kita!</p>
          </DialogHeader>
          <HolidayForm 
            initialData={editingHoliday || {}}
            onSubmit={handleHolidaySubmit}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={addHolidayMutation.isPending || updateHolidayMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <HolidayExpenseModal 
        holiday={expenseTrip}
        isOpen={!!expenseTrip}
        onClose={() => setExpenseTrip(null)}
        onSubmit={handleAddExpense}
      />

      <HolidayDeleteConfirm 
        holiday={confirmDeleteHoliday}
        isOpen={!!confirmDeleteHoliday}
        onClose={() => setConfirmDeleteHoliday(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Statistics Section */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Budget" amount={totalBudget} imageSrc="/icons/3d/wallet.webp" variant="saldo" />
          <StatCard title="Terpakai" amount={totalSpent} imageSrc="/icons/3d/expense.webp" variant="expense" />
          <StatCard title="Sisa Budget" amount={totalBudget - totalSpent} imageSrc="/icons/3d/income.webp" variant="income" />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                placeholder="Cari destinasi..." 
                className="pl-11 rounded-2xl border-none bg-slate-50 h-12 font-bold text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
              {(['all', 'planning', 'booked', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    statusFilter === status 
                      ? "bg-slate-900 text-white shadow-xl" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  )}
                >
                  {status}
                </button>
              ))}
           </div>
        </div>

        {/* List of Trips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredHolidays.map((holiday, index) => (
              <HolidayTripCard 
                key={holiday.id}
                holiday={holiday}
                index={index}
                onEdit={(h) => {
                  setEditingHoliday(h);
                  setIsAddDialogOpen(true);
                }}
                onDelete={setConfirmDeleteHoliday}
                onFavorite={handleToggleFavorite}
                onExpense={setExpenseTrip}
                onStatusUpdate={handleStatusUpdate}
                formatAmount={formatAmount}
              />
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-[32px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-4 text-slate-400 transition-all hover:bg-slate-50 hover:border-slate-300 min-h-[350px]"
          >
            <div className="size-16 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-300">
               <Plus className="size-8" />
            </div>
            <div className="text-center">
               <h4 className="font-black text-slate-600 uppercase tracking-widest text-[10px] mb-1">Rencana Baru</h4>
               <p className="text-[10px] font-bold opacity-60">Mau jalan-jalan kemana lagi ya?</p>
            </div>
          </motion.button>
        </div>

        {/* Footer Promo Section */}
        <Card className="rounded-[40px] border-none bg-linear-to-br from-blue-900 to-indigo-900 p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-12 opacity-10">
              <Plane size={240} className="rotate-12" />
           </div>
           <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-6">
                Travel Note ✨
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
                Dunia itu terlalu luas kalau kita cuma di rumah terus, Sayang... ❤️
              </h2>
              <p className="text-lg font-bold text-white/70 italic leading-relaxed">
                "Setiap perjalanan yang kita lalui adalah memori abadi. Nabung yang rajin ya, nanti aku ajak kamu ke tempat yang paling indah di dunia. Promise! ✨"
              </p>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default Holiday;
