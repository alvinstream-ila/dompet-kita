'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { TransactionForm } from '@/features/transactions';

/**
 * CreateTransaction Page - Manual / pre-filled via Scanner 💸
 * Ported to Next.js 15 (App Router)
 *
 * Key refactors:
 * - `useLocation().state` replaced with `useSearchParams()` to read pre-filled
 *   data passed by the ReceiptScanner page via query params
 * - `useNavigate` replaced with `useRouter`
 */
export default function CreateTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Build initialData from URL search params passed by the Receipt Scanner.
   * If no params exist (manual entry), initialData is null.
   */
  const amount = searchParams.get('amount');
  const initialData = amount
    ? {
        amount: Number(amount),
        description: searchParams.get('description') || '',
        category: searchParams.get('category') || '',
        receipt_url: searchParams.get('receipt_url') || '',
        receipt_path: searchParams.get('receipt_path') || '',
        type: (searchParams.get('type') as 'income' | 'expense') || 'expense',
        date:
          searchParams.get('date') || new Date().toISOString().split('T')[0],
      }
    : undefined;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-36">
      <div className="mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="group flex items-center gap-2 rounded-full p-2 transition-colors hover:bg-slate-100"
        >
          <ChevronLeft className="h-6 w-6 text-slate-400 group-hover:text-slate-900" />
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase group-hover:text-slate-900">
            Batal
          </span>
        </button>
        <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800 uppercase">
          Catat Jejak Cuan <Sparkles className="size-5 text-amber-400" />
        </h1>
        <div className="w-16" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="rounded-[40px] border-none bg-white/70 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="mb-6">
            <p className="mb-1 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
              Entry Form
            </p>
            <h2 className="text-lg font-black tracking-tighter text-slate-800 uppercase">
              {initialData?.amount
                ? 'Review Data Struk ✨'
                : 'Input Transaksi Manual'}
            </h2>
          </div>

          <TransactionForm
            initialData={initialData}
            onSuccess={() => router.push('/')}
            onCancel={() => router.back()}
          />
        </Card>
      </motion.div>

      <p className="mx-auto mt-12 max-w-xs px-10 text-center text-[10px] leading-relaxed font-black tracking-[0.2em] text-slate-400 uppercase">
        Setiap rupiah yang kita catat adalah satu langkah lebih dekat ke{' '}
        <span className="text-pink-500">Mimpi Kita</span> bersama! ❤️
      </p>
    </div>
  );
}
