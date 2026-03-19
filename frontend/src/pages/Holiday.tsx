import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Plus, 
  Trash2, 
  Plane, 
  Calendar as CalendarIcon,
  Heart,
  Search,
  Pencil,
  Coins,
  AlertTriangle
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
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { StatCard } from '../components/ui/StatCard';
import { Card } from "@/components/ui/card";
import { formatToRupiah, getTerbilang } from '@/lib/utils';


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
  const [expenseAmount, setExpenseAmount] = useState('');
  
  const [newTrip, setNewTrip] = useState<Omit<HolidayType, 'id'>>({
    destination: '',
    budget: 0,
    spent: 0,
    start_date: '',
    end_date: '',
    status: 'planning',
    itinerary: null,
    is_favorite: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'booked' | 'completed'>('all');

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHoliday) {
      updateHolidayMutation.mutate({ 
        id: editingHoliday.id, 
        ...newTrip as Partial<HolidayType> 
      }, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setEditingHoliday(null);
        }
      });
    } else {
      addHolidayMutation.mutate(newTrip, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewTrip({
            destination: '',
            budget: 0,
            spent: 0,
            start_date: '',
            end_date: '',
            status: 'planning',
            itinerary: null,
            is_favorite: false,
          });
        },
      });
    }
  };

  const handleToggleFavorite = (holiday: HolidayType) => {
    updateHolidayMutation.mutate({ 
      id: holiday.id, 
      is_favorite: !holiday.is_favorite 
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteHoliday) {
      deleteHolidayMutation.mutate(confirmDeleteHoliday.id, {
        onSuccess: () => setConfirmDeleteHoliday(null)
      });
    }
  };

  const handleUpdateStatus = (holiday: HolidayType, nextStatus: HolidayType['status']) => {
    updateHolidayMutation.mutate({ id: holiday.id, status: nextStatus });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTrip) return;
    const amount = parseInt(expenseAmount.replace(/[^0-9]/g, ''));
    if (isNaN(amount)) return;

    updateHolidayMutation.mutate({ 
      id: expenseTrip.id, 
      spent: (expenseTrip.spent || 0) + amount 
    }, {
      onSuccess: () => {
        setExpenseTrip(null);
        setExpenseAmount('');
      }
    });
  };

  const openEditDialog = (holiday: HolidayType) => {
    setEditingHoliday(holiday);
    setNewTrip({
      destination: holiday.destination,
      budget: holiday.budget,
      spent: holiday.spent || 0,
      start_date: holiday.start_date || '',
      end_date: holiday.end_date || '',
      status: holiday.status,
      itinerary: holiday.itinerary,
      is_favorite: holiday.is_favorite || false,
    });
    setIsAddDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'booked': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
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
             <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
               setIsAddDialogOpen(open);
               if (!open) setEditingHoliday(null);
             }}>
                  <Button 
                    onClick={() => {
                      setEditingHoliday(null);
                      setNewTrip({
                        destination: '',
                        budget: 0,
                        spent: 0,
                        start_date: '',
                        end_date: '',
                        status: 'planning',
                        itinerary: null,
                      });
                      setIsAddDialogOpen(true);
                    }}
                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 h-11 w-11 md:h-14 md:w-14 items-center justify-center p-0 shadow-xl group"
                  >
                    <Plus className="size-5 md:size-6" />
                  </Button>
                <DialogContent className="max-w-2xl rounded-[32px] p-8">
                  <DialogHeader>
                     <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Rencana Liburan ✨</DialogTitle>
                     <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Tentukan Destinasi Impian Kita!</p>
                  </DialogHeader>
                  <form onSubmit={handleAddTrip} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destinasi</Label>
                        <Input 
                          placeholder="Mau kemana Sayang?" 
                          value={newTrip.destination}
                          onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                          className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Budget Estimasi</Label>
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                          <Input 
                            type="text"
                            placeholder="Berapa kira-kira biayanya?" 
                            value={newTrip.budget > 0 ? formatToRupiah(newTrip.budget) : ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setNewTrip({...newTrip, budget: val ? parseInt(val) : 0});
                            }}
                            className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 pl-14 pr-6 font-bold text-slate-700"
                            required
                          />
                        </div>
                        {newTrip.budget > 0 && (
                          <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mt-2 ml-1">
                            {getTerbilang(newTrip.budget)} Rupiah
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kapan Kita Berangkat? ✈️</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full rounded-2xl h-14 border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 justify-start text-left",
                                !newTrip.start_date && "text-slate-400"
                              )}
                            >
                              <CalendarIcon className="mr-3 size-4 opacity-50" />
                              {newTrip.start_date ? (
                                format(new Date(newTrip.start_date), "PPP")
                              ) : (
                                <span>Pilih Tanggal</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={newTrip.start_date ? new Date(newTrip.start_date) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setNewTrip({ ...newTrip, start_date: date.toISOString().split('T')[0] });
                                }
                              }}
                              initialFocus
                              className="p-4"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</Label>
                        <Select 
                          value={newTrip.status} 
                          onValueChange={(v) => setNewTrip({...newTrip, status: v as HolidayType['status']})}
                        >
                          <SelectTrigger className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="planning" className="rounded-xl font-bold uppercase text-[10px]">Planning</SelectItem>
                            <SelectItem value="booked" className="rounded-xl font-bold uppercase text-[10px]">Booked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="flex gap-4 pt-4">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400" 
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          setEditingHoliday(null);
                        }}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={addHolidayMutation.isPending || updateHolidayMutation.isPending} className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200">
                        {editingHoliday ? 'Simpan Perubahan' : 'Buat Rencana'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
             </Dialog>

             {/* Manage Expense Dialog */}
             <Dialog open={!!expenseTrip} onOpenChange={(open) => !open && setExpenseTrip(null)}>
                <DialogContent className="max-w-md rounded-[32px] p-8">
                  <DialogHeader>
                     <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Tambah Transaksi Liburan ✨</DialogTitle>
                     <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Catat pengeluaran untuk {expenseTrip?.destination}</p>
                  </DialogHeader>
                  <form onSubmit={handleAddExpense} className="space-y-6 pt-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nominal Terbayar</Label>
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                          <Input 
                            type="text"
                            placeholder="Contoh: 500.000" 
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(formatToRupiah(e.target.value))}
                            className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 pl-14 pr-6 font-bold text-slate-700"
                            required
                            autoFocus
                          />
                        </div>
                     </div>
                     <DialogFooter>
                        <Button type="submit" className="w-full h-14 rounded-2xl bg-pink-500 hover:bg-pink-600 font-black uppercase tracking-widest text-white shadow-xl shadow-pink-100">
                          Konfirmasi Pembayaran
                        </Button>
                     </DialogFooter>
                  </form>
                </DialogContent>
             </Dialog>

             {/* Delete Confirmation Dialog */}
             <Dialog open={!!confirmDeleteHoliday} onOpenChange={(open) => !open && setConfirmDeleteHoliday(null)}>
                <DialogContent className="max-w-md rounded-[32px] p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="size-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                       <AlertTriangle className="size-8 animate-bounce" />
                    </div>
                    <DialogHeader>
                       <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Hapus Rencana Liburan? 💔</DialogTitle>
                       <p className="text-slate-500 font-bold mt-2 leading-relaxed">
                          Yakin mau menghapus rencana ke <span className="text-slate-800 font-black">{confirmDeleteHoliday?.destination}</span>? Sayang banget lho kalau dihapus...
                       </p>
                    </DialogHeader>
                  </div>
                  <DialogFooter className="flex gap-4 pt-6">
                    <Button 
                      variant="ghost" 
                      className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400" 
                      onClick={() => setConfirmDeleteHoliday(null)}
                    >
                      Batal
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 font-black uppercase tracking-widest text-white shadow-xl shadow-rose-100"
                      onClick={handleConfirmDelete}
                    >
                      Hapus Saja
                    </Button>
                  </DialogFooter>
                </DialogContent>
             </Dialog>



            <UserNavDropdown />
         </div>
      </header>

      {/* Main Content Area */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Budget" amount={totalBudget} imageSrc="/icons/3d/wallet.webp" variant="saldo" />
          <StatCard title="Terpakai" amount={totalSpent} imageSrc="/icons/3d/expense.webp" variant="expense" />
          <StatCard title="Sisa Budget" amount={totalBudget - totalSpent} imageSrc="/icons/3d/income.webp" variant="income" />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredHolidays.map((holiday, index) => (
              <motion.div
                key={holiday.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="rounded-[32px] border-none shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group bg-white h-full transform-gpu hover:-translate-y-1">
                   {/* Destination Image */}
                   <div className="relative h-48 w-full overflow-hidden">
                      <img 
                        src={`https://source.unsplash.com/featured/800x450/?${encodeURIComponent(holiday.destination)},landscape,travel`}
                        alt={holiday.destination}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent" />
                      
                      <div className="absolute top-6 left-6">
                         <button 
                           onClick={() => {
                             const statuses: HolidayType['status'][] = ['planning', 'booked', 'completed'];
                             const currentIndex = statuses.indexOf(holiday.status);
                             const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                             handleUpdateStatus(holiday, nextStatus);
                           }}
                           className={cn(
                             "px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm transition-all active:scale-90",
                             getStatusColor(holiday.status).replace('bg-', 'bg-white/80 ')
                           )}
                         >
                            {holiday.status}
                         </button>
                      </div>
                   </div>

                   <div className="p-8 pt-4 pb-4">
                      <div className="flex justify-end items-start mb-4">
                         <div className="flex gap-1">
                           <button className="p-2 text-slate-300 hover:text-blue-500 transition-colors" onClick={() => openEditDialog(holiday)}>
                              <Pencil className="size-4" />
                           </button>
                           <button 
                             onClick={() => handleToggleFavorite(holiday)}
                             className={cn(
                               "p-2 transition-all active:scale-95",
                               holiday.is_favorite ? "text-pink-500" : "text-slate-300 hover:text-pink-500"
                             )}
                           >
                              <Heart className={cn("size-4", holiday.is_favorite && "fill-current")} />
                           </button>
                           <button 
                             onClick={() => setConfirmDeleteHoliday(holiday)}
                             className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                           >
                              <Trash2 className="size-4" />
                           </button>
                         </div>
                      </div>

                      <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                        {holiday.destination}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-slate-400 mb-6">
                         <CalendarIcon size={14} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">
                           {holiday.start_date ? new Date(holiday.start_date).toLocaleDateString() : 'Belum Ditentukan'}
                         </span>
                      </div>

                      <div className="space-y-4 mb-6">
                         <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                               <span>Budget Progress</span>
                               <span>{Math.round(((holiday.spent || 0) / holiday.budget) * 100) || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${((holiday.spent || 0) / holiday.budget) * 100}%` }}
                                 className="h-full bg-linear-to-r from-blue-500 to-indigo-500"
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Total Biaya</p>
                         <p className="text-lg font-black text-slate-800 tracking-tight">{formatAmount(holiday.budget)}</p>
                      </div>
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setExpenseTrip(holiday)}
                        className="rounded-2xl bg-white shadow-sm hover:bg-pink-600 hover:text-white transition-all transform group-hover:rotate-12"
                      >
                        <Coins className="size-5" />
                      </Button>
                   </div>
                </Card>
              </motion.div>
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
