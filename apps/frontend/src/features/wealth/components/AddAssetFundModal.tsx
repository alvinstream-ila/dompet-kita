import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Plus, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { Asset } from '@/types';
import { useAssetTransactions } from '../hooks/useAssetTransactions';

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

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount.replaceAll(/\D/g, ''));
    if (!numericAmount || Number.isNaN(numericAmount)) return;

    await fund({
      amount: numericAmount,
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
            <div className="from-blue-royal relative bg-linear-to-br to-indigo-700 p-6 text-center text-white">
              <button
                type="button"
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
              <p className="text-blue-royal/30 text-sm font-medium brightness-200">
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
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value.replaceAll(/\D/g, '');
                      if (val === '') {
                        setAmount('');
                        return;
                      }
                      setAmount(
                        new Intl.NumberFormat('id-ID').format(Number(val))
                      );
                    }}
                    placeholder="0"
                    className="focus:border-blue-royal w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 pr-4 pl-12 text-xl font-black text-slate-900 transition-all outline-none focus:bg-white"
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
                    className="focus:border-blue-royal w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white"
                  >
                    <option value="">Uang Utama (Dashboard)</option>
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
                  className="focus:border-blue-royal w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isFunding || !amount}
                className="group from-blue-royal hover:shadow-blue-royal/20 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r to-indigo-700 py-4 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
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
