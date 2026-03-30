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
  Trash2 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
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
      case 'Emas': return <Gem className="size-5 text-amber-500" />;
      case 'Saham': return <TrendingUp className="size-5 text-blue-500" />;
      case 'Tabungan': return <Landmark className="size-5 text-emerald-500" />;
      case 'Kripto': return <Bitcoin className="size-5 text-orange-500" />;
      case 'Properti': return <Home className="size-5 text-indigo-500" />;
      default: return <Coins className="size-5 text-slate-500" />;
    }
};

export const WealthAssetCard: React.FC<WealthAssetCardProps> = ({
  asset,
  index,
  onEdit,
  onDelete,
  formatAmount
}) => {
  return (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        layout
    >
        <Card className="rounded-[28px] border-none shadow-md hover:shadow-xl transition-all group bg-white overflow-hidden border border-white/50">
            <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100 shadow-inner group-hover:shadow-md">
                    {getAssetIcon(asset.type)}
                </div>
                <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase leading-tight tracking-tight group-hover:text-blue-600 transition-colors">{asset.name}</h4>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mt-0.5">{asset.type}</p>
                </div>
                </div>
                <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-black text-slate-900 tracking-tight">{formatAmount(asset.value)}</p>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Current Value</p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => onEdit(asset)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-xl transition-all active:scale-90" type="button">
                        <Edit2 size={13} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => onDelete(asset.id)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all active:scale-90" type="button">
                        <Trash2 size={13} strokeWidth={2.5} />
                    </button>
                </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
  );
};
