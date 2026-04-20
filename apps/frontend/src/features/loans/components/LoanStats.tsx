import { FileText } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/StatCard';

interface LoanStatsProps {
  totalPiutang: number;
  totalHutang: number;
  netPosition: number;
}

export const LoanStats: React.FC<LoanStatsProps> = ({
  totalPiutang,
  totalHutang,
  netPosition,
}) => {
  return (
    <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
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
        variant={netPosition >= 0 ? 'income' : 'expense'}
        isCurrency={true}
      />

      <div className="mt-2 flex justify-end md:col-span-3">
        <Link href="/loans/report">
          <Button
            variant="ghost"
            className="group h-12 rounded-2xl border border-slate-100 bg-white/50 px-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-pink-50 p-2 text-pink-600 transition-colors group-hover:bg-pink-600 group-hover:text-white">
                <FileText className="size-4" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase">
                Lihat Laporan Formal Amanah
              </span>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
};
