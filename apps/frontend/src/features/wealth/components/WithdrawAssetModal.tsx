import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { Asset } from '@/types';
import { useAssetTransactions } from '../hooks/useAssetTransactions';

interface WithdrawAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  availableAssets: Asset[];
  formatAmount: (amount: number) => string;
}

export const WithdrawAssetModal: React.FC<WithdrawAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  availableAssets,
  formatAmount,
}) => {
  const [amount, setAmount] = useState('');
  const [recipientAssetId, setRecipientAssetId] = useState<number | undefined>(
    undefined
  );
  const [description, setDescription] = useState('');
  const { withdraw, isWithdrawing } = useAssetTransactions(
    asset.id as unknown as number
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number.isNaN(Number(amount))) return;

    await withdraw({
      amount: Number(amount),
      recipient_asset_id: recipientAssetId,
      description,
    });

    setAmount('');
    setRecipientAssetId(undefined);
    setDescription('');
    onClose();
  };

  // Filter out the asset itself from recipients
  const recipientOptions = availableAssets.filter((a) => a.id !== asset.id);

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
            <div className="relative bg-linear-to-br from-rose-600 to-pink-700 p-6 text-center text-white">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full bg-white/10 p-2 transition-all hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-xl backdrop-blur-md">
                <Minus size={32} />
              </div>

              <h2 className="text-xl font-black tracking-tight uppercase">
                Cairkan Aset
              </h2>
              <p className="text-sm font-medium text-rose-100">
                Tarik saldo dari {asset.name}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              {/* Info Indicator */}
              <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <span className="text-left text-[10px] font-black tracking-widest text-rose-400 uppercase">
                  Saldo Saat Ini:
                </span>
                <span className="text-sm font-black text-rose-700 uppercase">
                  {formatAmount(asset.value)}
                </span>
              </div>

              <div>
                <label
                  htmlFor="withdraw-amount"
                  className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Jumlah Cairkan
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 font-black text-slate-400">
                    Rp
                  </span>
                  <input
                    id="withdraw-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    max={asset.value}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 pr-4 pl-12 text-xl font-black text-slate-900 transition-all outline-none focus:border-rose-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="recipient-asset"
                  className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Pindahkan Ke (Opsional)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    id="recipient-asset"
                    value={recipientAssetId || ''}
                    onChange={(e) =>
                      setRecipientAssetId(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition-all outline-none focus:border-rose-500 focus:bg-white"
                  >
                    <option value="">Saldo Luar (Keluar Sistem)</option>
                    {recipientOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({formatAmount(opt.value)})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 italic">
                  *Jika memilih penerima, saldo aset tersebut akan otomatis
                  bertambah.
                </p>
              </div>

              <div>
                <label
                  htmlFor="withdraw-description"
                  className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
                >
                  Keterangan
                </label>
                <input
                  id="withdraw-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Ambil profit emas"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition-all outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={
                  isWithdrawing || !amount || Number(amount) > asset.value
                }
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-rose-600 to-pink-700 py-4 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-rose-200 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {isWithdrawing ? (
                  'Memproses...'
                ) : (
                  <>
                    CAIRKAN SEKARANG
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
