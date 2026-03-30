import React from 'react';
import { Trash2, Edit3, Calendar, FileText } from 'lucide-react';

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
  transactions: Transaction[];
  loading?: boolean;
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
        <div className="py-12 text-center text-lg text-slate-400 italic">
          Belum ada catatan hari ini... 🏝️
        </div>
      ) : (
        transactions.map((t) => (
          <div
            key={t.id}
            className="group rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-black tracking-tight text-[#1a1c1e] uppercase">
                  {t.description}
                </h4>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 uppercase">
                    {t.category}
                    {t.sub_category && (
                      <span className="text-slate-200">/</span>
                    )}
                    {t.sub_category && (
                      <span className="text-[#ff78a4]">{t.sub_category}</span>
                    )}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(t.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span
                    className={`text-xl font-black ${t.type === 'expense' ? 'text-[#ff5252]' : 'text-[#4caf50]'}`}
                  >
                    {t.type === 'expense' ? '-' : '+'} Rp.{' '}
                    {t.amount.toLocaleString('id-ID')}
                  </span>
                  {t.receipt_url && (
                    <a
                      href={t.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-[10px] font-black text-[#ff78a4] uppercase hover:underline"
                    >
                      <FileText className="h-3 w-3" />
                      LIHAT STRUK
                    </a>
                  )}
                </div>

                <div className="flex flex-col gap-2 opacity-40 transition-opacity group-hover:opacity-100">
                  <button className="rounded-full p-2 text-slate-500 transition-all hover:bg-pink-50 hover:text-[#ff78a4]">
                    <Edit3 className="h-5 w-5" />
                  </button>
                  <button className="rounded-full p-2 text-slate-500 transition-all hover:bg-red-50 hover:text-red-500">
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
