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
    description: 'Bursa Saham & IDX',
  },
  {
    type: 'crypto',
    label: 'Kripto',
    description: 'Bitcoin & Altcoin',
  },
  {
    type: 'commodity',
    label: 'Emas',
    description: 'Logam Mulia & Fisik',
  },
  {
    type: 'cash',
    label: 'Tabungan',
    description: 'Tunai & Saldo Bank',
  },
  {
    type: 'mutual_fund',
    label: 'Reksadana',
    description: 'Portofolio Kolektif',
  },
  {
    type: 'obligasi',
    label: 'Obligasi',
    description: 'SBN & Korporasi',
  },
];

interface AssetTypeSelectorProps {
  onSelect: (type: AssetType) => void;
}

export const AssetTypeSelector: React.FC<AssetTypeSelectorProps> = ({
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {CATEGORIES.map((cat, index) => (
        <motion.button
          key={cat.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(cat.type)}
          className="group relative flex h-full min-h-[110px] items-start gap-2 overflow-hidden rounded-[24px] border border-slate-100 bg-white p-3 text-left transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.98] sm:min-h-[120px] sm:gap-4 sm:rounded-[32px] sm:p-5"
        >
          <div className="size-10 shrink-0 sm:size-14">
            <PremiumAssetIcon
              type={cat.type}
              className="h-full w-full rounded-[14px] sm:rounded-[20px]"
            />
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <h4 className="text-[12px] leading-tight font-black tracking-tight text-slate-800 transition-colors group-hover:text-blue-600 sm:text-sm">
              {cat.label}
            </h4>
            <p className="text-[9px] leading-tight font-medium text-slate-400 sm:text-[10px]">
              {cat.description}
            </p>
          </div>

          <div className="absolute top-0 right-0 h-full w-1.5 bg-linear-to-b from-blue-500/0 via-blue-500/0 to-blue-500/0 transition-all group-hover:from-blue-500/40 group-hover:via-blue-500/10 group-hover:to-blue-500/0" />
        </motion.button>
      ))}
    </div>
  );
};
