import React, { useState } from 'react';
import {
  X,
  Wallet,
  ArrowRight,
  Loader2,
  Sparkles,
  PiggyBank,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssets } from '@/features/wealth/hooks/useAssets';
import { useAddGoalDeposit } from '../hooks/useGoalTransactions';
import { formatToRupiah } from '@/lib/utils';
import type { Goal } from '@/types';

interface AddGoalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
}

const PRESET_AMOUNTS = [100000, 500000, 1000000, 5000000];

export const AddGoalDepositModal: React.FC<AddGoalDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('none');
  const [description, setDescription] = useState('');

  const { data: assets = [] } = useAssets();
  const depositMutation = useAddGoalDeposit();

  const handlePresetClick = (val: number) => {
    setAmount(formatToRupiah(val.toString()));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amount) return;

    const numericAmount = Number.parseFloat(amount.replaceAll('.', ''));

    await depositMutation.mutateAsync({
      goalId: goal.id,
      payload: {
        amount: numericAmount,
        asset_id: selectedAssetId === 'none' ? undefined : selectedAssetId,
        description: description || `Menabung untuk ${goal.name}`,
        date: new Date().toISOString(),
      },
    });

    onClose();
    setAmount('');
    setSelectedAssetId('none');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[48px] border border-white/20 bg-white shadow-2xl"
        >
          {/* Decorative Header */}
          <div className="relative h-40 bg-linear-to-br from-blue-600 to-indigo-700 p-8">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Sparkles size={120} className="text-white" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <PiggyBank className="text-white" size={28} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full text-white hover:bg-white/10"
              >
                <X size={24} />
              </Button>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Tambah Tabungan ✨
              </h2>
              <p className="text-sm font-bold tracking-widest text-blue-100 uppercase opacity-80">
                Untuk: {goal.name}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {/* Amount Input */}
            <div className="space-y-3">
              <label
                htmlFor="deposit-amount"
                className="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
              >
                Jumlah Tabungan (Rp)
              </label>
              <div className="relative">
                <div className="absolute top-1/2 left-6 -translate-y-1/2 text-2xl font-black text-slate-300">
                  Rp
                </div>
                <Input
                  id="deposit-amount"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(formatToRupiah(e.target.value))}
                  placeholder="0"
                  className="h-20 rounded-[28px] border-none bg-slate-50 pl-16 text-3xl font-black text-slate-800 placeholder:text-slate-200 focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePresetClick(val)}
                    className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[11px] font-black text-slate-500 transition-all hover:border-blue-200 hover:text-blue-600 active:scale-95"
                  >
                    +{formatToRupiah(val.toString())}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Asset Selection */}
            <div className="space-y-3">
              <label
                htmlFor="source-asset"
                className="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
              >
                Sumber Dana (Opsional)
              </label>
              <Select
                value={selectedAssetId}
                onValueChange={setSelectedAssetId}
              >
                <SelectTrigger
                  id="source-asset"
                  className="h-16 rounded-[24px] border-none bg-slate-50 px-6 font-bold text-slate-700 focus:ring-4 focus:ring-blue-100"
                >
                  <SelectValue placeholder="Pilih Sumber" />
                </SelectTrigger>
                <SelectContent className="rounded-[24px] border-none shadow-2xl">
                  <SelectItem value="none" className="py-3 font-bold">
                    💰 Dana Eksternal / Baru
                  </SelectItem>
                  {assets.map((asset) => (
                    <SelectItem
                      key={asset.id}
                      value={asset.id}
                      className="py-3"
                    >
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-blue-500" />
                        <span className="font-bold">{asset.name}</span>
                        <span className="text-[10px] opacity-40">
                          ({formatToRupiah(asset.value.toString())})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="px-2 text-[10px] font-bold text-slate-300 italic">
                {selectedAssetId === 'none'
                  ? 'Dana akan dicatat sebagai tabungan baru tanpa mengurangi aset yang ada.'
                  : 'Saldo aset yang dipilih akan otomatis berkurang untuk dialokasikan ke mimpi ini.'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={depositMutation.isPending}
              className="group h-18 w-full rounded-[28px] bg-linear-to-r from-blue-600 to-indigo-600 text-sm font-black tracking-[0.2em] text-white uppercase shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              {depositMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Catat Tabungan
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
