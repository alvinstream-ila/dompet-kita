import React from 'react';
import { User, Users, Heart, CalendarDays, Globe, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProfileTabProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  partnerName: string;
  setPartnerName: (val: string) => void;
  anniversaryDate: string;
  setAnniversaryDate: (val: string) => void;
  timezone: string;
  setTimezone: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  userEmail?: string;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  displayName,
  setDisplayName,
  fullName,
  setFullName,
  partnerName,
  setPartnerName,
  anniversaryDate,
  setAnniversaryDate,
  timezone,
  setTimezone,
  loading,
  onSubmit,
  userEmail,
}) => {
  return (
    <div className="animate-in slide-in-from-left-2 m-0 space-y-6 text-center duration-300">
      <div className="mb-2 flex flex-col items-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-md">
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600 text-3xl font-black text-white">
            {(displayName || userEmail || '?').charAt(0).toUpperCase()}
          </div>
        </div>
        <p className="text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
          Profil
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <Label className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase">
              Nama Panggilan
            </Label>
            <div className="group relative">
              <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" />
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alvin/Ila"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase">
              Nama Lengkap
            </Label>
            <div className="group relative">
              <Users className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Lengkap"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <Label className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase">
              Nama Pasangan
            </Label>
            <div className="group relative">
              <Heart className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-pink-500" />
              <Input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Nama Sayang"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase">
              Hari Spesial
            </Label>
            <div className="group relative">
              <CalendarDays className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
              <Input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <Label className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase">
            Wilayah Waktu (Zona Waktu)
          </Label>
          <div className="group relative">
            <Globe className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" />
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border-slate-200 bg-slate-50 pr-4 pl-11 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="Asia/Jakarta">WIB (Jakarta/Sumatera/Jawa)</option>
              <option value="Asia/Makassar">
                WITA (Bali/Kalimantan/Sulawesi)
              </option>
              <option value="Asia/Jayapura">WIT (Maluku/Papua)</option>
              <option value="UTC">UTC (Universal Time)</option>
            </select>
          </div>
        </div>

        <Button
          disabled={loading}
          className="mt-2 h-12 w-full rounded-2xl bg-slate-900 text-[11px] font-black tracking-widest text-white uppercase shadow-md hover:bg-black"
        >
          {loading ? (
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          ) : (
            'SIMPAN PERUBAHAN PROFIL'
          )}
        </Button>
      </form>
    </div>
  );
};
