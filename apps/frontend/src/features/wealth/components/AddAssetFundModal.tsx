import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ArrowRight } from 'lucide-react';
import { useAssetTransactions } from '../hooks/useAssetTransactions';
import type { Asset } from '@/types';

interface AddAssetFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAsset: Asset;
  availableAssets: Asset[];
  formatAmount: (amount: number) => string;
}

export const AddAssetFundModal: React.FC<AddAssetFundModalProps> = ({
  isOpen,
  onClose,
  targetAsset,
  availableAssets,
  formatAmount,
}) => {
  const [amount, setAmount] = useState('');
  const [sourceAssetId, setSourceAssetId] = useState<number | undefined>(
    undefined
  );
  const [description, setDescription] = useState('');
  const { fund, isFunding } = useAssetTransactions(
    targetAsset.id as unknown as number
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number.isNaN(Number(amount))) return;

    await fund({
      amount: Number(amount),
      source_asset_id: sourceAssetId,
      description,
    });

    setAmount('');
    setSourceAssetId(undefined);
    setDescription('');
    onClose();
  };

  // Filter out target asset from sources
  const sourceOptions = availableAssets.filter((a) => a.id !== targetAsset.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl"
          >
            <div className="relative bg-linear-to-br from-blue-600 to-indigo-700 p-6 text-center text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full bg-white/10 p-2 transition-all hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-xl backdrop-blur-md">
                <Plus size={32} />
              </div>

              <h2 className="text-xl font-black tracking-tight uppercase">
                Top Up Aset
              </h2>
              <p className="text-sm font-medium text-blue-100">
                Tambah modal untuk {targetAsset.name}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              {/* Target Indicator */}
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Target:
                </span>
                <span className="text-sm font-black text-slate-700 uppercase">
                  {targetAsset.name}
                </span>
              </div>

              <div>
                <label
                  htmlFor="fund-amount"
                  className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Jumlah Dana (Modal)
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 font-black text-slate-400">
                    Rp
                  </span>
                  <input
                    id="fund-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 pr-4 pl-12 text-xl font-black text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="source-asset"
                  className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Sumber Dana (Opsional)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    id="source-asset"
                    value={sourceAssetId || ''}
                    onChange={(e) =>
                      setSourceAssetId(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition-all outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="">Saldo Luar (Manual)</option>
                    {sourceOptions.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({formatAmount(asset.value)})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 italic">
                  *Jika memilih sumber, saldo aset tersebut akan otomatis
                  terpotong.
                </p>
              </div>

              <div>
                <label
                  htmlFor="fund-description"
                  className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Keterangan
                </label>
                <input
                  id="fund-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Beli emas bulan ini"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition-all outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isFunding || !amount}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 py-4 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {isFunding ? (
                  'Memproses...'
                ) : (
                  <>
                    TAMBAH MODAL SEKARANG
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
