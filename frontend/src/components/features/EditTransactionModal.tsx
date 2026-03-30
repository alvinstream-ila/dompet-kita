import React, { useState } from 'react';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { 
  ArrowDownCircle, 
  ArrowUpCircle,
  Trash2,
} from 'lucide-react';
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from './TransactionForm';
import { TransactionDeleteConfirm } from './TransactionDeleteConfirm';
import type { Transaction } from '@/types';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, onSuccess, transaction }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useDeleteTransaction();
  const [currentType, setCurrentType] = useState<'expense' | 'income'>(transaction?.type || 'expense');

  if (!transaction && isOpen) return null;

  const handleDelete = async () => {
    if (!transaction) return;
    try {
      await deleteMutation.mutateAsync(transaction.id);
      onSuccess();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus');
    }
  };

  const activeColorClass = currentType === 'expense' ? 'bg-slate-900 border-slate-900' : 'bg-emerald-600 border-emerald-600';

  return (
    <>
      <Dialog open={isOpen && !showDeleteConfirm} onOpenChange={(open: boolean) => !open && onClose()}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
          <DialogHeader className={cn("p-6 pb-10 text-white relative overflow-hidden transition-colors duration-500", activeColorClass)}>
            <div className="relative z-10 space-y-0.5">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Correcting Transaction</p>
               <DialogTitle className="text-xl font-black flex items-center justify-between tracking-tight text-white w-full">
                 <div className="flex items-center gap-2">
                   {currentType === 'expense' ? <ArrowDownCircle className="size-5" /> : <ArrowUpCircle className="size-5" />}
                   EDIT {currentType === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
                 </div>
                 <Button 
                   type="button" 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setShowDeleteConfirm(true)}
                   className="text-white hover:bg-red-500/20 hover:text-white rounded-xl"
                 >
                   <Trash2 className="size-5" />
                 </Button>
               </DialogTitle>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </DialogHeader>

          <div className="px-6 pb-8 -mt-6 relative z-20">
            <TransactionForm 
              mode="edit"
              transactionId={transaction?.id}
              initialData={{
                amount: transaction?.amount,
                description: transaction?.description,
                type: transaction?.type,
                category: transaction?.category,
                sub_category: transaction?.sub_category,
                date: transaction?.date,
                receipt_url: transaction?.receipt_url
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
