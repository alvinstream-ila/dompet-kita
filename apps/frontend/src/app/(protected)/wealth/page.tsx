'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { Plus, Info, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFormatting } from '@/lib/hooks/useFormatting';
import {
  useAssets,
  useWealthHistory,
  useAddAsset,
  useUpdateAsset,
  useDeleteAsset,
  useWealthSimulation,
  AssetForm,
  WealthAssetCard,
  WealthChart,
  WealthStats,
  WealthSimulationChart,
} from '@/features/wealth';
import { useGoals } from '@/features/goals';
import { PageLoader } from '@/components/ui/PageLoader';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserNavDropdown } from '@/components/layout';
import type { Asset } from '@/types';

/**
 * Wealth Page - Sovereignty & Growth 💎
 * Ported to Next.js 15 (App Router)
 */
export default function WealthPage() {
  const { formatAmount } = useFormatting();
  const { data: assets = [], isLoading: assetsLoading } = useAssets();
  const { data: wealthHistory = [] } = useWealthHistory();
  const { data: goals = [] } = useGoals();
  const addAssetMutation = useAddAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0);

  const { data: simulation = [] } = useWealthSimulation(12);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const growthPercentage = (() => {
    if (wealthHistory.length < 2) return 0;
    const history = wealthHistory as { value: number }[];
    const lastValue = history.at(-2)?.value ?? 0;
    const currentValue = (history.at(-1)?.value ?? totalWealth) || totalWealth;
    if (lastValue === 0) return 0;
    return ((currentValue - lastValue) / lastValue) * 100;
  })();

  const freedomProgress = (() => {
    if (goals.length === 0) return 0;
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
    if (totalTarget === 0) return 0;
    return Math.min(Math.round((totalSaved / totalTarget) * 100), 100);
  })();

  const freedomMessage = (() => {
    if (goals.length === 0) return 'Ayo tentukan mimpi kita dulu, Sayang! ✨';
    if (freedomProgress >= 100)
      return 'CARI MIMPI BARU LAGI! Kita sudah merdeka, Sayang! 🎉🏆💖';
    if (freedomProgress >= 80)
      return 'DIKIT LAGI! Kita hampir merdeka, Sayang! Ayo gas terus! 🎢✨';
    if (freedomProgress >= 50)
      return 'SETENGAH JALAN! Makin mantap fondasi kita, Sayang! I love you! ❤️';
    if (freedomProgress >= 20)
      return 'Sabar ya Sayang, pelan tapi pasti! Fondasi kita makin kuat! ✨';
    return 'Langkah awal masa depan kita. Semangat ya Sayang! 👣💎';
  })();

  const handleAssetSubmit = async (formData: Omit<Asset, 'id'>) => {
    if (editingAsset) {
      updateAssetMutation.mutate(
        { id: editingAsset.id, ...formData },
        {
          onSuccess: () => {
            setIsAddDialogOpen(false);
            setEditingAsset(null);
          },
        }
      );
    } else {
      addAssetMutation.mutate(formData, {
        onSuccess: () => setIsAddDialogOpen(false),
      });
    }
  };

  const handleDelete = async (id: string) => {
    setAssetToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (assetToDelete) {
      await deleteAssetMutation.mutateAsync(assetToDelete);
      setAssetToDelete(null);
    }
  };

  if (assetsLoading) {
    return (
      <PageLoader
        isLoading={true}
        message="Melihat pertumbuhan harta kita... 💰✨"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      {/* Mobile Header Greeting */}
      <div className="mb-10 flex justify-center text-center lg:hidden">
        <div className="glass-premium w-full items-center justify-center rounded-[32px] border border-white/50 px-10 py-6 shadow-2xl">
          <h2 className="text-xl leading-tight font-black tracking-tight text-slate-800 md:text-3xl">
            <span className="font-script mb-1 block text-5xl text-pink-600 md:text-8xl">
              Wealth Kita
            </span>
            <span className="block text-xs font-bold tracking-widest text-slate-500 md:text-lg">
              Fondasi Masa Depan ✨
            </span>
          </h2>
        </div>
      </div>

      <header className="mb-8 flex items-center justify-between gap-3 md:mb-12">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
            <Image
              src="/logo-utama.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl leading-none font-black tracking-tight text-slate-800">
              Wealth<span className="text-blue-600">Kita</span>
            </h1>
            <span className="text-[9px] font-black tracking-[0.2em] text-slate-500/80 uppercase">
              Harta Bersama
            </span>
          </div>
        </div>

        {/* Desktop Greeting */}
        <div className="glass-premium group relative hidden items-center justify-center overflow-hidden rounded-[40px] border border-white/50 px-[58px] py-6 shadow-2xl transition-transform hover:scale-105 lg:flex">
          <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-pink-50 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <h2 className="relative z-10 text-2xl font-black tracking-tight whitespace-nowrap text-slate-800">
            <span className="font-script mr-4 block text-[4rem] leading-none text-pink-600 lg:inline-block">
              Sayang,
            </span>
            <span className="font-bold text-slate-600">
              Lihat Pertumbuhan Harta Kita... 💎
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="group h-14 w-14 items-center justify-center rounded-full bg-slate-900 p-0 text-white shadow-xl hover:bg-slate-800"
          >
            <Plus className="size-6 transition-transform duration-300 group-hover:rotate-90" />
          </Button>
          <UserNavDropdown />
        </div>
      </header>

      {/* Add/Edit Asset Modal */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open: boolean) =>
          !open && (setIsAddDialogOpen(false), setEditingAsset(null))
        }
      >
        <DialogContent className="max-w-md rounded-[40px] border-none bg-white p-8 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-800">
              {editingAsset ? 'Perbarui Aset ✨' : 'Tambah Aset ✨'}
            </DialogTitle>
            <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Pastikan datanya akurat ya sayang!
            </p>
          </DialogHeader>
          <AssetForm
            initialData={editingAsset}
            onSubmit={handleAssetSubmit}
            isLoading={
              addAssetMutation.isPending || updateAssetMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {/* Line Chart */}
          <WealthChart
            data={wealthHistory}
            totalWealth={totalWealth}
            formatAmount={formatAmount}
          />

          {/* Monte Carlo Simulation Chart */}
          <WealthSimulationChart data={simulation} />

          {/* Stats Cards Section */}
          <WealthStats
            totalWealth={totalWealth}
            growthPercentage={growthPercentage}
            freedomProgress={freedomProgress}
            freedomMessage={freedomMessage}
            formatAmount={formatAmount}
          />
        </div>

        {/* Sidebar: Asset List */}
        <div className="space-y-6 lg:col-span-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Daftar Aset
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black tracking-widest text-slate-600 uppercase">
              {assets.length} Item
            </span>
          </div>

          <div className="custom-scrollbar max-h-[1000px] space-y-4 overflow-y-auto py-1 pr-1">
            <AnimatePresence mode="popLayout">
              {assets.map((asset, index) => (
                <WealthAssetCard
                  key={asset.id}
                  asset={asset}
                  index={index}
                  onEdit={(a) => {
                    setEditingAsset(a);
                    setIsAddDialogOpen(true);
                  }}
                  onDelete={handleDelete}
                  formatAmount={formatAmount}
                />
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(true)}
              className="group flex h-auto w-full flex-col gap-2 rounded-[28px] border-2 border-dashed border-slate-200 py-10 text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
            >
              <div className="rounded-2xl bg-white p-3 shadow-sm transition-all group-hover:shadow-md">
                <Plus className="size-6" />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                Tambah Aset Baru
              </span>
            </Button>
          </div>

          {/* Romantic Memo */}
          <Card className="group relative mt-10 overflow-hidden rounded-[40px] border-none bg-linear-to-br from-pink-500 to-rose-500 p-10 text-white shadow-xl">
            <Info className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-white/10 transition-transform duration-700 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-[20px] border border-white/10 bg-white/20 p-3.5 shadow-lg backdrop-blur-md">
                  <Heart size={24} className="fill-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-xl leading-none font-black tracking-tight">
                    Catatan Cinta
                  </h4>
                  <p className="text-[9px] font-black tracking-widest uppercase opacity-60">
                    Pesan dari pasanganmu
                  </p>
                </div>
              </div>
              <p className="text-base leading-relaxed font-bold text-white/90 italic opacity-95">
                &quot;Harta yang paling berharga adalah kamu. Tabungan ini cuma bonus
                buat kita bisa bahagia lebih lama lagi. Semangat ya Sayang! ❤️&quot;
              </p>
            </div>
          </Card>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Aset ini?"
        description="Beneran mau hapus aset ini sayang? Sayang lho pertumbuhannya..."
        loading={deleteAssetMutation.isPending}
      />
    </div>
  );
}
