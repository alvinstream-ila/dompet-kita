import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Heart, AlertTriangle } from 'lucide-react';
import api from '../../lib/axios';
import { cn } from '../../lib/utils';

interface InsightData {
  title: string;
  insight: string;
}

export const AIInsightCard: React.FC = () => {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInsight = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await api.get('/ai/insights');
      setInsight(response.data);
    } catch (err) {
      console.error('Failed to fetch AI insight', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="relative h-full overflow-hidden p-6 md:p-8 bg-white shadow-xl rounded-[40px] border-none group transition-all hover:-translate-y-1"
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-pink-500/5 via-violet-500/5 to-transparent opacity-100" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-50 shadow-inner">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-100" />
            </div>
            <h4 className="font-black tracking-tight text-slate-800 text-base md:text-lg">
              Pesan Sayang Buat Kamu ✨
            </h4>
          </div>
          <button 
            onClick={fetchInsight}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-4 h-4 text-slate-400", isLoading && "animate-spin")} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded-full" />
                <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded-full" />
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-2xl"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-wider">Yah, AI-nya lagi istirahat bentar, Sayang.. 🥺</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <h5 className="font-black text-pink-600 text-sm md:text-base tracking-tight leading-tight">
                  {insight?.title}
                </h5>
                <p className="text-[14px] md:text-[16px] font-medium text-slate-600 leading-relaxed italic border-l-4 border-pink-100 pl-4 py-1">
                  "{insight?.insight}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="px-3 py-1 bg-pink-50 text-pink-600 text-[9px] font-black uppercase tracking-widest rounded-full">
            Pesan Kasih Sayang
          </div>
          <Heart className="w-3 h-3 text-pink-500 fill-pink-500 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};
