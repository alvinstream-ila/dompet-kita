import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onSubmit
}) => {
  const [expenseAmount, setExpenseAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(expenseAmount.replace(/[^0-9]/g, ''));
    if (isNaN(amount)) return;
    onSubmit(amount);
    setExpenseAmount('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[32px] p-8 border-none bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Catat Transaksi ✨</DialogTitle>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
            Pengeluaran untuk {holiday?.destination}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nominal Terbayar</Label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
              <Input 
                type="text"
                inputMode="numeric"
                placeholder="0" 
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(formatToRupiah(e.target.value))}
                className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 pl-14 pr-6 font-black text-xl text-slate-900 focus-visible:ring-slate-300"
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
  );
};
