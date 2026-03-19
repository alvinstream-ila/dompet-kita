import React from 'react';
import { 
  X,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [type, setType] = React.useState<'expense' | 'income'>('expense');

  const activeColorClass = type === 'expense' ? 'bg-slate-900 border-slate-900' : 'bg-emerald-600 border-emerald-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
        <DialogHeader className={cn("p-6 pb-10 text-white relative overflow-hidden transition-colors duration-500", activeColorClass)}>
          <div className="relative z-10 space-y-0.5">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Entry Transaction</p>
             <DialogTitle className="text-xl font-black flex items-center gap-2 tracking-tight text-white">
               {type === 'expense' ? <ArrowDownCircle className="size-5" /> : <ArrowUpCircle className="size-5" />}
               TAMBAH {type === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
             </DialogTitle>
             <DialogDescription className="sr-only">
               Catat transaksi pengeluaran atau pemasukan baru Anda dengan detail kategori dan nominal.
             </DialogDescription>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 w-11 h-11 rounded-full text-white hover:bg-white/10 hover:text-white transition-all active:scale-90 z-50"
            >
              <X className="w-6 h-6" strokeWidth={3} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="px-6 pb-8 -mt-6 relative z-20">
          <TransactionForm 
            onTypeChange={setType}
            onSuccess={() => {
                onSuccess();
                onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
