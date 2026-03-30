import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Transaction } from '@/types';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export function useTransactions(month?: number, year?: number) {
  const { budgetCycleStart } = useSettings();

  return useInfiniteQuery({
    queryKey: ['transactions', month, year, budgetCycleStart],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get('/transactions', {
        params: {
          month,
          year,
          page: pageParam,
          budget_cycle_start: budgetCycleStart,
          limit: 20,
        },
      });
      return data.data as Transaction[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newTransaction: Omit<Transaction, 'id' | 'created_at'>
    ) => {
      const { data } = await api.post('/transactions', newTransaction);
      return data;
    },
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: ['financial_summary'] });
      const previousSummary = queryClient.getQueryData(['financial_summary']);
      queryClient.setQueryData(
        ['financial_summary'],
        (
          old:
            | { income?: number; expense?: number; balance?: number }
            | undefined
        ) => {
          if (!old) return old;
          const amount = Number(newTransaction.amount);
          const isIncome = newTransaction.type === 'income';
          return {
            ...old,
            income: isIncome ? (old.income || 0) + amount : old.income || 0,
            expense: !isIncome ? (old.expense || 0) + amount : old.expense || 0,
            balance: isIncome
              ? (old.balance || 0) + amount
              : (old.balance || 0) - amount,
          };
        }
      );
      return { previousSummary };
    },
    onError: (_err, _newTx, context) => {
      if (context?.previousSummary) {
        queryClient.setQueryData(
          ['financial_summary'],
          context.previousSummary
        );
      }
      toast.error('Gagal Mencatat 🥺', {
        description: 'Tunggu sebentar dan coba lagi ya Sayang.',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai_insights'] });

      const isIncome = data.type === 'income';
      toast.success(isIncome ? 'Uang Masuk! 💰' : 'Pengeluaran Dicatat 💸', {
        description: isIncome
          ? 'Alhamdulillah rezeki kita nambah lagi! ✨'
          : 'Sudah aku catat ya Sayang, nanti kita evaluasi bareng. ❤️',
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Transaction> & { id: string }) => {
      const { data } = await api.put(`/transactions/${id}`, updates);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['ai_insights'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai_insights'] });
      toast.success('Berhasil Diupdate! ✨');
    },
    onError: () => {
      toast.error('Gagal Update 🥺');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['ai_insights'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai_insights'] });
      toast.info('Transaksi Dihapus 🗑️');
    },
    onError: () => {
      toast.error('Gagal Menghapus 🥺');
    },
  });
}
