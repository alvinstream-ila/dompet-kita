import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, Plane, Sparkles, Wallet, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
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
import { formatToRupiah } from '@/lib/utils';
import type { Holiday } from '../hooks/useHolidays';
import { useAddHolidayFund } from '../hooks/useHolidayTransactions';

interface AddHolidayFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  holiday: Holiday;
}

const PRESET_AMOUNTS = [250000, 500000, 1000000, 2500000];

export const AddHolidayFundModal: React.FC<AddHolidayFundModalProps> = ({
  isOpen,
  onClose,
  holiday,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('none');
  const [description, setDescription] = useState('');

  const { data: assets = [] } = useAssets();
  const fundMutation = useAddHolidayFund();

  const handlePresetClick = (val: number) => {
    setAmount(formatToRupiah(val.toString()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const numericAmount = Number.parseFloat(amount.replaceAll('.', ''));

    await fundMutation.mutateAsync({
      holidayId: holiday.id.toString(),
      payload: {
        amount: numericAmount,
        asset_id: selectedAssetId === 'none' ? undefined : selectedAssetId,
        description: description || `Dana liburan untuk ${holiday.destination}`,
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
          <div className="relative h-40 bg-linear-to-br from-pink-500 to-rose-600 p-8">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Plane size={120} className="-rotate-12 text-white" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Sparkles className="text-white" size={28} />
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
                Isi Dana Liburan ✨
              </h2>
              <p className="text-sm font-bold tracking-widest text-rose-100 uppercase opacity-80">
                Tujuan: {holiday.destination}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {/* Amount Input */}
            <div className="space-y-3">
              <label
                htmlFor="fund-amount"
                className="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
              >
                Nominal Setoran (Rp)
              </label>
              <div className="relative">
                <div className="absolute top-1/2 left-6 -translate-y-1/2 text-2xl font-black text-slate-300">
                  Rp
                </div>
                <Input
                  autoFocus
                  id="fund-amount"
                  value={amount}
                  onChange={(e) => setAmount(formatToRupiah(e.target.value))}
                  placeholder="0"
                  className="h-20 rounded-[28px] border-none bg-slate-50 pl-16 text-3xl font-black text-slate-800 placeholder:text-slate-200 focus:ring-4 focus:ring-rose-100"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePresetClick(val)}
                    className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[11px] font-black text-slate-500 transition-all hover:border-rose-200 hover:text-rose-600 active:scale-95"
                  >
                    +{formatToRupiah(val.toString())}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Asset Selection */}
            <div className="space-y-3">
              <label
                htmlFor="fund-source"
                className="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
              >
                Sumber Dana (Ambil Dari)
              </label>
              <Select
                value={selectedAssetId}
                onValueChange={setSelectedAssetId}
              >
                <SelectTrigger
                  id="fund-source"
                  className="h-16 rounded-[24px] border-none bg-slate-50 px-6 font-bold text-slate-700 focus:ring-4 focus:ring-rose-100"
                >
                  <SelectValue placeholder="Pilih Sumber" />
                </SelectTrigger>
                <SelectContent className="rounded-[24px] border-none shadow-2xl">
                  <SelectItem
                    value="none"
                    className="py-3 font-bold text-slate-600"
                  >
                    💰 Dana Tunai Baru
                  </SelectItem>
                  {assets.map((asset) => (
                    <SelectItem
                      key={asset.id}
                      value={asset.id}
                      className="py-3"
                    >
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-rose-500" />
                        <span className="font-bold">{asset.name}</span>
                        <span className="text-[10px] opacity-40">
                          ({formatToRupiah(asset.value.toString())})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="px-2 text-center text-[10px] font-bold text-slate-300 italic">
                {selectedAssetId === 'none'
                  ? 'Dana akan dicatat sebagai uang baru khusus liburan.'
                  : 'Saldo aset akan dipindahkan otomatis ke kas liburan ini.'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={fundMutation.isPending}
              className="group h-18 w-full rounded-[28px] bg-linear-to-r from-pink-500 to-rose-600 text-sm font-black tracking-[0.2em] text-white uppercase shadow-2xl shadow-rose-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              {fundMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Konfirmasi Setoran
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
