import React from 'react';
import { motion } from 'framer-motion';
import { PremiumAssetIcon } from './PremiumAssetIcon';
import type { AssetType } from '@/types';

interface AssetCategory {
  type: AssetType;
  label: string;
  description: string;
}

const CATEGORIES: AssetCategory[] = [
  {
    type: 'stock',
    label: 'Saham',
    description: 'Investasi di pasar modal IDX & luar negeri',
  },
  {
    type: 'crypto',
    label: 'Kripto',
    description: 'Aset digital Bitcoin, Ethereum, dan lainnya',
  },
  {
    type: 'commodity',
    label: 'Logam Mulia',
    description: 'Emas Antam, Perak, dan komoditas fisik',
  },
  {
    type: 'cash',
    label: 'Tabungan/Cash',
    description: 'Uang tunai, deposito, atau saldo bank',
  },
  {
    type: 'mutual_fund',
    label: 'Reksadana',
    description: 'Portofolio kolektif saham & obligasi',
  },
  {
    type: 'obligasi',
    label: 'Obligasi',
    description: 'Surat berharga negara (SBN) atau korporasi',
  },
];

interface AssetTypeSelectorProps {
  onSelect: (type: AssetType) => void;
}

export const AssetTypeSelector: React.FC<AssetTypeSelectorProps> = ({
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {CATEGORIES.map((cat, index) => (
        <motion.button
          key={cat.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(cat.type)}
          className="group relative flex items-center gap-4 overflow-hidden rounded-[32px] border-2 border-slate-50 bg-white p-5 text-left transition-all hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-[0.98]"
        >
          <div className="size-16 shrink-0">
            <PremiumAssetIcon
              type={cat.type}
              className="h-full w-full rounded-[20px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-black tracking-tight text-slate-800 transition-colors group-hover:text-blue-600">
              {cat.label}
            </h4>
            <p className="text-[10px] leading-tight font-medium text-slate-400">
              {cat.description}
            </p>
          </div>

          <div className="absolute top-0 right-0 h-full w-2 bg-linear-to-b from-blue-500/0 via-blue-500/0 to-blue-500/0 transition-all group-hover:from-blue-500/40 group-hover:via-blue-500/10 group-hover:to-blue-500/0" />
        </motion.button>
      ))}
    </div>
  );
};
