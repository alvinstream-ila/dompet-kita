import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Coins,
  Landmark,
  Gem,
  Bitcoin,
  Home,
  Edit2,
  Trash2,
  Plus,
  Minus,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Asset } from '@/types';
import { cn } from '@/lib/utils';

interface WealthAssetCardProps {
  asset: Asset;
  index: number;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onFund: (asset: Asset) => void;
  onWithdraw: (asset: Asset) => void;
  formatAmount: (amount: number) => string;
}

const getAssetIcon = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('emas'))
    return <Gem className="size-5 text-amber-500" />;
  if (typeLower.includes('saham'))
    return <TrendingUp className="size-5 text-blue-500" />;
  if (typeLower.includes('tabungan') || typeLower.includes('bank'))
    return <Landmark className="size-5 text-emerald-500" />;
  if (typeLower.includes('kripto') || typeLower.includes('crypto'))
    return <Bitcoin className="size-5 text-orange-500" />;
  if (typeLower.includes('properti'))
    return <Home className="size-5 text-indigo-500" />;
  return <Coins className="size-5 text-slate-500" />;
};

export const WealthAssetCard: React.FC<WealthAssetCardProps> = ({
  asset,
  index,
  onEdit,
  onDelete,
  onFund,
  onWithdraw,
  formatAmount,
}) => {
  const isProfit = asset.profit_amount >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      <Card className="group overflow-hidden rounded-[28px] border-2 border-slate-100 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-xl">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-[20px] border border-slate-100 bg-slate-50 shadow-inner transition-all group-hover:scale-110 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:shadow-md">
                {getAssetIcon(asset.type)}
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight text-slate-800 uppercase transition-colors group-hover:text-blue-600">
                  {asset.name}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[9px] font-black tracking-[0.15em] text-slate-400 uppercase">
                    {asset.type}
                  </span>
                  {asset.is_market_synced && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-black tracking-widest text-blue-600 uppercase">
                      <div className="size-1 animate-pulse rounded-full bg-blue-500" />
                      Live Sync
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
              <button
                onClick={() => onEdit(asset)}
                className="rounded-xl p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-500 active:scale-90"
              >
                <Edit2 size={14} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => onDelete(asset.id)}
                className="rounded-xl p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 active:scale-90"
              >
                <Trash2 size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 text-[8px] font-black tracking-widest text-slate-400 uppercase">
                Nilai Pasar
              </p>
              <p className="text-lg leading-none font-black tracking-tight text-slate-900">
                {formatAmount(asset.value)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 text-[8px] font-black tracking-widest text-slate-400 uppercase">
                Modal (Invested)
              </p>
              <p className="text-base leading-none font-bold tracking-tight text-slate-600">
                {formatAmount(asset.invested_capital)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black tracking-tight uppercase',
                isProfit
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              )}
            >
              {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isProfit ? '+' : ''}
              {asset.profit_percent}%
              <span className="ml-1 opacity-60">
                ({isProfit ? '+' : ''}
                {formatAmount(asset.profit_amount)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onWithdraw(asset)}
                title="Cairkan / Ambil Profit"
                className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-rose-500 hover:text-white active:scale-90"
              >
                <Minus size={18} strokeWidth={3} />
              </button>
              <button
                onClick={() => onFund(asset)}
                title="Top Up Modal"
                className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all hover:scale-110 hover:bg-blue-700 active:scale-90"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
