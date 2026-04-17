import { ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoanForm } from '@/features/loans';
import { cn } from '@/lib/utils';
import type { Loan } from '@/types';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan?: Loan | null;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  const [currentType, setCurrentType] = useState<'utang' | 'piutang'>(
    loan?.type || 'utang'
  );

  const activeColorClass =
    currentType === 'utang'
      ? 'bg-red-stat border-red-stat'
      : 'bg-green-stat border-green-stat';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-[40px] border-none bg-white p-0 shadow-2xl sm:max-w-[440px]"
      >
        <DialogHeader
          className={cn(
            'relative flex min-h-[120px] flex-col justify-end overflow-hidden p-6 pb-8 text-white transition-colors duration-500',
            activeColorClass
          )}
        >
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-90">
              {loan ? 'Update Progress Pelunasan' : 'Catat Titipan Baru'}
            </p>
            <DialogTitle className="flex items-center gap-2.5 text-2xl font-black tracking-tighter text-white">
              {currentType === 'utang' ? (
                <ArrowDownCircle className="size-6" />
              ) : (
                <ArrowUpCircle className="size-6" />
              )}
              {loan ? 'BAYAR' : 'TAMBAH'}{' '}
              {currentType === 'utang' ? 'HUTANG' : 'PIUTANG'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulir untuk menambah atau mengupdate data hutang dan piutang.
            </DialogDescription>
          </div>

          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-0 -left-10 h-24 w-24 rounded-full bg-black/10 blur-xl" />

          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="group absolute top-4 right-4 z-50 h-10 w-10 rounded-full text-white transition-all hover:bg-white/20 hover:text-white active:scale-90"
            >
              <X
                className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
                strokeWidth={3}
              />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="scrollbar-none relative z-20 -mt-4 max-h-[75vh] overflow-y-auto px-6 pb-8">
          <LoanForm
            loan={loan}
            onTypeChange={setCurrentType}
            onSuccess={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
