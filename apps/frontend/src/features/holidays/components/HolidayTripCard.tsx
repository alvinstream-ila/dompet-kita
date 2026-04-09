import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Heart,
  Pencil,
  Trash2,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Holiday } from '../hooks/useHolidays';

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
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'booked':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    default:
      return 'bg-amber-50 text-amber-600 border-amber-100';
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
                className="p-2 text-slate-300 transition-colors hover:text-blue-500"
                onClick={() => onEdit(holiday)}
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => onFavorite(holiday)}
                className={cn(
                  'p-2 transition-all active:scale-95',
                  holiday.is_favorite
                    ? 'text-pink-500'
                    : 'text-slate-300 hover:text-pink-500'
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
                onClick={() => onDelete(holiday)}
                className="p-2 text-slate-300 transition-colors hover:text-rose-500"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <h3 className="mb-2 line-clamp-1 text-2xl font-black tracking-tight text-slate-800 transition-colors group-hover:text-blue-600">
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
                <span>Budget Progress</span>
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
                  className="h-full bg-linear-to-r from-blue-500 to-indigo-500"
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onExpense(holiday)}
            className="transform rounded-2xl bg-white shadow-sm transition-all group-hover:rotate-12 hover:bg-pink-600 hover:text-white"
          >
            <Coins className="size-5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
