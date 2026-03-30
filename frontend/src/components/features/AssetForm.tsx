import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ASSET_TYPES } from '@/lib/constants';
import type { Asset, AssetType } from '@/types';

interface AssetFormProps {
  initialData?: Asset | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: (initialData?.type as AssetType) || 'Tabungan',
    value: initialData?.value.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: Number(formData.value),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          Nama Aset
        </Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Emas Antam, Tabungan, dll"
          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 focus-visible:ring-slate-300"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-left">
          <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Jenis
          </Label>
          <Select
            value={formData.type}
            onValueChange={(val) =>
              setFormData({ ...formData, type: val as AssetType })
            }
          >
            <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              {ASSET_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="font-bold">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 text-left">
          <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Nilai (Rp)
          </Label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700"
            placeholder="0"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="h-14 w-full rounded-2xl bg-slate-900 font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-slate-800 active:scale-[0.98]"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : initialData ? (
          'Perbarui Aset ✨'
        ) : (
          'Simpan Aset ✨'
        )}
      </Button>
    </form>
  );
};
