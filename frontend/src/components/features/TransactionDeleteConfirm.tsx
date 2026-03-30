import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface TransactionDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
}

export const TransactionDeleteConfirm: React.FC<TransactionDeleteConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending
}) => {
  const [confirmStep, setConfirmStep] = useState(0); // 0: initial, 1: second confirm

  const handleClose = () => {
    setConfirmStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2 group">
            <AlertTriangle className={cn(
              "size-10 text-red-500 transition-all duration-300",
              confirmStep === 1 ? "scale-125 animate-bounce" : "group-hover:scale-110"
            )} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {confirmStep === 0 && "Hapus Transaksi?"}
              {confirmStep === 1 && "Yakin Banget Sayang?"}
            </h3>
            <p className="text-slate-500 font-bold text-[13px] leading-relaxed px-4">
              {confirmStep === 0 && "Duh, beneran mau dihapus catatannya? Sayang lho datanya ilang nanti..."}
              {confirmStep === 1 && "Oke, ini langkah terakhir ya sayang. Klik hapus kalau sudah yakin banget!"}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {confirmStep < 1 ? (
              <Button 
                 onClick={() => setConfirmStep(1)}
                 className="h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                 IA, SAYA YAKIN
              </Button>
            ) : (
              <Button 
                 disabled={isPending}
                 onClick={onConfirm}
                 className="h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[11px] shadow-lg transition-all active:scale-95"
              >
                 {isPending ? <Loader2 className="size-5 animate-spin" /> : "YA, HAPUS SEKARANG!"}
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={handleClose}
              className="h-12 rounded-2xl hover:bg-slate-50 font-bold text-slate-400 text-[11px] uppercase tracking-widest"
            >
              GAK JADI, BATALIN
            </Button>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="h-1.5 w-full bg-slate-100 flex">
          <div className={cn("h-full bg-red-500 transition-all duration-500", confirmStep === 0 ? "w-1/2" : "w-full")} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
