import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Coins, 
  Landmark, 
  Gem, 
  Bitcoin, 
  Home, 
  Plus, 
  Target,
  ArrowUpRight,
  Info,
  Edit2,
  Trash2,
  Heart
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFormatting } from '@/hooks/useFormatting';
import { useAssets, useWealthHistory, useAddAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets';
import { useGoals } from '@/hooks/useGoals';
import { PageLoader } from '@/components/ui/PageLoader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import type { Asset, AssetType } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { TooltipItem, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WealthHistoryItem {
  month: string;
  value: number;
}

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
  const [newAsset, setNewAsset] = useState<{
    name: string;
    type: AssetType;
    value: string;
  }>({
    name: '',
    type: 'Tabungan',
    value: ''
  });

  const chartLabels = wealthHistory.length > 0 
    ? (wealthHistory as WealthHistoryItem[]).map(h => h.month) 
    : [new Date().toLocaleDateString('id-ID', { month: 'short' })];
    
  const chartValues = wealthHistory.length > 0 
    ? (wealthHistory as WealthHistoryItem[]).map(h => h.value) 
    : [totalWealth];

  const growthPercentage = React.useMemo(() => {
    if (wealthHistory.length < 2) return 0;
    const history = wealthHistory as WealthHistoryItem[];
    const lastValue = history[history.length - 2].value;
    const currentValue = history[history.length - 1].value;
    if (lastValue === 0) return 0;
    return ((currentValue - lastValue) / lastValue) * 100;
  }, [wealthHistory]);

  const freedomProgress = React.useMemo(() => {
    if (goals.length === 0) return 0;
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
    if (totalTarget === 0) return 0;
    return Math.min(Math.round((totalSaved / totalTarget) * 100), 100);
  }, [goals]);

  const freedomMessage = React.useMemo(() => {
    if (goals.length === 0) return "Ayo tentukan mimpi kita dulu, Sayang! ✨";
    if (freedomProgress >= 100) return "CARI MIMPI BARU LAGI! Kita sudah merdeka, Sayang! 🎉🏆💖";
    if (freedomProgress >= 80) return "DIKIT LAGI! Kita hampir merdeka, Sayang! Ayo gas terus! 🎢✨";
    if (freedomProgress >= 50) return "SETENGAH JALAN! Makin mantap fondasi kita, Sayang! I love you! ❤️";
    if (freedomProgress >= 20) return "Sabar ya Sayang, pelan tapi pasti! Fondasi kita makin kuat! ✨";
    return "Langkah awal masa depan kita. Semangat ya Sayang! 👣💎";
  }, [freedomProgress, goals.length]);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Emas': return <Gem className="size-5 text-amber-500" />;
      case 'Saham': return <TrendingUp className="size-5 text-blue-500" />;
      case 'Tabungan': return <Landmark className="size-5 text-emerald-500" />;
      case 'Kripto': return <Bitcoin className="size-5 text-orange-500" />;
      case 'Properti': return <Home className="size-5 text-indigo-500" />;
      default: return <Coins className="size-5 text-slate-500" />;
    }
  };

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: 'Kekayaan Kita',
        data: chartValues,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(99, 102, 241)',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#f1f5f9',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: TooltipItem<'line'>) => ` ${formatAmount(Number(context.parsed.y))}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: '#f8fafc' },
        ticks: {
          callback: (value) => formatAmount(Number(value)),
          font: { size: 10, weight: 'bold' },
          color: '#94a3b8'
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAsset) {
      updateAssetMutation.mutate({
        id: editingAsset.id,
        name: newAsset.name,
        type: newAsset.type,
        value: Number(newAsset.value),
      }, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setEditingAsset(null);
          setNewAsset({ name: '', type: 'Tabungan', value: '' });
        }
      });
    } else {
      addAssetMutation.mutate({
        name: newAsset.name,
        type: newAsset.type,
        value: Number(newAsset.value),
      }, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewAsset({ name: '', type: 'Tabungan', value: '' });
        }
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus aset ini, Sayang? 🥺')) {
      await deleteAssetMutation.mutateAsync(id);
    }
  };

  if (assetsLoading) {
    return <PageLoader isLoading={true} message="Melihat pertumbuhan harta kita... 💰✨" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
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

         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 border border-white/50">
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
               <span className="font-script text-[4rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span>
               <span className="text-slate-600 font-bold">Lihat Pertumbuhan Harta Kita... 💎</span>
            </h2>
         </div>

         <div className="flex items-center gap-4">
            <Dialog open={isAddDialogOpen} onOpenChange={(open: boolean) => {
              setIsAddDialogOpen(open);
              if (!open) {
                setEditingAsset(null);
                setNewAsset({ name: '', type: 'Tabungan', value: '' });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 h-14 w-14 items-center justify-center p-0 shadow-xl group">
                  <Plus className="size-6 group-hover:rotate-90 transition-transform duration-300" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[40px] p-8 max-w-md border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-slate-800">
                    {editingAsset ? 'Perbarui Aset ✨' : 'Tambah Aset ✨'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Aset</Label>
                    <Input value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="Emas Antam, Tabungan, dll" className="rounded-2xl h-14 border-slate-100 px-6 font-bold" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jenis</Label>
                      <Select value={newAsset.type} onValueChange={(val) => setNewAsset({ ...newAsset, type: val as AssetType })}>
                        <SelectTrigger className="rounded-2xl h-14 border-slate-100 px-6 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          {['Emas', 'Saham', 'Tabungan', 'Kripto', 'Properti', 'Lainnya'].map((t) => (
                            <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nilai (Rp)</Label>
                      <Input type="number" value={newAsset.value} onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })} className="rounded-2xl h-14 border-slate-100 px-6 font-bold" required />
                    </div>
                  </div>
                  <DialogFooter className="pt-4 gap-2">
                    <Button type="submit" className="w-full rounded-2xl h-14 bg-slate-900 font-black uppercase tracking-widest shadow-xl">
                      {editingAsset ? 'Perbarui' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <UserNavDropdown />
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <Card className="rounded-[40px] border-none shadow-2xl bg-white p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Grafik Pertumbuhan</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Estimasi Total Kekayaan Kolektif</p>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <Line data={chartData} options={chartOptions} />
              </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[32px] border-none shadow-xl bg-slate-900 text-white p-8 group">
                <TrendingUp className="absolute top-4 right-4 size-24 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Wealth</p>
                <h2 className="text-4xl font-black tracking-tighter mb-4">{formatAmount(totalWealth)}</h2>
                <div className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black gap-2",
                  growthPercentage >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                )}>
                   <ArrowUpRight className={cn("size-3", growthPercentage < 0 && "rotate-90")} />
                   {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}% {growthPercentage >= 0 ? 'NAIK' : 'TURUN'}
                </div>
              </Card>

              <Card className="rounded-[32px] border-none shadow-xl bg-white p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-800">Target Kita</h3>
                  <Target className="size-8 text-pink-500/20" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progress Freedom</span>
                    <span className="text-xl font-black text-slate-800">{freedomProgress}%</span>
                  </div>
                  <Progress value={freedomProgress} className="h-3 rounded-full bg-slate-100" />
                  <p className="text-[10px] font-bold text-slate-400 italic">"{freedomMessage}"</p>
                </div>
              </Card>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daftar Aset</h3>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">{assets.length} Item</span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {assets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Card className="rounded-[28px] border-none shadow-md hover:shadow-xl transition-all group bg-white overflow-hidden border border-slate-50">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-sm uppercase leading-tight">{asset.name}</h4>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{asset.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-slate-900">{formatAmount(asset.value)}</p>
                          <p className="text-[8px] font-black text-slate-300 uppercase">Current Value</p>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {
                            setEditingAsset(asset);
                            setNewAsset({ name: asset.name, type: asset.type, value: asset.value.toString() });
                            setIsAddDialogOpen(true);
                          }} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(asset.id)} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full py-8 rounded-[28px] border-2 border-dashed border-slate-200 text-slate-400 hover:bg-slate-50 flex flex-col gap-2 h-auto"
            >
              <Plus className="size-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tambah Aset Baru</span>
            </Button>
          </div>

          <Card className="rounded-[32px] bg-linear-to-br from-pink-500 to-rose-500 border-none p-8 text-white shadow-xl mt-10 relative overflow-hidden">
            <Info className="absolute -bottom-4 -right-4 size-32 text-white/10" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Heart size={20} className="fill-white" />
              </div>
              <h4 className="font-black text-lg">Catatan Cinta</h4>
            </div>
            <p className="text-sm font-bold leading-relaxed opacity-95 italic">
               "Harta yang paling berharga adalah kamu. Tabungan ini cuma bonus buat kita bisa bahagia lebih lama lagi. Semangat ya Sayang! ❤️"
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wealth;
