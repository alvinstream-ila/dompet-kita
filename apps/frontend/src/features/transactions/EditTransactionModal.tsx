import React, { useState } from 'react';
import { useDeleteTransaction } from './hooks/useTransactions';
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TransactionForm } from './TransactionForm';
import { TransactionDeleteConfirm } from './TransactionDeleteConfirm';
import type { Transaction } from '@/types';

interface EditTransactionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly transaction: Transaction | null;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transaction,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useDeleteTransaction();
  const [currentType, setCurrentType] = useState<'expense' | 'income'>(
    transaction?.type || 'expense'
  );

  if (!transaction && isOpen) return null;

  const handleDelete = async () => {
    if (!transaction) return;
    try {
      await deleteMutation.mutateAsync(transaction.id);
      onSuccess();
      onClose();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menghapus'
      );
    }
  };

  const activeColorClass =
    currentType === 'expense'
      ? 'bg-slate-900 border-slate-900'
      : 'bg-emerald-600 border-emerald-600';

  return (
    <>
      <Dialog
        open={isOpen && !showDeleteConfirm}
        onOpenChange={(open: boolean) => !open && onClose()}
      >
        <DialogContent className="overflow-hidden rounded-[32px] border-none p-0 shadow-2xl sm:max-w-md">
          <DialogHeader
            className={cn(
              'relative overflow-hidden p-6 pb-10 text-white transition-colors duration-500',
              activeColorClass
            )}
          >
            <div className="relative z-10 space-y-0.5">
              <p className="text-[9px] font-black tracking-[0.2em] uppercase opacity-80">
                Correcting Transaction
              </p>
              <DialogTitle className="flex w-full items-center justify-between text-xl font-black tracking-tight text-white">
                <div className="flex items-center gap-2">
                  {currentType === 'expense' ? (
                    <ArrowDownCircle className="size-5" />
                  ) : (
                    <ArrowUpCircle className="size-5" />
                  )}
                  EDIT {currentType === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-xl text-white hover:bg-red-500/20 hover:text-white"
                >
                  <Trash2 className="size-5" />
                </Button>
              </DialogTitle>
            </div>
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          </DialogHeader>

          <div className="relative z-20 -mt-6 px-6 pb-8">
            <TransactionForm
              mode="edit"
              transactionId={transaction?.id}
              initialData={{
                amount: transaction?.amount,
                description: transaction?.description,
                type: transaction?.type,
                category: transaction?.category,
                sub_category: transaction?.sub_category ?? undefined,
                date: transaction?.date,
                receipt_url: transaction?.receipt_url ?? undefined,
              }}
              onTypeChange={setCurrentType}
              onSuccess={() => {
                onSuccess();
                onClose();
              }}
              onCancel={onClose}
            />
          </div>
        </DialogContent>
      </Dialog>

      <TransactionDeleteConfirm
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};
