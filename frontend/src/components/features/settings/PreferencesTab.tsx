import React from 'react';
import { ShieldCheck, CalendarDays, EyeOff, Coins, Settings2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  updateSettings
}) => {
  return (
    <div className="m-0 space-y-6 animate-in slide-in-from-right-2 duration-300">
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Limit Budget Bulanan</span>
            <span className="text-[11px] font-bold text-slate-500">Batas jajan bulanan kalian berdua</span>
          </div>
        </div>
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
          <Input
            type="text"
            value={new Intl.NumberFormat('id-ID').format(monthlyBudgetLimit)}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              updateSettings({ monthlyBudgetLimit: Number(val) || 0 });
            }}
            className="h-10 bg-white border-slate-200 rounded-xl pl-9 font-bold text-sm"
          />
          {monthlyBudgetLimit > 0 && (
            <p className="text-[9px] font-black text-emerald-500 mt-2 uppercase tracking-tight italic px-1">
              {new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'long' }).format(monthlyBudgetLimit)} rupiah ✨
            </p>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Siklus Anggaran</span>
            <span className="text-[11px] font-bold text-slate-500">Kapan bulan finansialmu dimulai?</span>
          </div>
        </div>
        <select
          value={budgetCycleStart}
          onChange={(e) => updateSettings({ budgetCycleStart: parseInt(e.target.value) })}
          className="w-full h-10 bg-white border-slate-200 rounded-xl px-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
            <option key={day} value={day}>Tanggal {day}</option>
          ))}
        </select>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
            <EyeOff className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Mode Privasi</span>
            <span className="text-[11px] font-bold text-slate-500">Sembunyikan saldo</span>
          </div>
        </div>
        <Switch checked={isPrivacyMode} onCheckedChange={(checked) => updateSettings({ isPrivacyMode: checked })} />
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Mata Uang Global</span>
              <span className="text-[11px] font-bold text-slate-500">Pilih mata uang favorit kalian</span>
            </div>
          </div>
          <Select 
             value={currencyFormat}
             onValueChange={(value) => updateSettings({ currencyFormat: value })}
           >
             <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200 rounded-lg text-[11px] font-black focus:ring-amber-500/20">
               <SelectValue placeholder="Pilih Mata Uang" />
             </SelectTrigger>
             <SelectContent className="rounded-xl border-slate-100 shadow-xl shadow-slate-200/50">
               <SelectItem value="IDR" className="text-[11px] font-bold py-2 focus:bg-amber-50">IDR - Rupiah 🇮🇩</SelectItem>
               <SelectItem value="USD" className="text-[11px] font-bold py-2 focus:bg-amber-50">USD - Dollar 🇺🇸</SelectItem>
               <SelectItem value="EUR" className="text-[11px] font-bold py-2 focus:bg-amber-50">EUR - Euro 🇪🇺</SelectItem>
               <SelectItem value="JPY" className="text-[11px] font-bold py-2 focus:bg-amber-50">JPY - Yen 🇯🇵</SelectItem>
               <SelectItem value="SGD" className="text-[11px] font-bold py-2 focus:bg-amber-50">SGD - Dollar 🇸🇬</SelectItem>
               <SelectItem value="MYR" className="text-[11px] font-bold py-2 focus:bg-amber-50">MYR - Ringgit 🇲🇾</SelectItem>
               <SelectItem value="SAR" className="text-[11px] font-bold py-2 focus:bg-amber-50">SAR - Riyal 🇸🇦</SelectItem>
               <SelectItem value="GBP" className="text-[11px] font-bold py-2 focus:bg-amber-50">GBP - Pound 🇬🇧</SelectItem>
               <SelectItem value="AUD" className="text-[11px] font-bold py-2 focus:bg-amber-50">AUD - Dollar 🇦🇺</SelectItem>
               <SelectItem value="KRW" className="text-[11px] font-bold py-2 focus:bg-amber-50">KRW - Won 🇰🇷</SelectItem>
             </SelectContent>
           </Select>
        </div>
        
        {(currencyFormat !== 'IDR' && exchangeRate) && (
           <div className="bg-white/50 rounded-xl p-2.5 border border-amber-50 flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Kurs Realtime (vs IDR)</span>
              <span className="text-[10px] font-black text-amber-600">
                1 {currencyFormat} = {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(1 / exchangeRate)} IDR
              </span>
           </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-dashed border-slate-200 flex gap-3">
        <Settings2 className="w-4 h-4 text-slate-300 mt-0.5" />
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
          PENGATURAN INI AKAN DI-SYNC SECARA OTOMATIS KE SEMUA PERANGKAT KALIAN BERDUA, SAYANG! ✨
        </p>
      </div>
    </div>
  );
};
