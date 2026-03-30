import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoanForm } from './LoanForm';
import type { Loan } from '@/types';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan?: Loan | null;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, loan }) => {
  const [currentType, setCurrentType] = useState<'utang' | 'piutang'>(loan?.type || 'utang');

  const activeColorClass = currentType === 'utang' ? 'bg-rose-500 border-rose-500' : 'bg-emerald-600 border-emerald-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-[440px] p-0 overflow-hidden rounded-[40px] border-none shadow-2xl bg-white">
        <DialogHeader className={cn("p-6 pb-8 text-white relative overflow-hidden transition-colors duration-500 min-h-[120px] flex flex-col justify-end", activeColorClass)}>
          <div className="relative z-10 space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">{loan ? 'Update Progress Pelunasan' : 'Catat Titipan Baru'}</p>
             <DialogTitle className="text-2xl font-black flex items-center gap-2.5 tracking-tighter text-white">
               {currentType === 'utang' ? <ArrowDownCircle className="size-6" /> : <ArrowUpCircle className="size-6" />}
               {loan ? 'BAYAR' : 'TAMBAH'} {currentType === 'utang' ? 'HUTANG' : 'PIUTANG'}
             </DialogTitle>
             <DialogDescription className="sr-only">
               Formulir untuk menambah atau mengupdate data hutang dan piutang.
             </DialogDescription>
          </div>
          
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute -left-10 bottom-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />
          
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full text-white hover:bg-white/20 hover:text-white transition-all active:scale-90 z-50 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto scrollbar-none px-6 pb-8 -mt-4 relative z-20">
          <LoanForm 
            loan={loan}
            onTypeChange={setCurrentType}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
