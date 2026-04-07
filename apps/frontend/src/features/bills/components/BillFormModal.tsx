'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Info } from 'lucide-react';
import { useBills } from '../hooks/useBills';
import { cn } from '@/lib/utils';

interface BillFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const CATEGORIES = [
  'Listrik', 'Air', 'Internet', 'Sewa', 'Asuransi', 'Cicilan', 'Lainnya'
];

type Frequency = 'monthly' | 'weekly' | 'yearly';

interface FormData {
  name: string;
  amount: string;
  category: string;
  dueDate: string;
  frequency: Frequency;
}

export function BillFormModal({ isOpen, onClose }: BillFormModalProps) {
  const { addBill } = useBills();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    amount: '',
    category: 'Internet',
    dueDate: '',
    frequency: 'monthly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.dueDate) return;

    addBill({
      name: formData.name,
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
      dueDate: formData.dueDate,
      frequency: formData.frequency,
    });
    
    // Reset & Close
    setFormData({
      name: '',
      amount: '',
      category: 'Internet',
      dueDate: '',
      frequency: 'monthly',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md overflow-hidden rounded-[32px] border-none bg-white p-0 shadow-2xl">
        {/* Header - Premium Gradient */}
        <div className="relative h-28 w-full overflow-hidden bg-linear-to-br from-cyan-400 via-blue-500 to-indigo-600 p-6">
          <div className="absolute top-0 right-0 h-full w-40 translate-x-10 -skew-x-12 bg-white/10 blur-xl" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-1 text-center">
            <div className="mb-1 rounded-2xl bg-white/20 p-2 backdrop-blur-md">
              <Plus className="size-6 text-white" strokeWidth={3} />
            </div>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tight">
              Tambah Tagihan Rutin
            </DialogTitle>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {/* Info Banner */}
          <div className="flex items-center gap-3 rounded-2xl bg-cyan-50 p-3 text-[10px] font-bold text-cyan-600">
            <Info className="size-4 shrink-0" />
            <span>Tagihan ini bakal otomatis nongol tiap bulan biar nggak telat bayar ya Sayang! 💖</span>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Tagihan</Label>
              <Input
                id="name"
                placeholder="Contoh: IPL Apartemen / WiFi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-cyan-500/10 placeholder:text-slate-300"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nominal Tagihan (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Berapa Rp sayang?"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-cyan-500/10 placeholder:text-slate-300"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Jatuh Tempo</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-cyan-500/10"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frekuensi</Label>
              <div className="flex gap-2">
                {(['monthly', 'weekly', 'yearly'] as const).map((freq) => {
                  const labelMap = { monthly: 'Bulanan', weekly: 'Mingguan', yearly: 'Tahunan' };
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: freq })}
                      className={cn(
                        "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        formData.frequency === freq
                          ? "bg-cyan-500 text-white shadow-lg shadow-cyan-100 scale-105"
                          : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"
                      )}
                    >
                      {labelMap[freq]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-14 flex-1 rounded-2xl text-xs font-black uppercase text-slate-400 hover:bg-slate-100 transition-all"
            >
              Nanti Saja
            </Button>
            <Button
              type="submit"
              className="h-14 flex-2 rounded-2xl border-b-4 border-cyan-700 bg-cyan-500 text-xs font-black uppercase text-white shadow-xl shadow-cyan-100 hover:bg-cyan-600 active:translate-y-1 active:border-b-0 transition-all"
            >
              Simpan Jadwalkan! ✨
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
