import React from 'react';
import {
  ShieldCheck,
  CalendarDays,
  EyeOff,
  Coins,
  Settings2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PreferencesTabProps {
  monthlyBudgetLimit: number;
  budgetCycleStart: number;
  isPrivacyMode: boolean;
  currencyFormat: string;
  exchangeRate?: number;
  updateSettings: (settings: any) => void;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  monthlyBudgetLimit,
  budgetCycleStart,
  isPrivacyMode,
  currencyFormat,
  exchangeRate,
  updateSettings,
}) => {
  return (
    <div className="animate-in slide-in-from-right-2 m-0 space-y-6 duration-300">
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] leading-tight font-black tracking-wider text-slate-800 uppercase">
              Limit Budget Bulanan
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Batas jajan bulanan kalian berdua
            </span>
          </div>
        </div>
        <div className="group relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-black text-slate-400">
            Rp
          </span>
          <Input
            type="text"
            value={new Intl.NumberFormat('id-ID').format(monthlyBudgetLimit)}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              updateSettings({ monthlyBudgetLimit: Number(val) || 0 });
            }}
            className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm font-bold"
          />
          {monthlyBudgetLimit > 0 && (
            <p className="mt-2 px-1 text-[9px] font-black tracking-tight text-emerald-500 uppercase italic">
              {new Intl.NumberFormat('id-ID', {
                notation: 'compact',
                compactDisplay: 'long',
              }).format(monthlyBudgetLimit)}{' '}
              rupiah ✨
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] leading-tight font-black tracking-wider text-slate-800 uppercase">
              Siklus Anggaran
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Kapan bulan finansialmu dimulai?
            </span>
          </div>
        </div>
        <select
          value={budgetCycleStart}
          onChange={(e) =>
            updateSettings({ budgetCycleStart: parseInt(e.target.value) })
          }
          className="h-10 w-full rounded-xl border-slate-200 bg-white px-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <option key={day} value={day}>
              Tanggal {day}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
            <EyeOff className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] leading-tight font-black tracking-wider text-slate-800 uppercase">
              Mode Privasi
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Sembunyikan saldo
            </span>
          </div>
        </div>
        <Switch
          checked={isPrivacyMode}
          onCheckedChange={(checked) =>
            updateSettings({ isPrivacyMode: checked })
          }
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Coins className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] leading-tight font-black tracking-wider text-slate-800 uppercase">
                Mata Uang Global
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Pilih mata uang favorit kalian
              </span>
            </div>
          </div>
          <Select
            value={currencyFormat}
            onValueChange={(value) => updateSettings({ currencyFormat: value })}
          >
            <SelectTrigger className="h-9 w-[140px] rounded-lg border-slate-200 bg-white text-[11px] font-black focus:ring-amber-500/20">
              <SelectValue placeholder="Pilih Mata Uang" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl shadow-slate-200/50">
              <SelectItem
                value="IDR"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                IDR - Rupiah 🇮🇩
              </SelectItem>
              <SelectItem
                value="USD"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                USD - Dollar 🇺🇸
              </SelectItem>
              <SelectItem
                value="EUR"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                EUR - Euro 🇪🇺
              </SelectItem>
              <SelectItem
                value="JPY"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                JPY - Yen 🇯🇵
              </SelectItem>
              <SelectItem
                value="SGD"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                SGD - Dollar 🇸🇬
              </SelectItem>
              <SelectItem
                value="MYR"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                MYR - Ringgit 🇲🇾
              </SelectItem>
              <SelectItem
                value="SAR"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                SAR - Riyal 🇸🇦
              </SelectItem>
              <SelectItem
                value="GBP"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                GBP - Pound 🇬🇧
              </SelectItem>
              <SelectItem
                value="AUD"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                AUD - Dollar 🇦🇺
              </SelectItem>
              <SelectItem
                value="KRW"
                className="py-2 text-[11px] font-bold focus:bg-amber-50"
              >
                KRW - Won 🇰🇷
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currencyFormat !== 'IDR' && exchangeRate && (
          <div className="flex items-center justify-between rounded-xl border border-amber-50 bg-white/50 p-2.5">
            <span className="text-[9px] font-bold tracking-tight text-slate-400 uppercase">
              Kurs Realtime (vs IDR)
            </span>
            <span className="text-[10px] font-black text-amber-600">
              1 {currencyFormat} ={' '}
              {new Intl.NumberFormat('id-ID', {
                maximumFractionDigits: 2,
              }).format(1 / exchangeRate)}{' '}
              IDR
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3 rounded-2xl border border-dashed border-slate-200 p-4">
        <Settings2 className="mt-0.5 h-4 w-4 text-slate-300" />
        <p className="text-[10px] leading-relaxed font-bold tracking-tight text-slate-400 uppercase">
          PENGATURAN INI AKAN DI-SYNC SECARA OTOMATIS KE SEMUA PERANGKAT KALIAN
          BERDUA, SAYANG! ✨
        </p>
      </div>
    </div>
  );
};
