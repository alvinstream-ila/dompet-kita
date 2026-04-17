import type React from 'react';
import { StatCard } from '@/components/ui/StatCard';

interface ReportStatsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const ReportStats: React.FC<ReportStatsProps> = ({
  totalIncome,
  totalExpense,
  balance,
}) => {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Pemasukan"
        amount={totalIncome}
        imageSrc="/icons/3d/income.webp"
        variant="income"
      />
      <StatCard
        title="Total Pengeluaran"
        amount={totalExpense}
        imageSrc="/icons/3d/expense.webp"
        variant="expense"
      />
      <StatCard
        title="Total Saldo"
        amount={balance}
        imageSrc="/icons/3d/wallet.webp"
        variant="saldo"
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
};
