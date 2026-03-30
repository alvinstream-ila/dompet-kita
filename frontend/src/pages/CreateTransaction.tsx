import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { TransactionForm } from '@/components/features/TransactionForm';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

const CreateTransaction: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state || null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
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
            onSuccess={() => navigate('/')}
            onCancel={() => navigate(-1)}
          />
        </Card>
      </motion.div>

      <p className="mx-auto mt-12 max-w-xs px-10 text-center text-[10px] leading-relaxed font-black tracking-[0.2em] text-slate-400 uppercase">
        Setiap rupiah yang kita catat adalah satu langkah lebih dekat ke{' '}
        <span className="text-pink-500">Mimpi Kita</span> bersama! ❤️
      </p>
    </div>
  );
};

export default CreateTransaction;
