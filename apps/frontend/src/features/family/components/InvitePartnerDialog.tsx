'use client';

import { Heart, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { invitePartnerAction } from '../actions/partner';

export function InvitePartnerDialog() {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const result = await invitePartnerAction(email);
      if (result.success) {
        toast.success('Undangan Terkirim! 💌', {
          description:
            'Semoga dia cepat merespon ya Sayang, biar kita bisa atur mimpi bareng! ✨',
        });
        setIsOpen(false);
        setEmail('');
      } else {
        toast.error('Gagal Mengirim Undangan 🥺', {
          description:
            result.error ||
            'Coba cek lagi emailnya ya Sayang, maaf ada kendala.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-royal shadow-blue-royal/20 h-12 w-full rounded-2xl font-bold shadow-lg transition-all hover:brightness-110 active:scale-95">
          Undang Pasangan ✨
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl sm:max-w-[425px]">
        <DialogHeader>
          <div className="bg-blue-royal/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Heart className="fill-blue-royal text-blue-royal h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-slate-900">
            Hubungkan Mimpi Bersama
          </DialogTitle>
          <DialogDescription className="pt-2 text-center text-slate-500">
            Undang pasangan kamu untuk mulai sinkronisasi keuangan keluarga.
          </DialogDescription>
        </DialogHeader>

        <div className="border-blue-royal/20 bg-blue-royal/5 my-2 flex items-start gap-3 rounded-2xl border p-4">
          <ShieldCheck className="text-blue-royal mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-blue-royal/80 text-xs leading-relaxed">
            <span className="font-bold">PEMBERITAHUAN PRIVASI:</span>
            <p className="mt-1">
              Dengan menghubungkan partner, kamu dan pasangan akan saling
              mendapatkan notifikasi untuk **pengeluaran skala besar** yang
              melampaui batas tertentu. Catatan transaksi harian lainnya tetap
              tersimpan secara pribadi di masing-masing akun.
            </p>
          </div>
        </div>

        <form onSubmit={handleInvite} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="ml-1 font-medium text-slate-700">
              Email Pasangan
            </Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="email@pasangan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:border-blue-royal focus:ring-blue-royal h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 transition-all"
                required
              />
            </div>
            <p className="ml-1 text-[10px] text-slate-400">
              *Pasangan kamu harus sudah terdaftar dan melakukan verifikasi
              email.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              className="bg-blue-royal shadow-blue-royal/10 h-12 w-full rounded-xl font-bold shadow-lg transition-all hover:brightness-110 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? 'Mengirim...' : 'Kirim Undangan Ke Dia 💌'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
