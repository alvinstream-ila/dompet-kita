import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/WealthCheckbox';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetTypeSelector } from './AssetTypeSelector';
import { PremiumAssetIcon } from './PremiumAssetIcon';
import type { Asset, AssetType } from '@/types';

interface AssetFormProps {
  initialData?: Asset | null;
  onSubmit: (data: Partial<Asset>) => void;
  isLoading?: boolean;
}

type FormStep = 'SELECT_TYPE' | 'INPUT_DETAILS';

/**
 * Local helper for Type Badge display
 */
const AssetTypeBadge: React.FC<{ type: AssetType }> = ({ type }) => (
  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2">
    <PremiumAssetIcon type={type} className="size-6" />
    <span className="text-[10px] font-black tracking-widest text-slate-600 uppercase">
      {type}
    </span>
  </div>
);

/**
 * Local helper for Market Sync section
 */
const MarketSyncSection: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  type: AssetType;
}> = ({ checked, onChange, type }) => {
  if (!['stock', 'crypto', 'commodity'].includes(type)) return null;

  return (
    <div className="flex items-center space-x-3 rounded-2xl border border-blue-50 bg-blue-50/30 p-4">
      <Checkbox id="sync" checked={checked} onCheckedChange={onChange} />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="sync"
          className="cursor-pointer text-[10px] font-black tracking-tight text-blue-700 uppercase"
        >
          Sync Realtime Market
        </label>
        <p className="text-[9px] font-bold text-blue-500/80">
          Otomatis update harga sesuai pasar dunia ✨
        </p>
      </div>
      <Info className="ml-auto size-4 text-blue-300" />
    </div>
  );
};

export const AssetForm: React.FC<AssetFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [step, setStep] = useState<FormStep>(
    initialData ? 'INPUT_DETAILS' : 'SELECT_TYPE'
  );
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || ('cash' as AssetType),
    value: initialData?.value?.toString() ?? '',
    quantity: initialData?.quantity?.toString() ?? '1',
    unit: initialData?.unit || '',
    is_market_synced: initialData?.is_market_synced ?? false,
    invested_capital: initialData?.invested_capital?.toString() ?? '',
  });

  const [stockLots, setStockLots] = useState(
    initialData?.type === 'stock'
      ? (initialData.quantity / 100).toString()
      : '1'
  );

  // Sync effect for specialized asset logic
  useEffect(() => {
    if (formData.type === 'stock') {
      const qty = Number.parseFloat(stockLots) * 100;
      setFormData((prev) => ({
        ...prev,
        quantity: qty.toString(),
        unit: 'SHARES',
      }));
    } else if (formData.type === 'commodity') {
      setFormData((prev) => ({ ...prev, unit: 'GRAM' }));
    }
  }, [stockLots, formData.type]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: Number(formData.value) || 0,
      quantity: Number(formData.quantity) || 1,
      invested_capital:
        Number(formData.invested_capital) || Number(formData.value) || 0,
    });
  };

  const handleTypeSelect = (type: AssetType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      is_market_synced: ['stock', 'crypto', 'commodity'].includes(type),
    }));
    setStep('INPUT_DETAILS');
  };

  const getSubmitLabel = () => {
    if (isLoading) return <Loader2 className="animate-spin" />;
    return initialData ? 'Perbarui Aset ✨' : 'Simpan Aset ✨';
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'SELECT_TYPE' ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="mb-6">
              <h3 className="text-lg font-black tracking-tight text-slate-800">
                Pilih Kategori Aset
              </h3>
              <p className="text-xs font-bold text-slate-400">
                Apa yang ingin Anda tambahkan hari ini, Sayang?
              </p>
            </div>
            <AssetTypeSelector onSelect={handleTypeSelect} />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => !initialData && setStep('SELECT_TYPE')}
                className="h-10 rounded-xl px-2 text-slate-400 hover:bg-slate-50"
                disabled={!!initialData}
              >
                <ArrowLeft className="mr-2 size-4" />
                <span className="text-[10px] font-black uppercase">
                  Ganti Tipe
                </span>
              </Button>
              <AssetTypeBadge type={formData.type} />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  {['stock', 'crypto'].includes(formData.type)
                    ? 'Ticker / Simbol'
                    : 'Nama Aset'}
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder={
                    formData.type === 'stock'
                      ? 'BBCA.JK, TLKM.JK, dll'
                      : 'Emas Antam, Tabungan, dll'
                  }
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus-visible:ring-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    {(() => {
                      if (formData.type === 'stock') return 'Jumlah (Lot)';
                      if (formData.type === 'commodity') return 'Berat (Gram)';
                      return 'Kuantitas';
                    })()}
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={
                      formData.type === 'stock' ? stockLots : formData.quantity
                    }
                    onChange={(e) =>
                      formData.type === 'stock'
                        ? setStockLots(e.target.value)
                        : setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="0"
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Nilai Per Unit (IDR)
                  </Label>
                  <Input
                    type="number"
                    value={formData.invested_capital}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invested_capital: e.target.value,
                        value: e.target.value,
                      })
                    }
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700"
                    placeholder="Harga beli"
                    required
                  />
                </div>
              </div>

              <MarketSyncSection
                type={formData.type}
                checked={formData.is_market_synced}
                onChange={(checked) =>
                  setFormData({ ...formData, is_market_synced: checked })
                }
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-slate-900 font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              {getSubmitLabel()}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
