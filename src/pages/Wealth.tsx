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
  ChevronRight,
  Target,
  ArrowUpRight,
  History as HistoryIcon,
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
import { supabase } from '@/lib/supabase';
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

  // Use wealthHistory data if available, otherwise fallback to dummy for visual appeal
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
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 14 },
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => `Rp ${(context.raw as number).toLocaleString('id-ID')}`
        }
      }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    addAssetMutation.mutate({
      name: newAsset.name,
      type: newAsset.type,
      value: Number(newAsset.value),
      user_id: user.id
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
      {/* Premium Header */}
      <header className="mb-10 relative">
        <div className="flex justify-between items-start mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-widest mb-3">
              Family Fortune ✨
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">
              Wealth <span className="text-pink-500">Growth</span>
            </h1>
          </motion.div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800 h-14 px-6 font-bold shadow-xl">
                <Plus className="size-5 mr-2" />
                Tambah Aset
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[32px] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Tambah Aset Masa Depan ✨</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAsset} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Aset</Label>
                  <Input 
                    id="name" 
                    placeholder="Contoh: Emas Antam, Saham BBCA..." 
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipe Aset</Label>
                    <Select 
                      value={newAsset.type} 
                      onValueChange={(val) => setNewAsset({ ...newAsset, type: val as AssetType })}
                    >
                      <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold">
                        <SelectValue placeholder="Pilih Tipe" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Tabungan">Tabungan</SelectItem>
                        <SelectItem value="Emas">Emas</SelectItem>
                        <SelectItem value="Saham">Saham</SelectItem>
                        <SelectItem value="Kripto">Kripto</SelectItem>
                        <SelectItem value="Properti">Properti</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                   <div className="space-y-2">
                     <Label htmlFor="value" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nilai (Rp)</Label>
                     <div className="space-y-1.5">
                       <Input 
                         id="value" 
                         type="number"
                         placeholder="0" 
                         value={newAsset.value}
                         onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                         className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold focus:ring-pink-500/20"
                         required
                       />
                       <div className="text-[10px] font-black text-pink-500 bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-100/50 inline-block animate-in fade-in slide-in-from-top-1 duration-200">
                         Intipan: <span className="opacity-70">{formatAmount(Number(newAsset.value) || 0, true)}</span>
                       </div>
                     </div>
                   </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-pink-200"
                    disabled={addAssetMutation.isPending}
                  >
                    {addAssetMutation.isPending ? 'Menyimpan...' : 'Simpan Aset Kita 💖'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Wealth Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group h-64 md:h-80"
        >
          <Card className="h-full rounded-[48px] overflow-hidden border-2 border-white shadow-2xl relative bg-slate-900 text-white transform-gpu">
            <div className="absolute inset-0 bg-linear-to-br from-pink-500/20 via-transparent to-blue-500/20" />
            
            <div className="p-8 md:p-12 h-full flex flex-col justify-between relative z-10">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Total Kekayaan Bersih</span>
                <div className="flex items-baseline gap-4">
                  <h2 className={cn("text-4xl md:text-6xl font-black tracking-tighter text-white", totalWealth === 0 && "text-white")}>
                    {formatAmount(totalWealth)}
                  </h2>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full text-sm">
                    <ArrowUpRight className="size-4" />
                    +12.5%
                  </span>
                </div>
              </div>

              {/* Mini Growth Chart in Card */}
              <div className="absolute inset-x-0 bottom-0 h-32 opacity-50">
                <Line data={chartData} options={chartOptions} />
              </div>

              <div className="flex gap-10 mt-4 relative z-20">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Aset Aktif</span>
                  <span className="text-xl font-black text-white">{assets.length} <span className="text-sm font-medium text-slate-500">Unit</span></span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Update Terakhir</span>
                  <span className="text-xl font-black text-white">Hari Ini</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[28px] mb-8 w-fit mx-auto md:mx-0">
        {[
          { id: 'overview', label: 'Ringkasan', icon: TrendingUp },
          { id: 'assets', label: 'Daftar Aset', icon: Coins },
          { id: 'history', label: 'Riwayat', icon: HistoryIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'assets' | 'history')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {activeTab === 'assets' && (
            <>
              {assets.map((asset, idx) => (
                  <motion.div
                    key={asset.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20,
                      delay: Math.min(idx * 0.03, 0.3) 
                    }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="rounded-[32px] border-white/60 bg-white/70 backdrop-blur-md shadow-lg overflow-hidden group transform-gpu">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-110">
                          {getAssetIcon(asset.type)}
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                          <ChevronRight className="size-5" />
                        </Button>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          {asset.type}
                        </span>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{asset.name}</h4>
                      </div>

                      <div className="flex justify-between items-end bg-slate-50 p-4 rounded-2xl">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Nilai Saat Ini</span>
                          <span className={cn("text-lg font-black", asset.value === 0 ? "text-white" : "text-slate-900")}>
                            {formatAmount(asset.value)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-emerald-500 uppercase block">Growth</span>
                          <span className="text-sm font-bold text-emerald-600">+4.2%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          )}

          {activeTab === 'overview' && (
            <motion.div 
              className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Asset Allocation Card */}
              <Card className="rounded-[40px] border-white bg-white/80 backdrop-blur-2xl shadow-2xl p-8">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <Target className="size-5 text-pink-500" />
                  Alokasi Harta Kita
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Emas', value: 40, color: 'bg-amber-400' },
                    { label: 'Saham', value: 30, color: 'bg-blue-400' },
                    { label: 'Tabungan', value: 20, color: 'bg-emerald-400' },
                    { label: 'Lainnya', value: 10, color: 'bg-slate-400' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2.5 rounded-full bg-slate-50">
                        <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                      </Progress>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Passive Income Concept Card */}
              <Card className="rounded-[40px] border-transparent bg-linear-to-br from-indigo-600 to-blue-700 text-white shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <TrendingUp className="size-48" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <HistoryIcon className="size-5" />
                    Insight Cuan
                  </h3>
                  <div className="space-y-4">
                    <p className="text-indigo-100 font-medium leading-relaxed">
                      Sayang, harta kita tumbuh paling cepat di kategori <span className="text-white font-bold underline decoration-pink-500 underline-offset-4">Emas</span> bulan ini! ✨
                    </p>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                          <Info className="size-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block">Rekomendasi Pintar</span>
                          <span className="text-sm font-bold">Terus konsisten menabung rutin ya!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wealth;
