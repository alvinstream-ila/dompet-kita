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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 group"
                >
                    <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Batal</span>
                </button>
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    Catat Jejak Cuan <Sparkles className="size-5 text-amber-400" />
                </h1>
                <div className="w-16" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="p-6 md:p-8 rounded-[40px] border-none shadow-2xl bg-white/70 backdrop-blur-xl">
                    <div className="mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Entry Form</p>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                            {initialData?.amount ? 'Review Data Struk ✨' : 'Input Transaksi Manual'}
                        </h2>
                    </div>

                    <TransactionForm 
                        initialData={initialData}
                        onSuccess={() => navigate('/')}
                        onCancel={() => navigate(-1)}
                    />
                </Card>
            </motion.div>

            <p className="text-center mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-10 leading-relaxed max-w-xs mx-auto">
                Setiap rupiah yang kita catat adalah satu langkah lebih dekat ke <span className="text-pink-500">Mimpi Kita</span> bersama! ❤️
            </p>
        </div>
    );
};

export default CreateTransaction;
