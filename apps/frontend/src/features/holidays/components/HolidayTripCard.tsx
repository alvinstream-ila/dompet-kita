import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Heart,
  Pencil,
  PiggyBank,
  Trash2,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Holiday } from '../hooks/useHolidays';
import { AddHolidayFundModal } from './AddHolidayFundModal';

interface HolidayTripCardProps {
  holiday: Holiday;
  index: number;
  onEdit: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => void;
  onFavorite: (holiday: Holiday) => void;
  onExpense: (holiday: Holiday) => void;
  onStatusUpdate: (holiday: Holiday, status: Holiday['status']) => void;
  formatAmount: (amount: number) => string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-stat/5 text-green-stat border-green-stat/10';
    case 'booked':
      return 'bg-blue-royal/5 text-blue-royal border-blue-royal/10';
    default:
      return 'bg-yellow-outlook/5 text-yellow-outlook border-yellow-outlook/10';
  }
};

export const HolidayTripCard: React.FC<HolidayTripCardProps> = ({
  holiday,
  index,
  onEdit,
  onDelete,
  onFavorite,
  onExpense,
  onStatusUpdate,
  formatAmount,
}) => {
  const [isFundModalOpen, setIsFundModalOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card className="group h-full transform-gpu overflow-hidden rounded-[32px] border-none bg-white shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
        {/* Destination Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={
              holiday.image_url ||
              `https://loremflickr.com/800/450/${encodeURIComponent(holiday.destination)},landscape,travel`
            }
            alt={holiday.destination}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent" />

          <div className="absolute top-6 left-6">
            <button
              type="button"
              onClick={() => {
                const statuses: Holiday['status'][] = [
                  'planning',
                  'booked',
                  'completed',
                ];
                const currentIndex = statuses.indexOf(holiday.status);
                const nextStatus =
                  statuses[(currentIndex + 1) % statuses.length];
                onStatusUpdate(holiday, nextStatus);
              }}
              className={cn(
                'rounded-xl border px-4 py-1.5 text-[10px] font-black tracking-widest uppercase shadow-sm backdrop-blur-md transition-all active:scale-90',
                getStatusColor(holiday.status).replace('bg-', 'bg-white/80')
              )}
            >
              {holiday.status}
            </button>
          </div>
        </div>

        <div className="p-8 pt-4 pb-4">
          <div className="mb-4 flex items-start justify-end">
            <div className="flex gap-1">
              <button
                type="button"
                className="hover:text-blue-royal p-2 text-slate-300 transition-colors"
                onClick={() => onEdit(holiday)}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onFavorite(holiday)}
                className={cn(
                  'p-2 transition-all active:scale-95',
                  holiday.is_favorite
                    ? 'text-pink-primary'
                    : 'hover:text-pink-primary text-slate-300'
                )}
              >
                <Heart
                  className={cn(
                    'size-4',
                    holiday.is_favorite && 'fill-current'
                  )}
                />
              </button>
              <button
                type="button"
                onClick={() => onDelete(holiday)}
                className="hover:text-red-stat p-2 text-slate-300 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <h3 className="group-hover:text-blue-royal mb-2 line-clamp-1 text-2xl font-black tracking-tight text-slate-800 transition-colors">
            {holiday.destination}
          </h3>

          <div className="mb-6 flex items-center gap-2 text-slate-400">
            <CalendarIcon size={14} />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              {holiday.start_date
                ? new Date(holiday.start_date).toLocaleDateString()
                : 'Belum Ditentukan'}
            </span>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">
                <span>Funding Progress</span>
                <span>
                  {Math.round(
                    ((holiday.funded_amount || 0) / holiday.budget) * 100
                  ) || 0}
                  %
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((holiday.funded_amount || 0) / holiday.budget) * 100)}%`,
                  }}
                  className="from-green-stat/80 to-green-stat h-full bg-linear-to-r"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">
                <span>Expense Progress</span>
                <span>
                  {Math.round(((holiday.spent || 0) / holiday.budget) * 100) ||
                    0}
                  %
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((holiday.spent || 0) / holiday.budget) * 100)}%`,
                  }}
                  className="from-blue-royal/80 to-blue-royal h-full bg-linear-to-r"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-8 py-6">
          <div>
            <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Total Biaya
            </p>
            <p className="text-lg font-black tracking-tight text-slate-800">
              {formatAmount(holiday.budget)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFundModalOpen(true)}
              className="hover:bg-green-stat transform rounded-2xl bg-white shadow-sm transition-all hover:text-white"
              title="Isi Dana Liburan"
            >
              <PiggyBank className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onExpense(holiday)}
              className="hover:bg-pink-primary transform rounded-2xl bg-white shadow-sm transition-all group-hover:rotate-12 hover:text-white"
              title="Catat Pengeluaran"
            >
              <Wallet className="size-5" />
            </Button>
          </div>
        </div>

        <AddHolidayFundModal
          holiday={holiday}
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
        />
      </Card>
    </motion.div>
  );
};
