import { useMemo } from 'react';
import { useTransactions } from './useTransactions';

export function useFinancialSummary(month?: number, year?: number) {
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  const { data: infiniteData, isLoading, refetch } = useTransactions(targetMonth, targetYear);
  
  const transactions = useMemo(() => {
    return infiniteData?.pages.flat() || [];
  }, [infiniteData?.pages]);

  const summary = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  return {
    income: summary.income,
    expense: summary.expense,
    balance: summary.income - summary.expense,
    isLoading,
    refetch,
    transactions // Latest transactions for this period
  };
}
