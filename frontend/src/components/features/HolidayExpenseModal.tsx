import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatToRupiah } from '@/lib/utils';
import type { Holiday } from '@/hooks/useHolidays';

interface HolidayExpenseModalProps {
  holiday: Holiday | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

export const HolidayExpenseModal: React.FC<HolidayExpenseModalProps> = ({
  holiday,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [expenseAmount, setExpenseAmount] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!holiday) return;

    // Modern pattern: use Number.parseInt and replaceAll with \D for better clarity
    const amount = Number.parseInt(expenseAmount.replaceAll(/\D/g, ''), 10);

    if (Number.isNaN(amount)) return;
    onSubmit(amount);
    setExpenseAmount('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[32px] border-none bg-white p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black tracking-tight text-slate-800">
            Catat Transaksi ✨
          </DialogTitle>
          <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Pengeluaran untuk {holiday?.destination}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Nominal Terbayar
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-6 -translate-y-1/2 font-black text-slate-400">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={expenseAmount}
                onChange={(e) =>
                  setExpenseAmount(formatToRupiah(e.target.value))
                }
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pr-6 pl-14 text-xl font-black text-slate-900 focus-visible:ring-slate-300"
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="h-14 w-full rounded-2xl bg-pink-500 font-black tracking-widest text-white uppercase shadow-xl shadow-pink-100 hover:bg-pink-600"
            >
              Konfirmasi Pembayaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
