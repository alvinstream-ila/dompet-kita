import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  isLoading
}) => {
  return (
    <Dialog open={!!loan} onOpenChange={onClose}>
      <DialogContent className="rounded-[40px] border-none shadow-3xl p-10 max-w-[420px] transition-all transform-gpu">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="size-24 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100/50 animate-bounce-subtle">
            <AlertTriangle className="size-12" strokeWidth={2} />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter">Hapus Titipan?</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold leading-relaxed px-4">
              Yakin ingin menghapus catatan titipan dari <span className="text-slate-800 font-black">{loan?.contact_name}</span>? 🥺
            </DialogDescription>
          </div>
          
          <div className="flex gap-4 w-full pt-6">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal Batal!
            </Button>
            <Button 
              className="flex-1 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-200 transition-all hover:-translate-y-1 active:scale-95"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Menghapus..." : "Ya, Hapus Saja"}
            </Button>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 opacity-60">Tindakan ini tidak bisa dibatalkan ya Sayang ✨</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
