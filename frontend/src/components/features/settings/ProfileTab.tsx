import React from 'react';
import { User, Users, Heart, CalendarDays, Globe, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  userEmail
}) => {
  return (
    <div className="m-0 space-y-6 animate-in slide-in-from-left-2 duration-300 text-center">
      <div className="flex flex-col items-center gap-4 mb-2">
        <div className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-md overflow-hidden relative bg-slate-100 flex items-center justify-center">
          <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
            {(displayName || userEmail || '?').charAt(0).toUpperCase()}
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Profil</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Panggilan</Label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alvin/Ila"
                className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Lengkap</Label>
            <div className="relative group">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Lengkap"
                className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Pasangan</Label>
            <div className="relative group">
              <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              <Input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Nama Sayang"
                className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Hari Spesial</Label>
            <div className="relative group">
              <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <Input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Wilayah Waktu (Zona Waktu)</Label>
          <div className="relative group">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 pr-4 font-bold text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Asia/Jakarta">WIB (Jakarta/Sumatera/Jawa)</option>
              <option value="Asia/Makassar">WITA (Bali/Kalimantan/Sulawesi)</option>
              <option value="Asia/Jayapura">WIT (Maluku/Papua)</option>
              <option value="UTC">UTC (Universal Time)</option>
            </select>
          </div>
        </div>

        <Button disabled={loading} className="w-full h-12 bg-slate-900 hover:bg-black rounded-2xl font-black text-[11px] tracking-widest uppercase shadow-md text-white mt-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "SIMPAN PERUBAHAN PROFIL"}
        </Button>
      </form>
    </div>
  );
};
