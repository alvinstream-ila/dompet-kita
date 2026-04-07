import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Loan } from '@/types';

interface LoanDeleteConfirmProps {
  loan: Loan | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const LoanDeleteConfirm: React.FC<LoanDeleteConfirmProps> = ({
  loan,
  onClose,
  onConfirm,
  isLoading,
}) => {
  return (
    <Dialog open={!!loan} onOpenChange={onClose}>
      <DialogContent className="shadow-3xl max-w-[420px] transform-gpu rounded-[40px] border-none p-10 transition-all">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="animate-bounce-subtle flex size-24 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 shadow-xl shadow-rose-100/50">
            <AlertTriangle className="size-12" strokeWidth={2} />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-3xl font-black tracking-tighter text-slate-900">
              Hapus Titipan?
            </DialogTitle>
            <DialogDescription className="px-4 leading-relaxed font-bold text-slate-500">
              Yakin ingin menghapus catatan titipan dari{' '}
              <span className="font-black text-slate-800">
                {loan?.contact_name}
              </span>
              ? 🥺
            </DialogDescription>
          </div>

          <div className="flex w-full gap-4 pt-6">
            <Button
              variant="outline"
              className="h-14 flex-1 rounded-2xl border-slate-100 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-slate-50 active:scale-95"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal Batal!
            </Button>
            <Button
              className="h-14 flex-1 rounded-2xl bg-rose-500 text-[10px] font-black tracking-widest text-white uppercase shadow-2xl shadow-rose-200 transition-all hover:-translate-y-1 hover:bg-rose-600 active:scale-95"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Menghapus...' : 'Ya, Hapus Saja'}
            </Button>
          </div>
          <p className="text-[9px] font-black tracking-[0.3em] text-slate-300 uppercase opacity-60">
            Tindakan ini tidak bisa dibatalkan ya Sayang ✨
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
