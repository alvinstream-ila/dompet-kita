import React from 'react';
import { StatCard } from '../ui/StatCard';

interface LoanStatsProps {
  totalPiutang: number;
  totalHutang: number;
  netPosition: number;
}

export const LoanStats: React.FC<LoanStatsProps> = ({
  totalPiutang,
  totalHutang,
  netPosition
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
      <StatCard 
        title="Titipan Keluar (Rezeki)" 
        amount={totalPiutang} 
        imageSrc="/icons/3d/income.webp" 
        variant="income" 
      />
      <StatCard 
        title="Titipan Masuk (Amanah)" 
        amount={totalHutang} 
        imageSrc="/icons/3d/expense.webp" 
        variant="expense" 
      />
      <StatCard 
        title="Posisi Bersih" 
        amount={netPosition} 
        imageSrc="/icons/3d/wallet.webp" 
        variant={netPosition >= 0 ? "income" : "expense"}
        isCurrency={true}
      />
    </div>
  );
};
