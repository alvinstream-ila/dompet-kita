import { Calendar, Edit3, FileText, Trash2 } from 'lucide-react';
import { cn, parseLocalDate } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  sub_category?: string;
  date: string;
  receipt_url?: string;
}

interface TransactionListProps {
  readonly transactions: Transaction[];
  readonly loading?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="glass-card py-12 text-center text-lg text-slate-400 italic">
          Belum ada catatan hari ini... 🏝️
        </div>
      ) : (
        transactions.map((t) => (
          <div
            key={t.id}
            className="group glass-card p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-black tracking-tight text-slate-800 uppercase">
                  {t.description}
                </h4>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 uppercase">
                    {t.category}
                    {t.sub_category && (
                      <span className="text-slate-200">/</span>
                    )}
                    {t.sub_category && (
                      <span className="text-pink-primary">
                        {t.sub_category}
                      </span>
                    )}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-400/60 uppercase">
                  <Calendar className="h-3.5 w-3.5" />
                  {parseLocalDate(t.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      'text-xl font-black tracking-tighter',
                      t.type === 'expense' ? 'text-red-stat' : 'text-green-stat'
                    )}
                  >
                    {t.type === 'expense' ? '-' : '+'} Rp.{' '}
                    {t.amount.toLocaleString('id-ID')}
                  </span>
                  {t.receipt_url && (
                    <a
                      href={t.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-primary mt-1 flex items-center gap-1 text-[10px] font-black uppercase hover:underline"
                    >
                      <FileText className="h-3 w-3" />
                      LIHAT STRUK
                    </a>
                  )}
                </div>

                <div className="flex scale-90 flex-col gap-2 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                  <button
                    type="button"
                    className="hover:bg-pink-primary/10 hover:text-pink-primary rounded-full p-2 text-slate-400 transition-all"
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="hover:bg-red-stat/10 hover:text-red-stat rounded-full p-2 text-slate-400 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
