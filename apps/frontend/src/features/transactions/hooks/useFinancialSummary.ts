import { useQuery } from '@tanstack/react-query';
import { getFinancialSummaryAction } from '../actions/transactions';
import { useSettings } from '@/features/settings';

export function useFinancialSummary(month?: number, year?: number) {
  const now = new Date();
  const targetMonth = month ?? now.getMonth();
  const targetYear = year ?? now.getFullYear();
  const { budgetCycleStart } = useSettings();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['financial_summary', targetMonth, targetYear, budgetCycleStart],
    queryFn: () =>
      getFinancialSummaryAction(targetMonth, targetYear, budgetCycleStart),
  });

  return {
    income: data?.income || 0,
    expense: data?.expense || 0,
    balance: data?.balance || 0,
    transactions: Array.isArray(data?.transactions)
      ? data.transactions
      : data?.transactions?.data || [],
    period: data?.period,
    isLoading,
    refetch,
  };
}
