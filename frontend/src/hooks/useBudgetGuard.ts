import { useMemo } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useFinancialSummary } from './useFinancialSummary';

export function useBudgetGuard() {
  const { monthlyBudgetLimit } = useSettings();
  const now = new Date();

  // Use financial summary instead of full transaction list (much more efficient)
  const { expense: currentMonthExpenses } = useFinancialSummary(
    now.getMonth(),
    now.getFullYear()
  );

  const progress = useMemo(() => {
    if (monthlyBudgetLimit === 0) return 0;
    return (currentMonthExpenses / monthlyBudgetLimit) * 100;
  }, [currentMonthExpenses, monthlyBudgetLimit]);

  const status = useMemo(() => {
    if (progress >= 100) return 'DANGER';
    if (progress >= 80) return 'WARNING';
    if (progress >= 50) return 'CAUTION';
    return 'SAFE';
  }, [progress]);

  const aiMessage = useMemo(() => {
    switch (status) {
      case 'DANGER':
        return 'ADUH SAYANG! 🆘 Budget kita udah jebol nih. Peluk aku dulu yuk biar tenang, terus kita rem total pengeluaran hari ini ya! ❤️';
      case 'WARNING':
        return 'Hati-hati Sayang, udah 80% nih! ⚠️ Tipis banget sisa budget-nya. Kuat-kuatin iman ya kalo liat promo TikTok Shop! 😂';
      case 'CAUTION':
        return 'Setengah jalan nih Sayang! 🎢 Budget kita udah kepakai 50%. Masih aman kok, tapi tetep dijagain ya Cintaku. I love you!';
      default:
        return 'Budget kita masih super aman! 🛡️✨ Sayang pinter banget deh atur uangnya. Makin sayang makin bangga! Muach! 💋';
    }
  }, [status]);

  return {
    limit: monthlyBudgetLimit,
    spent: currentMonthExpenses,
    remaining: Math.max(0, monthlyBudgetLimit - currentMonthExpenses),
    progress,
    status,
    aiMessage,
  };
}
