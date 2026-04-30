'use client';

import { Heart, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import api from '@/lib/axios';
import type { ApiError } from '@/types';

export function AcceptPartnerModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [inviterName, setInviterName] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkInvitation = async () => {
      if (!token) return;
      try {
        const res = await api.get(`/partner/invitation/${token}`);
        setInviterName(res.data.inviter_name || 'Pasangan kamu');
        setIsOpen(true);
      } catch (error: unknown) {
        toast.error(
          (error as ApiError).response?.data?.message ||
            'Undangan tidak valid 🥺'
        );
        // Clean up the URL
        router.replace('/family-hub');
      }
    };

    if (token) {
      checkInvitation();
    }
  }, [token, router]);

  const handleAccept = async () => {
    if (!token) return;
    setIsLoading(true);

    const action = async () => {
      const res = await api.post('/partner/accept', { token });
      toast.success(res.data.message || 'Berhasil terhubung! ❤️');
      setIsOpen(false);
      router.push('/family-hub');
    };

    try {
      await action();
    } catch (error: unknown) {
      if (!(error as ApiError).response?.data?.sudo_required) {
        toast.error(
          (error as ApiError).response?.data?.message ||
            'Gagal menerima undangan 🥺'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
      <DialogContent className="rounded-3xl border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl sm:max-w-[425px]">
        <DialogHeader>
          <div className="bg-pink-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Heart className="fill-pink-primary text-pink-primary h-8 w-8 animate-pulse" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-slate-900">
            Undangan Partner ❤️
          </DialogTitle>
          <DialogDescription className="pt-2 text-center text-slate-500">
            <span className="font-bold text-slate-800">{inviterName}</span>{' '}
            mengundang kamu untuk menjadi partner keuangan resmi di Dompet Kita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <LinkIcon className="h-5 w-5 text-slate-400" />
            <p className="text-sm text-slate-600">
              Terhubung dengan{' '}
              <span className="font-bold text-slate-800">{inviterName}</span>
            </p>
          </div>

          <div className="border-blue-royal/20 bg-blue-royal/5 flex items-start gap-3 rounded-2xl border p-4">
            <ShieldCheck className="text-blue-royal mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-blue-royal/80 text-xs leading-relaxed">
              <span className="font-bold tracking-tight uppercase">
                Apa yang terjadi nanti?
              </span>
              <p className="mt-1">
                Kalian akan saling mendapatkan notifikasi jika ada pengeluaran
                di atas batas yang ditentukan. Ini membantu kalian tetap sinkron
                dalam membangun aset masa depan.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl text-slate-400 hover:text-slate-600"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Nanti Saja
          </Button>
          <Button
            className="bg-blue-royal shadow-blue-royal/20 h-12 flex-3 rounded-xl px-8 font-bold shadow-lg transition-all hover:brightness-110 active:scale-95"
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? 'Menghubungkan...' : 'Terima & Hubungkan ✨'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
