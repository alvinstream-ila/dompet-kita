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
  Info
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFormatting } from '@/hooks/useFormatting';
import { useAssets, useWealthHistory, useAddAsset } from '@/hooks/useAssets';
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
import type { AssetType } from '@/types';
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
  const addAssetMutation = useAddAsset();
  const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0);

  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'history'>('overview');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<{
    name: string;
    type: AssetType;
    value: string;
  }>({
    name: '',
    type: 'Tabungan',
    value: ''
  });

  const chartLabels = wealthHistory.length > 0 ? (wealthHistory as WealthHistoryItem[]).map(h => h.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
  const chartValues = wealthHistory.length > 0 ? (wealthHistory as WealthHistoryItem[]).map(h => h.value) : [12000000, 15000000, 14500000, 18000000, 22000000, totalWealth || 25000000];

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
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(236, 72, 153)',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#f1f5f9',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            return ` ${formatAmount(Number(context.parsed.y))}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          display: true,
          color: '#f8fafc',
        },
        ticks: {
          callback: (value) => formatAmount(Number(value)),
          font: {
            size: 10,
            weight: 'bold'
          },
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
            weight: 'bold'
          },
          color: '#94a3b8'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();

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
  };

  if (assetsLoading) {
    return <PageLoader isLoading={true} message="Melihat pertumbuhan harta kita... 💰✨" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
         <div className="glass-premium py-4 h-auto md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl w-full transform-gpu border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Aset & Kekayaan</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Mencatat Fondasi Masa Depan Kita... 💎💰</span>
            </h2>
         </div>
      </div>

      {/* Header Row */}
      <header className="flex items-center justify-between mb-10 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                Wealth<span className="text-blue-600">Kita</span>
              </h1>
              <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">
                Harta Bersama
              </span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50">
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
               <span className="font-script text-[4rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span>
               <span className="text-slate-600 font-bold">Lihat Pertumbuhan Kekayaan Kita Yuk... 🚀💎</span>
               <span className="ml-2 inline-block animate-pulse">✨</span>
            </h2>
         </div>

         <div className="flex items-center gap-4 md:gap-8">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 h-11 w-11 md:h-14 md:w-14 items-center justify-center p-0 shadow-xl group">
                  <Plus className="size-5 md:size-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[32px] p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Tambah Aset Masa Depan ✨</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAsset} className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Aset</Label>
                    <Input id="name" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="Emas Antam, Tabungan Bank, etc." className="rounded-2xl h-14 border-slate-100 px-6 font-bold" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jenis Aset</Label>
                      <Select value={newAsset.type} onValueChange={(val) => setNewAsset({ ...newAsset, type: val as AssetType })}>
                        <SelectTrigger className="rounded-2xl h-14 border-slate-100 px-6 font-bold uppercase transition-all hover:bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                          {['Emas', 'Saham', 'Tabungan', 'Kripto', 'Properti', 'Lainnya'].map((t) => (
                            <SelectItem key={t} value={t} className="rounded-xl px-4 py-3 font-bold uppercase text-[10px] tracking-widest">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nilai Sekarang</Label>
                      <Input id="value" type="number" value={newAsset.value} onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })} placeholder="Rp 1.000.000" className="rounded-2xl h-14 border-slate-100 px-6 font-bold" required />
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-start gap-4">
                    <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-slate-400">Batal</Button>
                    <Button type="submit" disabled={addAssetMutation.isPending} className="flex-1 rounded-2xl h-14 bg-slate-900 font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200">Simpan Aset</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>



            <UserNavDropdown />
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Growth Chart */}
        <div className="lg:col-span-8 space-y-8">
           <Card className="rounded-[40px] border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden bg-white p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Grafik Pertumbuhan</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Estimasi Total Kekayaan Kolektif</p>
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100/50">
                  {(['overview', 'assets', 'history'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[400px] w-full mt-4">
                <Line data={chartData} options={chartOptions} />
              </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[32px] border-none shadow-xl bg-linear-to-br from-slate-900 to-slate-800 text-white p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                  <TrendingUp size={120} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Wealth</p>
                  <h2 className="text-4xl font-black tracking-tighter mb-6">{formatAmount(totalWealth)}</h2>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center gap-2">
                       <ArrowUpRight className="size-3" />
                       +12.5% BULAN INI
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[32px] border-none shadow-xl bg-white p-8 relative overflow-hidden group border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Target Kita</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Freedom Path</p>
                  </div>
                  <Target className="size-8 text-pink-500 opacity-20" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progress</span>
                    <span className="text-xl font-black text-slate-800 tracking-tight">45%</span>
                  </div>
                  <Progress value={45} className="h-3 rounded-full bg-slate-100" />
                  <p className="text-[10px] font-bold text-slate-400 italic">Sedikit lagi ya Sayang, kita pasti bisa! ✨</p>
                </div>
              </Card>
           </div>
        </div>

        {/* Right Column - Assets List */}
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
                  <Card className="rounded-3xl border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-white hover:-translate-y-1 transform-gpu">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 tracking-tight text-sm uppercase">{asset.name}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{asset.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 tracking-tight">{formatAmount(asset.value)}</p>
                        <div className="flex items-center justify-end text-[8px] font-black text-emerald-500 mt-0.5">
                          <TrendingUp size={10} className="mr-1" />
                          STABLE
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full py-6 rounded-4xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <Plus className="size-6 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tambah Aset Baru</span>
            </button>
          </div>

          <Card className="rounded-[32px] bg-linear-to-br from-pink-500 to-rose-500 border-none p-8 text-white shadow-xl shadow-rose-200/50 mt-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Info size={24} />
              </div>
              <h4 className="font-black tracking-tight text-lg">Catatan Cinta</h4>
            </div>
            <p className="text-sm font-bold leading-relaxed opacity-90 italic">
               "Harta yang paling berharga adalah kamu. Tabungan ini cuma bonus buat kita bisa bahagia lebih lama lagi. Semangat ya Sayang! ❤️"
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wealth;
