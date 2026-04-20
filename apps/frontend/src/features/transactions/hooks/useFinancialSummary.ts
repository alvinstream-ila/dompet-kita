import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/features/settings';
import { getFinancialSummaryAction } from '../actions/transactions';

export function useFinancialSummary(month?: number, year?: number) {
  const now = new Date();
  const targetMonth = month ?? now.getMonth();
  const targetYear = year ?? now.getFullYear();
  const { budgetCycleStart } = useSettings();

  const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
    queryKey: ['financial_summary', targetMonth, targetYear, budgetCycleStart],
    queryFn: async () => {
      const result = await getFinancialSummaryAction(
        targetMonth,
        targetYear,
        budgetCycleStart
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return {
    income: data?.income ?? 0,
    expense: data?.expense ?? 0,
    balance: data?.balance ?? 0,
    transactions: Array.isArray(data?.transactions)
      ? data.transactions
      : data?.transactions?.data && Array.isArray(data.transactions.data)
        ? data.transactions.data
        : [],
    period: data?.period,
    isLoading,
    isError,
    error:
      error instanceof Error
        ? error.message
        : isError
          ? 'Terjadi kesalahan sistem'
          : null,
    isRefetching,
    refetch,
  };
}
