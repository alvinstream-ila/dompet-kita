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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Asset } from '@/types';

interface WealthAssetCardProps {
  asset: Asset;
  index: number;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  formatAmount: (amount: number) => string;
}

const getAssetIcon = (type: string) => {
  switch (type) {
    case 'Emas':
      return <Gem className="size-5 text-amber-500" />;
    case 'Saham':
      return <TrendingUp className="size-5 text-blue-500" />;
    case 'Tabungan':
      return <Landmark className="size-5 text-emerald-500" />;
    case 'Kripto':
      return <Bitcoin className="size-5 text-orange-500" />;
    case 'Properti':
      return <Home className="size-5 text-indigo-500" />;
    default:
      return <Coins className="size-5 text-slate-500" />;
  }
};

export const WealthAssetCard: React.FC<WealthAssetCardProps> = ({
  asset,
  index,
  onEdit,
  onDelete,
  formatAmount,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      <Card className="group overflow-hidden rounded-[28px] border border-none border-white/50 bg-white shadow-md transition-all hover:shadow-xl">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-inner transition-all group-hover:scale-110 group-hover:shadow-md">
              {getAssetIcon(asset.type)}
            </div>
            <div>
              <h4 className="text-sm leading-tight font-black tracking-tight text-slate-800 uppercase transition-colors group-hover:text-blue-600">
                {asset.name}
              </h4>
              <p className="mt-0.5 text-[9px] font-black tracking-[0.15em] text-slate-400 uppercase">
                {asset.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-black tracking-tight text-slate-900">
                {formatAmount(asset.value)}
              </p>
              <p className="mt-1 text-[8px] font-black tracking-widest text-slate-300 uppercase">
                Current Value
              </p>
            </div>
            <div className="flex translate-x-2 transform flex-col gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
              <button
                onClick={() => onEdit(asset)}
                className="rounded-xl p-2 text-blue-500 transition-all hover:bg-blue-50 active:scale-90"
                type="button"
              >
                <Edit2 size={13} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => onDelete(asset.id)}
                className="rounded-xl p-2 text-rose-500 transition-all hover:bg-rose-50 active:scale-90"
                type="button"
              >
                <Trash2 size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
