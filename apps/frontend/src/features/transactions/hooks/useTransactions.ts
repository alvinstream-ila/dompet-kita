import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSettings } from '@/features/settings';
import api from '@/lib/axios';
import type { FinancialSummary, Transaction } from '@/types';
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
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      await queryClient.cancelQueries({ queryKey: ['financial_summary'] });

      // 2. Snapshot the previous values
      const previousTransactions = queryClient.getQueryData(['transactions']);
      const previousSummaries = queryClient.getQueriesData({
        queryKey: ['financial_summary'],
      });

      // 3. Optimistically update the transactions list (Infinite Query)
      queryClient.setQueriesData<InfiniteData<Transaction[]>>(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;

          const optimisticTx = {
            ...newTransaction,
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
          } as Transaction;

          return {
            ...old,
            pages: old.pages.map((page: Transaction[], index: number) => {
              if (index === 0) {
                return [optimisticTx, ...page];
              }
              return page;
            }),
          };
        }
      );

      // 4. Optimistically update financial summaries
      previousSummaries.forEach(([key]) => {
        queryClient.setQueryData<FinancialSummary>(key, (old) => {
          if (!old) return old;
          const amount = Number(newTransaction.amount);
          const isIncome = newTransaction.type === 'income';
          return {
            ...old,
            income: isIncome ? (Number(old.income) || 0) + amount : old.income,
            expense: !isIncome
              ? (Number(old.expense) || 0) + amount
              : old.expense,
            balance: isIncome
              ? (Number(old.balance) || 0) + amount
              : (Number(old.balance) || 0) - amount,
          };
        });
      });

      return { previousTransactions, previousSummaries };
    },
    onError: (_err, _newTx, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData(
          { queryKey: ['transactions'] },
          context.previousTransactions
        );
      }
      if (context?.previousSummaries) {
        context.previousSummaries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Gagal Mencatat 🥺', {
        description: 'Tenang Sayang, datanya aman. Coba lagi sebentar ya.',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure we are in sync with the server
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onSuccess: (transaction) => {
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
    onMutate: async (updatedTx) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      queryClient.setQueriesData<InfiniteData<Transaction[]>>(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: Transaction[]) =>
              page.map((tx) =>
                tx.id === updatedTx.id ? { ...tx, ...updatedTx } : tx
              )
            ),
          };
        }
      );

      return { previousTransactions };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData(
          { queryKey: ['transactions'] },
          context.previousTransactions
        );
      }
      toast.error('Gagal Update 🥺');
    },
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Berhasil Diupdate! ✨', {
        description: `Transaksi "${transaction.description}" sudah aku perbarui ya Sayang! ❤️`,
      });
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      queryClient.setQueriesData<InfiniteData<Transaction[]>>(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: Transaction[]) =>
              page.filter((tx) => tx.id !== id)
            ),
          };
        }
      );

      return { previousTransactions };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData(
          { queryKey: ['transactions'] },
          context.previousTransactions
        );
      }
      toast.error('Gagal Menghapus 🥺');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      toast.info('Transaksi Dihapus 🗑️');
    },
  });
}
