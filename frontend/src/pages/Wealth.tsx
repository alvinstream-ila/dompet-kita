import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Info,
  Heart
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormatting } from '@/hooks/useFormatting';
import { useAssets, useWealthHistory, useAddAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets';
import { useGoals } from '@/hooks/useGoals';
import { PageLoader } from '@/components/ui/PageLoader';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import type { Asset } from '@/types';

import { AssetForm } from '../components/features/AssetForm';
import { WealthAssetCard } from '../components/features/WealthAssetCard';
import { WealthChart } from '../components/features/WealthChart';
import { WealthStats } from '../components/features/WealthStats';

const Wealth: React.FC = () => {
  const { formatAmount } = useFormatting();
  const { data: assets = [], isLoading: assetsLoading } = useAssets();
  const { data: wealthHistory = [] } = useWealthHistory();
  const { data: goals = [] } = useGoals();
  const addAssetMutation = useAddAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();
  
  const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const growthPercentage = (() => {
    if (wealthHistory.length < 2) return 0;
    const history = wealthHistory as any[];
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
    if (goals.length === 0) return "Ayo tentukan mimpi kita dulu, Sayang! ✨";
    if (freedomProgress >= 100) return "CARI MIMPI BARU LAGI! Kita sudah merdeka, Sayang! 🎉🏆💖";
    if (freedomProgress >= 80) return "DIKIT LAGI! Kita hampir merdeka, Sayang! Ayo gas terus! 🎢✨";
    if (freedomProgress >= 50) return "SETENGAH JALAN! Makin mantap fondasi kita, Sayang! I love you! ❤️";
    if (freedomProgress >= 20) return "Sabar ya Sayang, pelan tapi pasti! Fondasi kita makin kuat! ✨";
    return "Langkah awal masa depan kita. Semangat ya Sayang! 👣💎";
  })();

  const handleAssetSubmit = async (formData: any) => {
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, ...formData }, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setEditingAsset(null);
        }
      });
    } else {
      addAssetMutation.mutate(formData, {
        onSuccess: () => setIsAddDialogOpen(false)
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
    return <PageLoader isLoading={true} message="Melihat pertumbuhan harta kita... 💰✨" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Header Greeting */}
      <div className="lg:hidden flex justify-center mb-10 text-center">
         <div className="glass-premium py-6 px-10 rounded-[32px] items-center justify-center shadow-2xl w-full border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Wealth Kita</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-widest">Fondasi Masa Depan ✨</span>
            </h2>
         </div>
      </div>

      <header className="flex items-center justify-between mb-10 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 relative flex items-center justify-center p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                Wealth<span className="text-blue-600">Kita</span>
              </h1>
              <span className="text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">Harta Bersama</span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 border border-white/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight relative z-10">
               <span className="font-script text-[4rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span>
               <span className="text-slate-600 font-bold">Lihat Pertumbuhan Harta Kita... 💎</span>
            </h2>
         </div>

         <div className="flex items-center gap-4">
            <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-full bg-slate-900 text-white hover:bg-slate-800 h-14 w-14 items-center justify-center p-0 shadow-xl group">
               <Plus className="size-6 group-hover:rotate-90 transition-transform duration-300" />
            </Button>
            <UserNavDropdown />
         </div>
      </header>

      {/* Add/Edit Asset Modal */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open: boolean) => !open && (setIsAddDialogOpen(false), setEditingAsset(null))}>
        <DialogContent className="rounded-[40px] p-8 max-w-md border-none shadow-2xl bg-white">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-800">
              {editingAsset ? 'Perbarui Aset ✨' : 'Tambah Aset ✨'}
            </DialogTitle>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Pastikan datanya akurat ya sayang!</p>
          </DialogHeader>
          <AssetForm 
            initialData={editingAsset}
            onSubmit={handleAssetSubmit}
            isLoading={addAssetMutation.isPending || updateAssetMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           {/* Line Chart */}
           <WealthChart 
                data={wealthHistory} 
                totalWealth={totalWealth}
                formatAmount={formatAmount} 
           />

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
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daftar Aset</h3>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">{assets.length} Item</span>
          </div>

          <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-1 py-1 custom-scrollbar">
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
              className="w-full py-10 rounded-[28px] border-2 border-dashed border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600 flex flex-col gap-2 h-auto transition-all group"
            >
              <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all">
                <Plus className="size-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tambah Aset Baru</span>
            </Button>
          </div>

          {/* Romantic Memo */}
          <Card className="rounded-[40px] bg-linear-to-br from-pink-500 to-rose-500 border-none p-10 text-white shadow-xl mt-10 relative overflow-hidden group">
            <Info className="absolute -bottom-6 -right-6 size-40 text-white/10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3.5 bg-white/20 rounded-[20px] backdrop-blur-md border border-white/10 shadow-lg">
                        <Heart size={24} className="fill-white" />
                    </div>
                    <div>
                        <h4 className="font-black text-xl tracking-tight leading-none mb-1">Catatan Cinta</h4>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Pesan dari pasanganmu</p>
                    </div>
                </div>
                <p className="text-base font-bold leading-relaxed opacity-95 italic text-white/90">
                "Harta yang paling berharga adalah kamu. Tabungan ini cuma bonus buat kita bisa bahagia lebih lama lagi. Semangat ya Sayang! ❤️"
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
};

export default Wealth;
