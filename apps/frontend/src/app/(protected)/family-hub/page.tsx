'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LogOut, RefreshCw, Settings, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/features/auth';
import { unlinkPartnerAction } from '@/features/family/actions/partner';
import { InvitePartnerDialog } from '@/features/family/components/InvitePartnerDialog';
import api from '@/lib/axios';
import { useFormatting } from '@/lib/hooks/useFormatting';

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
  const [isLegacySettingsOpen, setIsLegacySettingsOpen] = React.useState(false);
  const [legacyConfig, setLegacyConfig] = React.useState({
    threshold: user?.legacy_threshold_months || 6,
    partnerName: user?.legacy_partner_name || user?.partner_name || '',
    partnerEmail: user?.legacy_partner_email || '',
  });
  const [isUpdatingLegacy, setIsUpdatingLegacy] = React.useState(false);

  // Fetch Tax Estimate
  const {
    data: taxData,
    isLoading: isTaxLoading,
    refetch: refetchTax,
  } = useQuery({
    queryKey: ['tax-estimate'],
    queryFn: async () => {
      const res = await api.get('/ai/tax/estimate');
      return res.data.data;
    },
  });

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);

  // Tax Profile State
  const [taxProfile, setTaxProfile] = React.useState({
    status: user?.tax_status || 'TK/0',
    dependents: user?.dependents_count || 0,
    sector: user?.industry_sector || '',
  });

  // Sync profile when user changes
  React.useEffect(() => {
    if (user) {
      setTaxProfile({
        status: user.tax_status || 'TK/0',
        dependents: user.dependents_count || 0,
        sector: user.industry_sector || '',
      });
    }
  }, [user]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    // Dramatic pause for AI "thinking" effect
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await refetchTax();
    setIsRefreshing(false);
    toast.success('Pajak Genius Sayang sudah selesai berpikir! ✨');
  };

  const handleUpdateTaxProfile = async () => {
    setIsUpdatingProfile(true);
    const action = async () => {
      await api.put('/user/profile', {
        tax_status: taxProfile.status,
        dependents_count: Number(taxProfile.dependents),
        industry_sector: taxProfile.sector,
      });
      toast.success('Profil pajak berhasil diperbarui! ❤️');
      refetchTax();
    };

    try {
      await action();
    } catch (error: unknown) {
      if (!(error as any).response?.data?.sudo_required) {
        toast.error('Gagal memperbarui profil pajak 🥺');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

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
    const action = async () => {
      await api.put('/user/profile', {
        large_expense_threshold: Number(newThreshold),
      });
      toast.success('Batas notifikasi berhasil diubah! ✨');
    };

    try {
      await action();
    } catch (error: unknown) {
      if (!(error as any).response?.data?.sudo_required) {
        toast.error('Gagal mengubah batas notifikasi 🥺');
      }
    } finally {
      setIsUpdatingThreshold(false);
      setNewThreshold('');
    }
  };

  const [isGeneratingLegacy, setIsGeneratingLegacy] = React.useState(false);

  const handleGenerateLegacyPDF = async () => {
    setIsGeneratingLegacy(true);
    toast.info('Mempersiapkan Laporan Warisan Digital... ✨');

    const action = async () => {
      const response = await api.get('/ai/legacy/report', {
        responseType: 'blob',
      });

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute(
        'download',
        `Laporan_Warisan_${new Date().toISOString().split('T')[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Laporan Warisan Digital berhasil dibangkitkan! ❤️');
    };

    try {
      await action();
    } catch (error: unknown) {
      if (!(error as any).response?.data?.sudo_required) {
        toast.error('Gagal membangkitkan laporan warisan 🥺');
      }
    } finally {
      setIsGeneratingLegacy(false);
    }
  };

  const handleUpdateLegacySettings = async () => {
    setIsUpdatingLegacy(true);
    const action = async () => {
      await api.patch('/legacy/settings', {
        legacy_threshold_months: Number(legacyConfig.threshold),
        legacy_partner_name: legacyConfig.partnerName,
        legacy_partner_email: legacyConfig.partnerEmail,
      });
      toast.success('Pengaturan Digital Vault berhasil disimpan! ❤️');
      setIsLegacySettingsOpen(false);
    };

    try {
      await action();
    } catch (error: unknown) {
      if (!(error as any).response?.data?.sudo_required) {
        toast.error('Gagal menyimpan pengaturan Digital Vault 🥺');
      }
    } finally {
      setIsUpdatingLegacy(false);
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
          Family <span className="text-blue-royal">Ecosystem</span>
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
                          className="text-blue-royal hover:bg-blue-royal/10 h-8 rounded-lg text-[10px] font-black uppercase"
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
                            className="bg-blue-royal hover:bg-blue-royal/90 h-12 w-full rounded-xl font-bold"
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
                    className="hover:bg-red-stat/5 hover:text-red-stat h-12 w-full rounded-xl font-bold text-slate-400 transition-colors"
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
          <CardHeader className="from-yellow-outlook/10 to-yellow-outlook/20 relative flex h-48 items-center justify-center bg-linear-to-br">
            <Image
              src="/icons/3d/tax.png"
              alt="Tax"
              width={128}
              height={128}
              className="object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="mb-2 text-2xl font-black text-slate-800">
                  Automated Tax
                </CardTitle>
                <p className="mb-6 text-sm text-slate-500">
                  Estimasi pajak tahunan 2026 berdasarkan profil kamu.
                </p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Profil Pajak (PTKP)</DialogTitle>
                    <DialogDescription>
                      Atur status pajak kamu secara manual untuk akurasi
                      perhitungan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Status Pernikahan</Label>
                        <Select
                          value={taxProfile.status.split('/')[0]}
                          onValueChange={(v) =>
                            setTaxProfile({ ...taxProfile, status: v })
                          }
                        >
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Pilih Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TK">Lajang (TK)</SelectItem>
                            <SelectItem value="K">Menikah (K)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggungan (Maks 3)</Label>
                        <Select
                          value={String(taxProfile.dependents)}
                          onValueChange={(v) =>
                            setTaxProfile({
                              ...taxProfile,
                              dependents: Number(v),
                            })
                          }
                        >
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="0" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sektor Industri (Untuk Insentif DTP)</Label>
                      <Select
                        value={taxProfile.sector}
                        onValueChange={(v) =>
                          setTaxProfile({ ...taxProfile, sector: v })
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Pilih Sektor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Umum">Umum (Tanpa DTP)</SelectItem>
                          <SelectItem value="Tekstil">Tekstil</SelectItem>
                          <SelectItem value="Pakaian Jadi">
                            Pakaian Jadi
                          </SelectItem>
                          <SelectItem value="Alas Kaki">Alas Kaki</SelectItem>
                          <SelectItem value="Furnitur">Furnitur</SelectItem>
                          <SelectItem value="Pariwisata">Pariwisata</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-4 text-[10px] leading-relaxed text-blue-600 italic">
                      💡 Info: Status{' '}
                      <b>
                        {taxProfile.status}/{taxProfile.dependents}
                      </b>{' '}
                      digunakan untuk menghitung Penghasilan Tidak Kena Pajak
                      (PTKP) sesuai UU HPP.
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleUpdateTaxProfile}
                      disabled={isUpdatingProfile}
                      className="bg-blue-royal h-12 w-full rounded-2xl font-bold"
                    >
                      {isUpdatingProfile
                        ? 'Menyimpan...'
                        : 'Update Profil Pajak ✨'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isTaxLoading || isRefreshing ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="bg-yellow-outlook/20 rounded-full p-4"
                >
                  <RefreshCw className="text-yellow-outlook h-8 w-8" />
                </motion.div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    {isRefreshing ? 'AI Is Thinking...' : 'MENGHITUNG...'}
                  </span>
                  <p className="max-w-[180px] text-[11px] text-slate-500 italic">
                    {isRefreshing
                      ? '"Sayang, tunggu ya, aku lagi baca regulasi PMK 105/2025... 🧐"'
                      : 'Mempersiapkan data keuangan kamu...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-yellow-outlook/20 bg-yellow-outlook/10 rounded-2xl border p-4">
                    <span className="text-yellow-outlook block text-[10px] font-black tracking-widest uppercase">
                      Income 2026
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatAmount(taxData?.total_income || 0)}
                    </span>
                  </div>
                  <div className="border-blue-royal/20 bg-blue-royal/10 relative overflow-hidden rounded-2xl border p-4">
                    <span className="text-blue-royal block text-[10px] font-black tracking-widest uppercase">
                      Est. Tax
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatAmount(taxData?.estimated_tax || 0)}
                    </span>
                    {taxData?.is_dtp_active && (
                      <div className="bg-green-stat absolute top-0 right-0 rounded-bl-lg px-1.5 py-0.5 text-[8px] font-black text-white uppercase">
                        DTP Active
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-royal/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <UserIcon className="text-blue-royal h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[8px] font-black tracking-widest text-slate-400 uppercase">
                        Status PTKP
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {taxData?.ptkp_status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black tracking-widest text-slate-400 uppercase">
                      Efektif
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {taxData?.effective_rate}%
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] text-white">
                      ✨
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Nasihat Pajak Genius
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    &quot;{taxData?.ai_advice}&quot;
                  </p>
                </div>

                <Button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="bg-yellow-outlook shadow-yellow-outlook/20 hover:bg-yellow-outlook/90 flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-bold text-slate-900 shadow-lg"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Refresh AI Advice
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legacy Planning Card */}
        <Card className="glass-premium group overflow-hidden rounded-[40px] border-none shadow-2xl">
          <CardHeader className="from-pink-primary/10 to-pink-primary/20 relative flex h-48 items-center justify-center bg-linear-to-br">
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
                onClick={handleGenerateLegacyPDF}
                disabled={isGeneratingLegacy}
                className="bg-pink-primary shadow-pink-primary/20 hover:bg-pink-primary/90 h-12 w-full rounded-2xl font-bold shadow-lg"
              >
                {isGeneratingLegacy
                  ? 'Generating... ✨'
                  : 'Generate Legacy PDF'}
              </Button>
              <Dialog
                open={isLegacySettingsOpen}
                onOpenChange={setIsLegacySettingsOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Setup Digital Vault
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Setup Digital Vault 🛡️</DialogTitle>
                    <DialogDescription>
                      Atur sistem warisan otomatis (Dead Man&apos;s Switch)
                      Anda.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Inaktivitas (Bulan)</Label>
                      <Select
                        value={String(legacyConfig.threshold)}
                        onValueChange={(v) =>
                          setLegacyConfig({
                            ...legacyConfig,
                            threshold: Number(v),
                          })
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Pilih durasi" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 3, 6, 12, 24, 36].map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {m} Bulan
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="px-1 text-[10px] text-slate-400">
                        Sistem akan aktif jika Anda tidak login selama durasi
                        ini.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label>Penerima Warisan Digital</Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="Nama Lengkap Pasangan"
                          value={legacyConfig.partnerName}
                          onChange={(e) =>
                            setLegacyConfig({
                              ...legacyConfig,
                              partnerName: e.target.value,
                            })
                          }
                          className="h-12 rounded-xl"
                        />
                        <Input
                          type="email"
                          placeholder="Email Pasangan"
                          value={legacyConfig.partnerEmail}
                          onChange={(e) =>
                            setLegacyConfig({
                              ...legacyConfig,
                              partnerEmail: e.target.value,
                            })
                          }
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4 text-[11px] leading-relaxed text-pink-700">
                      💡 <strong>Penting:</strong> Pastikan email pasangan
                      valid. Mereka akan menerima link rahasia untuk mengakses
                      data finansial Anda hanya jika masa inaktivitas
                      terlampaui.
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleUpdateLegacySettings}
                      disabled={
                        isUpdatingLegacy ||
                        !legacyConfig.partnerName ||
                        !legacyConfig.partnerEmail
                      }
                      className="bg-pink-primary hover:bg-pink-primary/90 h-12 w-full rounded-xl font-bold"
                    >
                      {isUpdatingLegacy
                        ? 'Menyimpan...'
                        : 'Aktifkan Digital Vault ✨'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
