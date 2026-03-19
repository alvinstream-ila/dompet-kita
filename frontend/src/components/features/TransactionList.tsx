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

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-400 italic text-lg">
          Belum ada catatan hari ini... 🏝️
        </div>
      ) : (
        transactions.map((t) => (
          <div key={t.id} className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h4 className="text-[#1a1c1e] font-black text-lg uppercase tracking-tight">
                  {t.description}
                </h4>
                <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                  <span className="flex items-center gap-1.5 uppercase">
                    {t.category} 
                    {t.sub_category && <span className="text-slate-200">/</span>}
                    {t.sub_category && <span className="text-[#ff78a4]">{t.sub_category}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold mt-1 uppercase">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className={`text-xl font-black ${t.type === 'expense' ? 'text-[#ff5252]' : 'text-[#4caf50]'}`}>
                    {t.type === 'expense' ? '-' : '+'} Rp. {t.amount.toLocaleString('id-ID')}
                  </span>
                  {t.receipt_url && (
                    <a 
                      href={t.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-black text-[#ff78a4] hover:underline uppercase mt-1"
                    >
                      <FileText className="w-3 h-3" />
                      LIHAT STRUK
                    </a>
                  )}
                </div>

                <div className="flex flex-col gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 text-slate-500 hover:text-[#ff78a4] hover:bg-pink-50 rounded-full transition-all">
                      <Edit3 className="w-5 h-5" />
                   </button>
                   <button className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                      <Trash2 className="w-5 h-5" />
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
