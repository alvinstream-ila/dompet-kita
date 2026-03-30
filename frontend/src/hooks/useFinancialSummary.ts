import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useSettings } from './useSettings';

export function useFinancialSummary(month?: number, year?: number) {
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();
  const { budgetCycleStart } = useSettings();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['financial_summary', targetMonth, targetYear, budgetCycleStart],
    queryFn: async () => {
      const { data } = await api.get('/transactions/summary', {
        params: {
          month: targetMonth,
          year: targetYear,
          budget_cycle_start: budgetCycleStart,
        },
      });
      return data;
    },
  });

  return {
    income: data?.income || 0,
    expense: data?.expense || 0,
    balance: data?.balance || 0,
    transactions: data?.transactions || [],
    period: data?.period,
    isLoading,
    refetch,
  };
}
