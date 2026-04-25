import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/features/settings';
import { getFinancialSummaryAction } from '../actions/transactions';

import { Transaction } from '@/types';

export function useFinancialSummary(month?: number, year?: number) {
  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetYear = year ?? now.getFullYear();
  const { budgetCycleStart } = useSettings();

  /**
   * 🛡️ Query Stability: We include the cycle start in the key, but we
   * ensure that it doesn't trigger a hard loading state if it's just
   * flickering between undefined and the default value 1.
   */
  const effectiveCycleStart = budgetCycleStart || 1;

  const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
    queryKey: [
      'financial_summary',
      targetMonth,
      targetYear,
      effectiveCycleStart,
    ],
    queryFn: async () => {
      const result = await getFinancialSummaryAction(
        targetMonth,
        targetYear,
        effectiveCycleStart
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  /**
   * 🛠️ Logic Extraction: Resolve derived state outside the return object
   * to satisfy syntax rules and improve readability.
   */

  // 1. Resolve transactions array from different possible backend formats
  let transactions: Transaction[] = [];
  if (Array.isArray(data?.transactions)) {
    transactions = data.transactions;
  } else if (
    data?.transactions?.data &&
    Array.isArray(data.transactions.data)
  ) {
    transactions = data.transactions.data;
  }

  // 2. Resolve error message with proper typing
  let errorMessage: string | null = null;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (isError) {
    errorMessage = 'Terjadi kesalahan sistem';
  }

  return {
    income: data?.income ?? 0,
    expense: data?.expense ?? 0,
    balance: data?.balance ?? 0,
    cumulativeBalance: data?.cumulative_balance ?? 0,
    calendarIncome: data?.calendar_income ?? 0,
    calendarExpense: data?.calendar_expense ?? 0,
    transactions,
    period: data?.period,
    isLoading,
    isError,
    error: errorMessage,
    isRefetching,
    refetch,
  };
}
