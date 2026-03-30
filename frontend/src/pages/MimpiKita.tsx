import React, { useState } from 'react';
import { 
  Plus, 
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { PageLoader } from '../components/ui/PageLoader';
import { useGoals, useDeleteGoal } from '@/hooks/useGoals';
import { AddGoalModal } from '../components/features/AddGoalModal';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import { Card } from "@/components/ui/card";
import { GoalCard } from '../components/features/GoalCard';
import { GoalStats } from '../components/features/GoalStats';

const MimpiKita: React.FC = () => {
  const { data: goals = [], isLoading } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const remainingTotal = Math.max(0, totalTarget - totalSaved);

  const filteredGoals = goals
    .filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === 'active' ? -1 : 1;
    });

  if (isLoading) {
    return <PageLoader isLoading={true} message="Membuka peta mimpi kita... 🗺️✨" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
         <div className="glass-premium py-4 h-auto md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl w-full transform-gpu border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Cinta & Cita</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Mewujudkan Mimpi Kita Satu Per Satu... ✨💖</span>
            </h2>
         </div>
      </div>

      {/* Header Row */}
      <header className="flex items-center justify-between mb-10 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                Mimpi<span className="text-blue-600">Kita</span>
              </h1>
              <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono leading-none">
                Family Roadmap
              </span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50">
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
               <span className="font-script text-[4rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span> 
               <span className="text-slate-600 font-bold">Terus Berjuang Demi Masa Depan Kita Ya... 🚀</span>
               <span className="ml-2 inline-block animate-pulse">✨</span>
            </h2>
         </div>

         <div className="flex items-center gap-4 md:gap-8">
            <UserNavDropdown />
         </div>
      </header>

      {/* Statistics Section */}
      <GoalStats 
        totalSaved={totalSaved} 
        totalTarget={totalTarget} 
        remainingTotal={remainingTotal} 
      />

      {/* Search and Filters View */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white p-5 rounded-[32px] shadow-sm border border-slate-50">
        <div className="flex flex-1 w-full gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Cari mimpi kita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 rounded-2xl bg-slate-50/50 border-none font-bold focus:ring-blue-500/10 shadow-inner"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: 'all' | 'active' | 'completed') => setStatusFilter(v)}>
            <SelectTrigger className="w-[160px] h-12 rounded-2xl bg-slate-50/50 border-none font-black text-[10px] uppercase tracking-widest text-slate-500">
              <SelectValue placeholder="STATUS" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="all" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3">Semua Mimpi</SelectItem>
              <SelectItem value="active" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-blue-500">Masih Berjalan</SelectItem>
              <SelectItem value="completed" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-emerald-500">Mimpi Mewujud</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto h-12 px-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Tambah Mimpi Kita
        </Button>
      </div>

      {/* Grid of Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredGoals.map((goal, index) => (
            <GoalCard 
                key={goal.id}
                goal={goal}
                index={index}
                onDelete={(id) => deleteGoalMutation.mutate(id)}
            />
          ))}
        </AnimatePresence>
        
        {/* Ad-hoc Create Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-[40px] border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center gap-6 text-slate-400 transition-all hover:bg-slate-50 hover:border-slate-300 min-h-[350px] group bg-white/50"
        >
          <div className="size-20 rounded-[32px] bg-white shadow-xl flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform active:rotate-90 duration-500">
             <Plus size={40} />
          </div>
          <div className="text-center">
             <h4 className="font-black text-slate-600 uppercase tracking-[0.3em] text-[11px] mb-2">Mimpi Baru</h4>
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-[150px]">Apa rencana indah kita berikutnya, Sayang?</p>
          </div>
        </motion.button>
      </div>

      {/* Decorative Bottom Banner */}
      <Card className="rounded-[48px] border-none bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 p-12 md:p-20 text-white relative overflow-hidden shadow-2xl mt-16 group">
         <div className="absolute top-0 right-0 p-16 opacity-10 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Plus size={320} className="rotate-45" strokeWidth={1} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.4em] mb-8 border border-white/5">
              Dream Note ✨
            </span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-10 leading-tight">
              Semua mimpi kita bisa jadi nyata kalau kita berani mewujudkannya... ❤️
            </h2>
            <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[32px] backdrop-blur-md border border-white/5">
                <div className="size-14 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <Heart className="fill-white text-white" size={24} />
                </div>
                <p className="text-lg font-bold text-white/80 italic leading-relaxed">
                "Satu per satu ya Sayang. Gak usah buru-buru, yang penting kita konsisten dan selalu bareng. I'm so proud of our progress! ✨"
                </p>
            </div>
         </div>
      </Card>

      <AddGoalModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default MimpiKita;
