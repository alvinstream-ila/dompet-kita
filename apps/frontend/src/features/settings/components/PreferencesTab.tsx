import {
  CalendarDays,
  Coins,
  EyeOff,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import type React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SovereignCurrencyPicker } from './SovereignCurrencyPicker';

interface UserSettings {
  monthlyBudgetLimit: number;
  budgetCycleStart: number;
  isPrivacyMode: boolean;
  currencyFormat: string;
  exchangeRate?: number;
}

interface PreferencesTabProps {
  monthlyBudgetLimit: number;
  budgetCycleStart: number;
  isPrivacyMode: boolean;
  currencyFormat: string;
  exchangeRate?: number;
  updateSettings: (settings: Partial<UserSettings>) => void;
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
          <div className="bg-green-stat/20 text-green-stat flex h-8 w-8 items-center justify-center rounded-lg">
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
              const val = e.target.value.replaceAll(/\D/g, '');
              updateSettings({ monthlyBudgetLimit: Number(val) || 0 });
            }}
            className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm font-bold"
          />
          {monthlyBudgetLimit > 0 && (
            <p className="text-green-stat mt-2 px-1 text-[9px] font-black tracking-tight uppercase italic">
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
          <div className="bg-blue-royal/20 text-blue-royal flex h-8 w-8 items-center justify-center rounded-lg">
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
            updateSettings({
              budgetCycleStart: Number.parseInt(e.target.value, 10),
            })
          }
          className="focus:ring-blue-royal/20 h-10 w-full rounded-xl border-slate-200 bg-white px-3 text-sm font-bold focus:ring-2 focus:outline-none"
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
          <div className="bg-pink-primary/20 text-pink-primary flex h-8 w-8 items-center justify-center rounded-lg">
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
            <div className="bg-yellow-outlook/20 text-yellow-outlook flex h-8 w-8 items-center justify-center rounded-lg">
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
          <SovereignCurrencyPicker
            value={currencyFormat}
            onValueChange={(value) => updateSettings({ currencyFormat: value })}
          />
        </div>

        {currencyFormat !== 'IDR' && exchangeRate && (
          <div className="relative overflow-hidden rounded-xl border border-amber-50 bg-amber-50/30 p-3 shadow-inner shadow-amber-200/20">
            <div className="absolute top-0 right-0 p-1 opacity-20">
              <Coins className="size-8 text-amber-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black tracking-widest text-amber-600/60 uppercase italic">
                Sovereign Exchange Node 🌐
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-slate-800">
                  1 {currencyFormat}
                </span>
                <span className="text-[10px] font-bold text-slate-400">=</span>
                <span className="text-yellow-outlook text-sm font-black">
                  {new Intl.NumberFormat('id-ID', {
                    maximumFractionDigits: 2,
                  }).format(1 / exchangeRate)}
                </span>
                <span className="text-[10px] font-black text-slate-800">
                  IDR
                </span>
              </div>
              <p className="text-[8px] font-bold text-slate-400">
                Data diperbarui secara realtime untuk akurasi maksimal.
              </p>
            </div>
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
