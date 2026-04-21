import { motion } from 'framer-motion';
import {
  Edit2,
  Minus,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Asset } from '@/types';

interface WealthAssetCardProps {
  asset: Asset;
  index: number;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onFund: (asset: Asset) => void;
  onWithdraw: (asset: Asset) => void;
  formatAmount: (amount: number) => string;
}

import { PremiumAssetIcon } from './PremiumAssetIcon';

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
      <Card className="group hover:border-blue-royal/30 overflow-hidden rounded-[28px] border-2 border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center">
                <PremiumAssetIcon
                  type={asset.type}
                  className="h-full w-full rounded-[20px]"
                />
              </div>
              <div>
                <h4 className="group-hover:text-blue-royal text-sm font-black tracking-tight text-slate-800 uppercase transition-colors">
                  {asset.name}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[9px] font-black tracking-[0.15em] text-slate-400 uppercase">
                    {asset.type}
                  </span>
                  {asset.is_market_synced && (
                    <span className="bg-blue-royal/5 text-blue-royal flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest uppercase">
                      <div className="bg-blue-royal size-1 animate-pulse rounded-full" />
                      Live Sync
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onEdit(asset)}
                className="hover:bg-blue-royal/5 hover:text-blue-royal rounded-xl p-2 text-slate-400 transition-all active:scale-90"
              >
                <Edit2 size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(asset.id)}
                className="hover:bg-red-stat/5 hover:text-red-stat rounded-xl p-2 text-slate-400 transition-all active:scale-90"
              >
                <Trash2 size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-1 text-[8px] font-black tracking-widest text-slate-400 uppercase">
                  Harga Pasar Real-time
                </p>
                <p className="text-base leading-none font-black tracking-tight text-slate-900">
                  {formatAmount(asset.market_price)}
                  <span className="ml-1 text-[8px] font-normal text-slate-400 capitalize">
                    /{asset.unit || 'unit'}
                  </span>
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-1 text-[8px] font-black tracking-widest text-slate-400 uppercase">
                  Modal (Total Spent)
                </p>
                <p className="text-base leading-none font-bold tracking-tight text-slate-600">
                  {formatAmount(asset.invested_capital)}
                </p>
              </div>
            </div>

            <div className="border-blue-royal/10 bg-blue-royal/5 rounded-2xl border-2 p-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-royal/70 mb-1 text-[8px] font-black tracking-widest uppercase">
                    Total Nilai Investasi
                  </p>
                  <p className="text-blue-royal text-xl leading-none font-black tracking-tighter">
                    {formatAmount(asset.value)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-[8px] font-black tracking-widest text-slate-400 uppercase">
                    Kepemilikan
                  </p>
                  <p className="text-[11px] font-black text-slate-600">
                    {asset.quantity} {asset.unit || 'Unit'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black tracking-tight uppercase',
                isProfit
                  ? 'bg-green-stat/5 text-green-stat'
                  : 'bg-red-stat/5 text-red-stat'
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
                type="button"
                onClick={() => onWithdraw(asset)}
                title="Cairkan / Ambil Profit"
                className="hover:bg-red-stat flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:text-white active:scale-90"
              >
                <Minus size={18} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={() => onFund(asset)}
                title="Top Up Modal"
                className="bg-blue-royal shadow-blue-royal/20 hover:bg-blue-royal flex size-10 items-center justify-center rounded-xl text-white shadow-lg transition-all hover:scale-110 active:scale-90"
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
