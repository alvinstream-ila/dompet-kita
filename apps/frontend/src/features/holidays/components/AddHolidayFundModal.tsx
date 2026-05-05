import { ArrowRight, Loader2, Plane, Sparkles, Wallet, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-[32px] border-none p-0 shadow-2xl sm:max-w-md"
      >
        <DialogHeader className="relative h-40 overflow-hidden bg-linear-to-br from-pink-500 to-rose-600 p-8 text-white">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Plane size={120} className="-rotate-12 text-white" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Sparkles className="text-white" size={28} />
            </div>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white transition-all hover:bg-white/10 hover:text-white"
              >
                <X size={24} />
              </Button>
            </DialogClose>
          </div>
          <div className="relative z-10 mt-4">
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              Isi Dana Liburan ✨
            </DialogTitle>
            <DialogDescription className="text-sm font-bold tracking-widest text-rose-100 uppercase opacity-80">
              Tujuan: {holiday.destination}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="relative z-20 -mt-6 space-y-6 px-6 pb-8"
        >
          <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-black/5">
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
                  className="h-20 rounded-[24px] border-none bg-slate-50 pl-16 text-3xl font-black text-slate-800 placeholder:text-slate-200 focus:ring-4 focus:ring-rose-100"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePresetClick(val)}
                    className="rounded-xl border border-slate-100 bg-white px-3 py-1.5 text-[10px] font-black text-slate-500 transition-all hover:border-rose-200 hover:text-rose-600 active:scale-95"
                  >
                    +{formatToRupiah(val.toString())}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Asset Selection */}
            <div className="mt-6 space-y-3">
              <label
                htmlFor="fund-source"
                className="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
              >
                Sumber Dana
              </label>
              <Select
                value={selectedAssetId}
                onValueChange={setSelectedAssetId}
              >
                <SelectTrigger
                  id="fund-source"
                  className="h-16 rounded-[20px] border-none bg-slate-50 px-6 font-bold text-slate-700 focus:ring-4 focus:ring-rose-100"
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
              <p className="px-2 text-center text-[9px] font-bold text-slate-300 italic">
                {selectedAssetId === 'none'
                  ? 'Dana akan dicatat sebagai pengeluaran baru khusus liburan.'
                  : 'Saldo aset akan dipindahkan otomatis ke kas liburan ini.'}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={fundMutation.isPending}
            className="group h-16 w-full rounded-[24px] bg-linear-to-r from-pink-500 to-rose-600 text-sm font-black tracking-[0.2em] text-white uppercase shadow-2xl shadow-rose-500/30 transition-all hover:scale-[1.02] active:scale-95"
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
      </DialogContent>
    </Dialog>
  );
};
