import {
  InfiniteData,
  QueryClient,
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

/**
 * 🔍 Helper to find a transaction within the React Query infinite cache.
 * Extracted to reduce cognitive complexity and nesting depth.
 */
function findTransactionInCache(
  queryClient: QueryClient,
  transactionId: string
): Transaction | undefined {
  const allTxs = queryClient.getQueriesData<InfiniteData<Transaction[]>>({
    queryKey: ['transactions'],
  });

  for (const [, data] of allTxs) {
    if (!data) continue;
    for (const page of data.pages) {
      const found = page.find((t) => t.id === transactionId);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * 🛠️ Helper to update a transaction in infinite query pages.
 */
function updateInfiniteTransactions(
  old: InfiniteData<Transaction[]> | undefined,
  updatedTx: Partial<Transaction> & { id: string }
): InfiniteData<Transaction[]> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) =>
      page.map((tx) => (tx.id === updatedTx.id ? { ...tx, ...updatedTx } : tx))
    ),
  };
}

/**
 * 🛠️ Helper to remove a transaction from infinite query pages.
 */
function removeInfiniteTransaction(
  old: InfiniteData<Transaction[]> | undefined,
  transactionId: string
): InfiniteData<Transaction[]> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) =>
      page.filter((tx) => tx.id !== transactionId)
    ),
  };
}

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
      const isFullPage = lastPage?.length === 20;
      return isFullPage ? allPages.length + 1 : undefined;
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
            pages: old.pages.map((page, index) =>
              index === 0 ? [optimisticTx, ...page] : page
            ),
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
            expense: isIncome
              ? old.expense
              : (Number(old.expense) || 0) + amount,
            balance: isIncome
              ? (Number(old.balance) || 0) + amount
              : (Number(old.balance) || 0) - amount,
            cumulative_balance: isIncome
              ? (Number(old.cumulative_balance) || 0) + amount
              : (Number(old.cumulative_balance) || 0) - amount,
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
      await queryClient.cancelQueries({ queryKey: ['financial_summary'] });

      const previousTransactions = queryClient.getQueryData(['transactions']);
      const previousSummaries = queryClient.getQueriesData({
        queryKey: ['financial_summary'],
      });

      // 1. Update Transaction List
      queryClient.setQueriesData<InfiniteData<Transaction[]>>(
        { queryKey: ['transactions'] },
        (old) => updateInfiniteTransactions(old, updatedTx)
      );

      // 2. Update Financial Summaries (Calculate Delta)
      const oldTx = findTransactionInCache(queryClient, updatedTx.id);

      if (oldTx) {
        const oldAmount = Number(oldTx.amount);
        const newAmount =
          updatedTx.amount === undefined ? oldAmount : Number(updatedTx.amount);
        const oldIsIncome = oldTx.type === 'income';
        const newIsIncome =
          updatedTx.type === undefined
            ? oldIsIncome
            : updatedTx.type === 'income';

        previousSummaries.forEach(([key]) => {
          queryClient.setQueryData<FinancialSummary>(key, (oldSummary) => {
            if (!oldSummary) return oldSummary;

            const incomeDelta =
              (newIsIncome ? newAmount : 0) - (oldIsIncome ? oldAmount : 0);
            const expenseDelta =
              (newIsIncome ? 0 : newAmount) - (oldIsIncome ? 0 : oldAmount);

            const updatedIncome = Number(oldSummary.income) + incomeDelta;
            const updatedExpense = Number(oldSummary.expense) + expenseDelta;

            return {
              ...oldSummary,
              income: updatedIncome,
              expense: updatedExpense,
              balance: updatedIncome - updatedExpense,
              cumulative_balance:
                (Number(oldSummary.cumulative_balance) || 0) +
                incomeDelta -
                expenseDelta,
            };
          });
        });
      }

      return { previousTransactions, previousSummaries };
    },
    onError: (_err, _variables, context) => {
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
      toast.error('Gagal Update 🥺');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onSuccess: (transaction) => {
      toast.success('Berhasil Diupdate! ✨', {
        description: `Transaksi "${transaction.description}" sudah aku perbarui ya Sayang! ❤️`,
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      const result = await deleteTransactionAction(transaction.id);
      if (!result.success) throw new Error(result.error);
      return transaction;
    },
    onMutate: async (deletedTx) => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      await queryClient.cancelQueries({ queryKey: ['financial_summary'] });

      // 2. Snapshot previous state
      const previousTransactions = queryClient.getQueryData(['transactions']);
      const previousSummaries = queryClient.getQueriesData({
        queryKey: ['financial_summary'],
      });

      // 3. Optimistically remove from transaction list
      queryClient.setQueriesData<InfiniteData<Transaction[]>>(
        { queryKey: ['transactions'] },
        (old) => removeInfiniteTransaction(old, deletedTx.id)
      );

      // 4. Optimistically update financial summaries (Reverse the transaction effect)
      previousSummaries.forEach(([key]) => {
        queryClient.setQueryData<FinancialSummary>(key, (old) => {
          if (!old) return old;
          const amount = Number(deletedTx.amount);
          const isIncome = deletedTx.type === 'income';

          return {
            ...old,
            income: isIncome ? (Number(old.income) || 0) - amount : old.income,
            expense: isIncome
              ? old.expense
              : (Number(old.expense) || 0) - amount,
            balance: isIncome
              ? (Number(old.balance) || 0) - amount
              : (Number(old.balance) || 0) + amount,
            cumulative_balance: isIncome
              ? (Number(old.cumulative_balance) || 0) - amount
              : (Number(old.cumulative_balance) || 0) + amount,
          };
        });
      });

      return { previousTransactions, previousSummaries };
    },
    onError: (_err, _variables, context) => {
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
      toast.error('Gagal Menghapus 🥺');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onSuccess: () => {
      toast.info('Transaksi Dihapus 🗑️');
    },
  });
}
