import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Plane, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import { PageLoader } from '../components/ui/PageLoader';
import { cn } from '@/lib/utils';
import {
  useHolidays,
  useDeleteHoliday,
  useAddHoliday,
  useUpdateHoliday,
  type Holiday as HolidayType,
} from '@/hooks/useHolidays';
import { useFormatting } from '@/hooks/useFormatting';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
  const [editingHoliday, setEditingHoliday] = useState<HolidayType | null>(
    null
  );
  const [expenseTrip, setExpenseTrip] = useState<HolidayType | null>(null);
  const [confirmDeleteHoliday, setConfirmDeleteHoliday] =
    useState<HolidayType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'planning' | 'booked' | 'completed'
  >('all');

  const handleHolidaySubmit = async (formData: any) => {
    if (editingHoliday) {
      updateHolidayMutation.mutate(
        { id: editingHoliday.id, ...formData },
        {
          onSuccess: () => {
            setIsAddDialogOpen(false);
            setEditingHoliday(null);
          },
        }
      );
    } else {
      addHolidayMutation.mutate(formData, {
        onSuccess: () => setIsAddDialogOpen(false),
      });
    }
  };

  const handleToggleFavorite = (holiday: HolidayType) => {
    updateHolidayMutation.mutate({
      id: holiday.id,
      is_favorite: !holiday.is_favorite,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteHoliday) {
      deleteHolidayMutation.mutate(confirmDeleteHoliday.id, {
        onSuccess: () => setConfirmDeleteHoliday(null),
      });
    }
  };

  const handleStatusUpdate = (
    holiday: HolidayType,
    nextStatus: HolidayType['status']
  ) => {
    updateHolidayMutation.mutate({ id: holiday.id, status: nextStatus });
  };

  const handleAddExpense = (amount: number) => {
    if (!expenseTrip) return;
    updateHolidayMutation.mutate(
      {
        id: expenseTrip.id,
        spent: (expenseTrip.spent || 0) + amount,
      },
      {
        onSuccess: () => setExpenseTrip(null),
      }
    );
  };

  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch = holiday.destination
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || holiday.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = holidays.reduce((sum, h) => sum + (h.budget || 0), 0);
  const totalSpent = holidays.reduce((sum, h) => sum + (h.spent || 0), 0);

  if (isLoading) {
    return (
      <PageLoader
        isLoading={true}
        message="Mencari destinasi liburan romantis... ✈️✨"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="mb-6 flex justify-center text-center md:mb-10 lg:hidden">
        <div className="glass-premium h-auto w-full transform-gpu items-center justify-center rounded-[24px] border border-white/50 px-6 py-4 shadow-2xl md:rounded-[32px] md:px-10 md:py-6">
          <h2 className="text-xl leading-tight font-black tracking-tight text-slate-800 md:text-3xl">
            <span className="font-script mb-1 block text-5xl text-pink-500 md:text-8xl">
              Liburan Kita...
            </span>
            <span className="block text-xs font-bold tracking-normal text-slate-500 md:text-lg">
              Menjelajahi Dunia Bareng Kamu Selamanya ✨
            </span>
          </h2>
        </div>
      </div>

      {/* Header Row */}
      <header className="mb-10 flex items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-sm md:h-12 md:w-12 md:rounded-2xl">
            <img
              src="/logo-utama.svg"
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-sm leading-none font-black tracking-tight text-slate-800 md:text-2xl">
              Liburan<span className="text-pink-600">Kita</span>
            </h1>
            <span className="text-[7px] font-black tracking-[0.2em] text-slate-500/80 uppercase md:text-[9px]">
              Explore Together
            </span>
          </div>
        </div>

        {/* Desktop Greeting */}
        <div className="glass-premium hidden transform-gpu items-center justify-center rounded-[40px] border border-white/50 px-[58px] py-6 shadow-2xl transition-transform hover:scale-105 lg:flex">
          <h2 className="text-2xl font-black tracking-tight whitespace-nowrap text-slate-800">
            <span className="font-script mr-4 block text-[4rem] leading-none text-pink-500 lg:inline-block">
              Sayang,
            </span>
            <span className="font-bold text-slate-600">
              Ayo Rencanakan Liburan Indah Kita Lagi... ✈️
            </span>
            <span className="ml-2 inline-block animate-pulse">✨</span>
          </h2>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <Button
            onClick={() => {
              setEditingHoliday(null);
              setIsAddDialogOpen(true);
            }}
            className="h-11 w-11 items-center justify-center rounded-full bg-slate-900 p-0 text-white shadow-xl hover:bg-slate-800 md:h-14 md:w-14"
          >
            <Plus className="size-5 md:size-6" />
          </Button>
          <UserNavDropdown />
        </div>
      </header>

      {/* Modals Section */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) =>
          !open && (setIsAddDialogOpen(false), setEditingHoliday(null))
        }
      >
        <DialogContent className="max-w-2xl rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-slate-800">
              {editingHoliday ? 'Edit Liburan ✨' : 'Rencana Liburan ✨'}
            </DialogTitle>
            <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Tentukan Destinasi Impian Kita!
            </p>
          </DialogHeader>
          <HolidayForm
            initialData={editingHoliday || {}}
            onSubmit={handleHolidaySubmit}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={
              addHolidayMutation.isPending || updateHolidayMutation.isPending
            }
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Budget"
            amount={totalBudget}
            imageSrc="/icons/3d/wallet.webp"
            variant="saldo"
          />
          <StatCard
            title="Terpakai"
            amount={totalSpent}
            imageSrc="/icons/3d/expense.webp"
            variant="expense"
          />
          <StatCard
            title="Sisa Budget"
            amount={totalBudget - totalSpent}
            imageSrc="/icons/3d/income.webp"
            variant="income"
          />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row">
          <div className="relative w-full md:w-96">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari destinasi..."
              className="h-12 rounded-2xl border-none bg-slate-50 pl-11 text-sm font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 md:w-auto md:pb-0">
            {(['all', 'planning', 'booked', 'completed'] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'rounded-2xl px-6 py-3 text-[10px] font-black tracking-widest whitespace-nowrap uppercase transition-all',
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-xl'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  )}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        {/* List of Trips */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            className="flex min-h-[350px] flex-col items-center justify-center gap-4 rounded-[32px] border-2 border-dashed border-slate-200 p-8 text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-white text-slate-300 shadow-xl">
              <Plus className="size-8" />
            </div>
            <div className="text-center">
              <h4 className="mb-1 text-[10px] font-black tracking-widest text-slate-600 uppercase">
                Rencana Baru
              </h4>
              <p className="text-[10px] font-bold opacity-60">
                Mau jalan-jalan kemana lagi ya?
              </p>
            </div>
          </motion.button>
        </div>

        {/* Footer Promo Section */}
        <Card className="relative overflow-hidden rounded-[40px] border-none bg-linear-to-br from-blue-900 to-indigo-900 p-10 text-white shadow-2xl md:p-14">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Plane size={240} className="rotate-12" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase backdrop-blur-md">
              Travel Note ✨
            </span>
            <h2 className="mb-8 text-4xl leading-tight font-black tracking-tighter md:text-5xl">
              Dunia itu terlalu luas kalau kita cuma di rumah terus, Sayang...
              ❤️
            </h2>
            <p className="text-lg leading-relaxed font-bold text-white/70 italic">
              "Setiap perjalanan yang kita lalui adalah memori abadi. Nabung
              yang rajin ya, nanti aku ajak kamu ke tempat yang paling indah di
              dunia. Promise! ✨"
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Holiday;
