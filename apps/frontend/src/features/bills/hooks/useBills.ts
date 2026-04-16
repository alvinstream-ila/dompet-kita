'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  category: string;
  frequency: 'monthly' | 'weekly' | 'yearly' | 'daily';
  status: 'pending' | 'paid';
  lastPaidAt?: string;
}

// Backend Model from ScheduledTransaction
interface ScheduledTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  status: 'active' | 'paused' | 'finished';
  last_executed_at: string | null;
}

const mapBackendToFrontend = (task: ScheduledTransaction): Bill => {
  // Logic to determine if it's "paid" in current cycle
  // For simplicity: if last_executed_at is present and next_due_date is in the future relative to execution
  // We'll just check if it was executed recently (e.g., this month)
  const lastExecuted = task.last_executed_at
    ? new Date(task.last_executed_at)
    : null;
  const now = new Date();

  const isPaid =
    lastExecuted &&
    ((task.recurrence === 'monthly' &&
      lastExecuted.getMonth() === now.getMonth() &&
      lastExecuted.getFullYear() === now.getFullYear()) ||
      (task.recurrence === 'daily' &&
        lastExecuted.toDateString() === now.toDateString()) ||
      (task.recurrence === 'weekly' &&
        now.getTime() - lastExecuted.getTime() < 7 * 24 * 60 * 60 * 1000));

  return {
    id: task.id,
    name: task.description,
    amount: Number(task.amount),
    dueDate: task.next_due_date,
    category: task.category || 'Lainnya',
    frequency: task.recurrence,
    status: isPaid ? 'paid' : 'pending',
    lastPaidAt: task.last_executed_at ?? undefined,
  };
};

export function useBills() {
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['scheduled-transactions'],
    queryFn: async () => {
      const { data } = await api.get('/scheduled-transactions');
      // Unwrap data.data if it's from the controller's success() trait
      const raw = Array.isArray(data) ? data : data.data;
      return raw.map(mapBackendToFrontend);
    },
  });

  const addBillMutation = useMutation({
    mutationFn: async (newBill: Omit<Bill, 'id' | 'status'>) => {
      const { data } = await api.post('/scheduled-transactions', {
        description: newBill.name,
        amount: newBill.amount,
        type: 'expense',
        category: newBill.category,
        recurrence: newBill.frequency,
        next_due_date: newBill.dueDate,
        is_auto_execute: false, // Default to manual for the "Tagihan Kita" page
      });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-transactions'] });
      toast.success('Tagihan baru dicatat! 💸', {
        description: `Sudah aku jadwalkan "${data.description}" buat kita ya Sayang! ❤️`,
      });
    },
    onError: () => toast.error('Gagal mencatat tagihan 🥺'),
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/scheduled-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-transactions'] });
      toast.info('Tagihan dihapus 🗑️', {
        description: 'Tenang Sayang, satu beban berkurang! ✨',
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/scheduled-transactions/${id}/execute`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Transaction was created
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      toast.success('Yeay! Tagihan Lunas! 💖', {
        description: `Tagihan "${data.description}" sudah dibayar dan dicatat ya Sayang! ✨`,
      });
    },
  });

  return {
    bills,
    isLoading,
    addBill: (bill: Omit<Bill, 'id' | 'status'>) =>
      addBillMutation.mutate(bill),
    deleteBill: (id: string) => deleteBillMutation.mutate(id),
    markAsPaid: (id: string) => markAsPaidMutation.mutate(id),
    resetStatus: () => {}, // No longer applicable with real server state
  };
}
