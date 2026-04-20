import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSettings } from '@/features/settings';
import api from '@/lib/axios';
import type { Transaction } from '@/types';
import {
  addTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from '../actions/transactions';

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

      // Laravel Paginated Response: { success: true, data: { data: Transaction[], ... } }
      // Safely access data or fallback to empty array
      return (data?.data?.data || []) as Transaction[];
    },
    getNextPageParam: (lastPage, allPages) => {
      // Safely check length to avoid 'Cannot read properties of undefined'
      return lastPage?.length === 20 ? allPages.length + 1 : undefined;
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newTransaction: Omit<Transaction, 'id' | 'created_at'>
    ) => {
      const result = await addTransactionAction(newTransaction);
      if (!result.success) throw new Error(result.error);
      return result.data.data;
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
            expense: isIncome ? old.expense || 0 : (old.expense || 0) + amount,
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
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai_insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai_guardian'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });

      const isIncome = transaction.type === 'income';
      toast.success(isIncome ? 'Uang Masuk! 💰' : 'Pengeluaran Dicatat 💸', {
        description: isIncome
          ? `Alhamdulillah rezeki kita nambah lagi Rp ${Number(transaction.amount).toLocaleString('id-ID')}! ✨`
          : `Sudah aku bantu catat pengeluaran "${transaction.description}" sebesar Rp ${Number(transaction.amount).toLocaleString('id-ID')} ya Sayang! ❤️`,
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
      const result = await updateTransactionAction({ id, ...updates });
      if (!result.success) throw new Error(result.error);
      return result.data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['ai_insights'] });
    },
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai_insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai_guardian'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Berhasil Diupdate! ✨', {
        description: `Transaksi "${transaction.description}" sudah aku perbarui ya Sayang! ❤️`,
      });
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
      const result = await deleteTransactionAction(id);
      if (!result.success) throw new Error(result.error);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['ai_insights'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai_insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai_guardian'] });
      toast.info('Transaksi Dihapus 🗑️');
    },
    onError: () => {
      toast.error('Gagal Menghapus 🥺');
    },
  });
}
