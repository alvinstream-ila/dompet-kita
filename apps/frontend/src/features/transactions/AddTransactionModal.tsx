import { ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { TransactionForm } from './TransactionForm';

interface AddTransactionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = React.useState<'expense' | 'income'>('expense');

  const activeColorClass =
    type === 'expense'
      ? 'bg-slate-900 border-slate-900'
      : 'bg-emerald-600 border-emerald-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-[32px] border-none p-0 shadow-2xl sm:max-w-md"
      >
        <DialogHeader
          className={cn(
            'relative overflow-hidden p-6 pb-10 text-white transition-colors duration-500',
            activeColorClass
          )}
        >
          <div className="relative z-10 space-y-0.5">
            <p className="text-[9px] font-black tracking-[0.2em] uppercase opacity-80">
              Entry Transaction
            </p>
            <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
              {type === 'expense' ? (
                <ArrowDownCircle className="size-5" />
              ) : (
                <ArrowUpCircle className="size-5" />
              )}
              TAMBAH {type === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Catat transaksi pengeluaran atau pemasukan baru Anda dengan detail
              kategori dan nominal.
            </DialogDescription>
          </div>
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 h-11 w-11 rounded-full text-white transition-all hover:bg-white/10 hover:text-white active:scale-90"
            >
              <X className="h-6 w-6" strokeWidth={3} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="relative z-20 -mt-6 px-6 pb-8">
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
