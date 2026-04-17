import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarDays, Globe, Heart, Loader2, User, Users } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ProfileTabProps {
  readonly displayName: string;
  readonly setDisplayName: (val: string) => void;
  readonly fullName: string;
  readonly setFullName: (val: string) => void;
  readonly partnerName: string;
  readonly setPartnerName: (val: string) => void;
  readonly anniversaryDate: string;
  readonly setAnniversaryDate: (val: string) => void;
  readonly timezone: string;
  readonly setTimezone: (val: string) => void;
  readonly loading: boolean;
  readonly onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  readonly userEmail?: string;
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
          <div className="from-blue-royal to-blue-royal/80 flex h-full w-full items-center justify-center bg-linear-to-br text-3xl font-black text-white">
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
            <Label
              htmlFor="profile-display-name"
              className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
            >
              Nama Panggilan
            </Label>
            <div className="group relative">
              <User className="group-focus-within:text-blue-royal absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors" />
              <Input
                id="profile-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alvin/Ila"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="profile-full-name"
              className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
            >
              Nama Lengkap
            </Label>
            <div className="group relative">
              <Users className="group-focus-within:text-blue-royal absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors" />
              <Input
                id="profile-full-name"
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
            <Label
              htmlFor="profile-partner-name"
              className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
            >
              Nama Pasangan
            </Label>
            <div className="group relative">
              <Heart className="group-focus-within:text-pink-primary absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors" />
              <Input
                id="profile-partner-name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Nama Sayang"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="profile-anniversary-date"
              className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
            >
              Hari Spesial
            </Label>
            <div className="group relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="profile-anniversary-date"
                    variant="outline"
                    className={cn(
                      'h-11 w-full justify-start rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold hover:bg-slate-100',
                      !anniversaryDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarDays className="group-focus-within:text-red-stat absolute left-4 h-4 w-4 -translate-y-px text-slate-400 transition-colors" />
                    {anniversaryDate ? (
                      format(new Date(anniversaryDate), 'd MMMM yyyy', {
                        locale: id,
                      })
                    ) : (
                      <span>Pilih Tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-none p-0 shadow-2xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={
                      anniversaryDate ? new Date(anniversaryDate) : undefined
                    }
                    onSelect={(d) =>
                      d && setAnniversaryDate(format(d, 'yyyy-MM-dd'))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <Label
            htmlFor="profile-timezone"
            className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
          >
            Wilayah Waktu (Zona Waktu)
          </Label>
          <div className="group relative">
            <Globe className="group-focus-within:text-blue-royal absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors" />
            <select
              id="profile-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="focus:ring-blue-royal/20 h-11 w-full appearance-none rounded-xl border-slate-200 bg-slate-50 pr-4 pl-11 text-sm font-bold focus:ring-2 focus:outline-none"
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
