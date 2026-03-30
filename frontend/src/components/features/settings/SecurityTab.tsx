import React from 'react';
import { ShieldCheck, KeyRound, Mail, LogOut, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SecurityTabProps {
  userEmail?: string;
  loading: boolean;
  onSendResetLink: () => void;
  onLogout: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  userEmail,
  loading,
  onSendResetLink,
  onLogout
}) => {
  return (
    <div className="m-0 space-y-6 animate-in slide-in-from-right-2 duration-300">
      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Status Akun</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 px-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Email</Label>
            <Input
              value={userEmail || ''}
              disabled
              className="h-10 bg-white/50 border-blue-100 rounded-xl font-bold text-sm opacity-60"
            />
            <p className="text-[9px] font-bold text-blue-400 mt-1 italic">Email resmi kalian berdua ya, Sayang! ✨</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="size-4 text-slate-400" />
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Ganti Password</span>
        </div>

        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-700 leading-relaxed px-2">
              Demi keamanan akun kalian berdua, link untuk mengganti password akan dikirimkan langsung ke email resmi, Sayang! ❤️
            </p>
          </div>
          <Button
            disabled={loading}
            onClick={onSendResetLink}
            className="w-full h-11 bg-slate-900 hover:bg-black rounded-xl font-black text-[10px] tracking-widest uppercase shadow-md text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "KIRIM LINK KE EMAIL"}
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full h-11 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold text-[11px] uppercase transition-all"
        >
          <LogOut className="w-4 h-4 mr-2" /> KELUAR APLIKASI
        </Button>
      </div>
    </div>
  );
};
