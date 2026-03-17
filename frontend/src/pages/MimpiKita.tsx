import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  Calendar, 
  Trash2,
  ChevronRight,
  Sparkles,
  Heart,
  Home,
  Car,
  Plane,
  ShoppingBag,
  Briefcase,
  Gamepad
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import { PageLoader } from '../components/ui/PageLoader';
import { useGoals, useDeleteGoal, useUpdateGoal } from '@/hooks/useGoals';
import { AddGoalModal } from '../components/features/AddGoalModal';
import { cn } from "@/lib/utils";
import type { Goal } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  home: Home,
  car: Car,
  plane: Plane,
  shopping: ShoppingBag,
  work: Briefcase,
  game: Gamepad,
  target: Target,
};

const MimpiKita: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: goals = [], isLoading } = useGoals();
  const deleteGoalMutation = useDeleteGoal();
  const updateGoalMutation = useUpdateGoal();

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus mimpi ini, Sayang? Kita bisa buat mimpi baru kok! 🥺')) {
      await deleteGoalMutation.mutateAsync(id);
    }
  };

  const handleUpdateAmount = async (goal: Goal, type: 'add' | 'sub') => {
    const amountStr = window.prompt(`Berapa nominal yang mau ${type === 'add' ? 'ditambah' : 'dikurangi'} buat "${goal.name}", Sayang?`);
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return;

    const newAmount = type === 'add' ? goal.current_amount + amount : Math.max(0, goal.current_amount - amount);
    
    await updateGoalMutation.mutateAsync({
      id: goal.id,
      current_amount: newAmount,
      status: newAmount >= goal.target_amount ? 'completed' : 'active'
    });
  };

  if (isLoading) return <PageLoader isLoading={true} message="Tunggu sebentar ya Sayang, aku lagi kumpulkan mimpi-mimpi kita... ✨" />;

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Premium Header System (Aligned with Wealth/Holiday) */}
      <header className="mb-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
               <div className="size-10 bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 overflow-hidden">
                 <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
               </div>
               <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                 Future Roadmap ✨
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">
              Mimpi <span className="text-blue-500">Kita</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="size-5" strokeWidth={3} />
              <span className="font-black uppercase tracking-widest text-[11px]">Tambah Mimpi</span>
            </Button>
            <UserNavDropdown />
          </div>
        </div>

        {/* Unified Hero Card (Style like Wealth) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group h-fit md:h-80"
        >
          <Card className="h-full rounded-[48px] overflow-hidden border-2 border-white shadow-2xl relative bg-linear-to-br from-blue-600 to-indigo-800 text-white transform-gpu">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            
            {/* Background Script Font Decor */}
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none select-none hidden lg:block">
              <span className="font-script text-[15rem] leading-none">Mimpi..</span>
            </div>

            <div className="p-8 md:p-12 h-full flex flex-col justify-between relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                  <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-3 block">Tabungan Impian Bersama</span>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                    Rp {goals.reduce((acc, g) => acc + g.current_amount, 0).toLocaleString('id-ID')}
                  </h2>
                </div>
                
                {/* Embedded Cute Banner (Integrating the user's favorite element) */}
                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-4 md:p-6 border border-white/10 max-w-md">
                   <p className="text-lg md:text-xl font-bold leading-tight">
                     <span className="font-script text-4xl text-blue-300 block mb-2">Wujudkan Mimpi..</span>
                     <span className="text-sm md:text-base opacity-90 italic">Satu demi satu, <span className="not-italic font-black text-blue-200 uppercase tracking-widest text-[10px] bg-white/10 px-2 py-0.5 rounded-full">bersama-sama</span> ya Sayang! ❤️</span>
                   </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 mt-8 border-t border-white/10 pt-8">
                <div>
                  <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1 opacity-60">Total Target</span>
                  <span className="text-xl font-black text-white">Rp {goals.reduce((acc, g) => acc + g.target_amount, 0).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1 opacity-60">Status Sukses</span>
                  <span className="text-xl font-black text-emerald-400 flex items-center gap-2">
                    <Sparkles className="size-5" />
                    {goals.filter(g => g.status === 'completed').length} Terwujud
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </header>



      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, index) => {
            const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
            const IconComponent = ICON_MAP[goal.icon || 'target'] || Target;
            
            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/70 backdrop-blur-md border border-white/60 rounded-[32px] p-8 shadow-lg hover:shadow-2xl transition-all overflow-hidden transform-gpu"
              >
                {/* Background Progress Filler (Aligned with Wealth Asset style) */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-blue-500/5 transition-all duration-1000 ease-out"
                  style={{ height: `${progress}%` }}
                />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                      goal.status === 'completed' ? "bg-emerald-500 text-white" : "bg-slate-50 text-blue-600"
                    )}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="flex gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDelete(goal.id)}
                         className="w-10 h-10 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>

                  <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-2 truncate uppercase group-hover:text-blue-600 transition-colors">
                    {goal.name}
                  </h4>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner p-[2px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={cn(
                          "h-full rounded-full shadow-sm",
                          goal.status === 'completed' ? "bg-emerald-500" : "bg-linear-to-r from-blue-500 to-indigo-500"
                        )}
                      />
                    </div>
                    <span className="text-xs font-black text-blue-600 w-10 text-right">{Math.round(progress)}%</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Terkumpul</span>
                        <span className="text-lg font-black text-slate-800 tracking-tighter">Rp {goal.current_amount.toLocaleString('id-ID')}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200" />
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target</span>
                        <span className="text-lg font-black text-slate-800 tracking-tighter">Rp {goal.target_amount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {goal.deadline && (
                      <div className="flex items-center gap-2 py-2 px-4 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          Target: {new Date(goal.deadline).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => handleUpdateAmount(goal, 'sub')}
                      variant="outline"
                      className="h-12 rounded-2xl border-slate-100 font-bold text-slate-500 hover:bg-slate-50"
                    >
                      Kurangi
                    </Button>
                    <Button 
                      onClick={() => handleUpdateAmount(goal, 'add')}
                      className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100"
                    >
                      Top Up
                    </Button>
                  </div>
                </div>

                {goal.status === 'completed' && (
                  <div className="absolute top-4 right-4 rotate-12 scale-150">
                    <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-md shadow-xl uppercase tracking-[0.2em]">
                      Goal Reached!
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {goals.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                 <Target className="w-12 h-12" strokeWidth={1} />
              </div>
              <h5 className="font-black uppercase tracking-[0.3em] text-sm mb-2">Belum ada mimpi yang dicatat</h5>
              <p className="font-bold text-xs">Klik tombol + di atas untuk mulai membuat masa depan ya!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AddGoalModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default MimpiKita;
