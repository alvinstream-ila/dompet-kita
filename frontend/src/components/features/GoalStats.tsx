import React from 'react';
import { StatCard } from '../ui/StatCard';

interface GoalStatsProps {
  totalSaved: number;
  totalTarget: number;
  remainingTotal: number;
}

export const GoalStats: React.FC<GoalStatsProps> = ({
  totalSaved,
  totalTarget,
  remainingTotal
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
      <StatCard 
        title="Total Dana Terkumpul" 
        amount={totalSaved} 
        imageSrc="/icons/3d/income.webp" 
        variant="income" 
      />
      <StatCard 
        title="Total Target Kita" 
        amount={totalTarget} 
        imageSrc="/icons/3d/wallet.webp" 
        isCurrency={true} 
      />
      <StatCard 
        title="Kekurangan Dana" 
        amount={remainingTotal} 
        imageSrc="/icons/3d/expense.webp" 
        variant="expense" 
      />
    </div>
  );
};
