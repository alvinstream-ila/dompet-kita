'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFormatting } from '@/lib/hooks/useFormatting';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { InvitePartnerDialog } from '@/features/family/components/InvitePartnerDialog';
import { unlinkPartnerAction } from '@/features/family/actions/partner';
import { LogOut, User as UserIcon } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
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

/**
 * FamilyHub Page - Ecosystem & Legacy 🏡
 * Ported to Next.js 15 (App Router)
 */
export default function FamilyHubPage() {
  const { user } = useAuth();
  const { formatAmount } = useFormatting();
  const [newThreshold, setNewThreshold] = React.useState<string>('');
  const [isUpdatingThreshold, setIsUpdatingThreshold] = React.useState(false);
  const [isUnlinkOpen, setIsUnlinkOpen] = React.useState(false);

  // Fetch Tax Estimate
  const { data: taxData, isLoading: isTaxLoading } = useQuery({
    queryKey: ['tax-estimate'],
    queryFn: async () => {
      const res = await api.get('/ai/tax/estimate');
      return res.data.data;
    },
  });

  // Fetch Legacy Report
  useQuery({
    queryKey: ['legacy-report'],
    queryFn: async () => {
      const res = await api.get('/ai/legacy/report');
      return res.data.data;
    },
  });

  const handleUnlink = async () => {
    const result = await unlinkPartnerAction();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdateThreshold = async () => {
    if (!newThreshold || Number.isNaN(Number(newThreshold))) return;
    setIsUpdatingThreshold(true);
    try {
      await api.put('/user/profile', {
        large_expense_threshold: Number(newThreshold),
      });
      toast.success('Batas notifikasi berhasil diubah! ✨');
    } catch {
      toast.error('Gagal mengubah batas notifikasi 🥺');
    } finally {
      setIsUpdatingThreshold(false);
      setNewThreshold('');
    }
  };

  const isLinked = !!user?.partner_id;

  return (
    <div className="container mx-auto px-4 py-10 pb-36 md:px-8 lg:px-12">
      <header className="mb-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black tracking-tight text-slate-800"
        >
          Family <span className="text-blue-600">Ecosystem</span>
        </motion.h1>
        <p className="mt-2 font-medium text-slate-400">
          Membangun masa depan bersama {user?.name} &{' '}
          {user?.partner_name || 'Pasangan'}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Partner Sync Card */}
        <Card className="glass-premium group overflow-hidden rounded-[40px] border-none shadow-2xl">
          <CardHeader className="relative flex h-48 items-center justify-center bg-linear-to-br from-blue-50/50 to-indigo-50/50">
            <Image
              src="/icons/3d/family.png"
              alt="Family"
              width={128}
              height={128}
              className="object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </CardHeader>
          <CardContent className="p-8">
            <div className="mb-2 flex items-start justify-between">
              <CardTitle className="text-2xl font-black text-slate-800">
                Partner Sync
              </CardTitle>
              {isLinked && (
                <div className="rounded-lg bg-green-100 px-2 py-1 text-[10px] font-black tracking-wider text-green-700 uppercase">
                  Linked
                </div>
              )}
            </div>
            <p className="mb-6 text-sm text-slate-500">
              Hubungkan akun dengan pasangan untuk sinkronisasi notifikasi
              pengeluaran besar.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Partner Saat Ini
                  </span>
                  <span className="font-bold text-slate-800">
                    {user?.partner_name || 'Belum Terhubung'}
                  </span>
                </div>
              </div>

              {isLinked ? (
                <div className="space-y-3">
                  <div className="group/threshold flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                    <div>
                      <span className="mb-1 block text-[10px] font-black tracking-widest text-blue-400 uppercase">
                        Batas Notifikasi
                      </span>
                      <span className="font-bold text-blue-700">
                        {formatAmount(user?.large_expense_threshold || 1000000)}
                      </span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-lg text-[10px] font-black text-blue-600 uppercase hover:bg-blue-100"
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl">
                        <DialogHeader>
                          <DialogTitle>Atur Batas Notifikasi</DialogTitle>
                          <DialogDescription>
                            Tentukan jumlah belanja minimal agar sistem
                            mengirimkan notifikasi ke pasangan kamu.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Minimal Pengeluaran (Rp)</Label>
                            <Input
                              type="number"
                              placeholder="Contoh: 1000000"
                              value={newThreshold}
                              onChange={(e) => setNewThreshold(e.target.value)}
                              className="h-12 rounded-xl"
                            />
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500 italic">
                            💡 Tips: Gunakan angka yang cukup besar agar
                            pasangan hanya dikabari untuk belanjaan yang memang
                            perlu didiskusikan bareng.
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleUpdateThreshold}
                            disabled={isUpdatingThreshold || !newThreshold}
                            className="h-12 w-full rounded-xl bg-blue-600 font-bold hover:bg-blue-700"
                          >
                            {isUpdatingThreshold
                              ? 'Menyimpan...'
                              : 'Simpan Batas Baru ✨'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => setIsUnlinkOpen(true)}
                    className="h-12 w-full rounded-xl font-bold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Unlink Akun
                  </Button>

                  <DeleteConfirmDialog
                    isOpen={isUnlinkOpen}
                    onClose={() => setIsUnlinkOpen(false)}
                    onConfirm={handleUnlink}
                    title="Putuskan Hubungan?"
                    description="Kamu dan pasangan tidak akan lagi mendapatkan notifikasi pengeluaran besar secara otomatis. Kamu bisa menghubungkannya kembali nanti."
                    confirmLabel="YA, PUTUSKAN HUBUNGAN"
                  />
                </div>
              ) : (
                <InvitePartnerDialog />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax Assistant Card */}
        <Card className="glass-premium group overflow-hidden rounded-[40px] border-none shadow-2xl">
          <CardHeader className="relative flex h-48 items-center justify-center bg-linear-to-br from-orange-50/50 to-amber-50/50">
            <Image
              src="/icons/3d/tax.png"
              alt="Tax"
              width={128}
              height={128}
              className="object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </CardHeader>
          <CardContent className="p-8">
            <CardTitle className="mb-2 text-2xl font-black text-slate-800">
              Automated Tax
            </CardTitle>
            <p className="mb-6 text-sm text-slate-500">
              Estimasi pajak tahunan otomatis berdasarkan riwayat transaksi
              kamu.
            </p>
            {isTaxLoading ? (
              <div className="flex h-20 animate-pulse items-center justify-center font-bold text-slate-400">
                MENGHITUNG...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                    <span className="block text-[10px] font-black tracking-widest text-amber-600/70 uppercase">
                      Income
                    </span>
                    <span className="text-lg font-bold text-amber-800">
                      {formatAmount(taxData?.total_income || 0)}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <span className="block text-[10px] font-black tracking-widest text-blue-600/70 uppercase">
                      Est. Tax
                    </span>
                    <span className="text-lg font-bold text-blue-800">
                      {formatAmount(taxData?.estimated_tax || 0)}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    🤖 Nasihat AI
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-600 italic">
                    &quot;{taxData?.ai_advice}&quot;
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legacy Planning Card */}
        <Card className="glass-premium group overflow-hidden rounded-[40px] border-none shadow-2xl">
          <CardHeader className="relative flex h-48 items-center justify-center bg-linear-to-br from-purple-50/50 to-pink-50/50">
            <Image
              src="/icons/3d/legacy.png"
              alt="Legacy"
              width={128}
              height={128}
              className="object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </CardHeader>
          <CardContent className="p-8">
            <CardTitle className="mb-2 text-2xl font-black text-slate-800">
              Legacy Planning
            </CardTitle>
            <p className="mb-6 text-sm text-slate-500">
              Warisan digital untuk memastikan semua data tetap aman untuk masa
              depan.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() =>
                  toast.success('Tunggu ya sayang, laporan lagi disiapin! ✨')
                }
                className="h-12 w-full rounded-2xl bg-purple-600 font-bold shadow-lg shadow-purple-200 hover:bg-purple-700"
              >
                Generate Legacy PDF
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
              >
                Setup Digital Vault
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
