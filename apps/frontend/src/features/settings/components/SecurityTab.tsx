import {
  Fingerprint,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SecurityTabProps {
  userEmail?: string;
  loading: boolean;
  onSendResetLink: () => void;
  onLogout: () => void;
  twoFactorEnabled: boolean;
  onToggleTwoFactor: (enabled: boolean) => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  userEmail,
  loading,
  onSendResetLink,
  onLogout,
  twoFactorEnabled,
  onToggleTwoFactor,
}) => {
  return (
    <div className="animate-in slide-in-from-right-2 m-0 space-y-6 duration-300">
      <div className="border-blue-royal/10 bg-blue-royal/5 rounded-2xl border p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-blue-royal/20 text-blue-royal flex h-8 w-8 items-center justify-center rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-blue-royal text-[10px] font-black tracking-wider uppercase">
              Status Akun
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 px-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">
              Alamat Email
            </Label>
            <Input
              value={userEmail || ''}
              disabled
              className="border-blue-royal/10 h-10 rounded-xl bg-white/50 text-sm font-bold opacity-60"
            />
            <p className="text-blue-royal/60 mt-1 text-[9px] font-bold italic">
              Email resmi kalian berdua ya, Sayang! ✨
            </p>
          </div>
        </div>
      </div>

      <div className="border-pink-primary/10 bg-pink-primary/5 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-pink-primary/20 text-pink-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Fingerprint className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-pink-primary text-[10px] font-black tracking-wider uppercase">
                2FA Verification
              </span>
              <p className="text-[11px] font-bold text-slate-700">
                Lapis Keamanan Extra ✨
              </p>
            </div>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={onToggleTwoFactor}
            disabled={loading}
          />
        </div>
        <p className="mt-3 text-[10px] leading-relaxed font-medium text-slate-500">
          Setiap login akan diminta kode verifikasi yang dikirim ke email kamu,
          Sayang. Sangat direkomendasikan! ❤️
        </p>
      </div>

      <div className="space-y-4">
        <div className="mb-2 flex items-center gap-2">
          <KeyRound className="size-4 text-slate-400" />
          <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase">
            Ganti Password
          </span>
        </div>

        <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Mail className="text-blue-royal h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="px-2 text-[11px] leading-relaxed font-bold text-slate-700">
              Demi keamanan akun kalian berdua, link untuk mengganti password
              akan dikirimkan langsung ke email resmi, Sayang! ❤️
            </p>
          </div>
          <Button
            disabled={loading}
            onClick={onSendResetLink}
            className="h-11 w-full rounded-xl bg-slate-900 text-[10px] font-black tracking-widest text-white uppercase shadow-md hover:bg-black"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'KIRIM LINK KE EMAIL'
            )}
          </Button>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-red-stat/20 text-red-stat hover:bg-red-stat/5 hover:text-red-stat h-11 w-full rounded-xl text-[11px] font-bold uppercase transition-all"
        >
          <LogOut className="mr-2 h-4 w-4" /> KELUAR APLIKASI
        </Button>
      </div>
    </div>
  );
};
