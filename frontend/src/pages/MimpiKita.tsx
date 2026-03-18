import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  Calendar, 
  Trash2,
  Heart,
  Home,
  Car,
  Plane,
  ShoppingBag,
  Briefcase,
  Gamepad,
  Search,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { PageLoader } from '../components/ui/PageLoader';
import { useGoals, useDeleteGoal } from '@/hooks/useGoals';
import { AddGoalModal } from '../components/features/AddGoalModal';
import { cn, formatToRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserNavDropdown } from '../components/features/UserNavDropdown';
import { StatCard } from '../components/ui/StatCard';

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  home: Home,
  car: Car,
  plane: Plane,
  shopping: ShoppingBag,
  work: Briefcase,
  game: Gamepad,
  target: Target,
  trending: TrendingUp
};

const MimpiKita: React.FC = () => {
  const { data: goals = [], isLoading } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const remainingTotal = totalTarget - totalSaved;

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
            <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                Mimpi<span className="text-blue-600">Kita</span>
              </h1>
              <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Total Dana Terkumpul" amount={totalSaved} imageSrc="/icons/3d/income.webp" variant="income" />
        <StatCard title="Total Target Kita" amount={totalTarget} imageSrc="/icons/3d/wallet.webp" isCurrency={true} />
        <StatCard title="Kekurangan Dana" amount={remainingTotal} imageSrc="/icons/3d/expense.webp" variant="expense" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div className="flex flex-1 w-full gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Cari mimpi kita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 rounded-2xl bg-white border-slate-100 font-bold focus:ring-blue-500/10 shadow-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[140px] h-12 rounded-2xl bg-white border-slate-100 font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="all" className="rounded-xl font-bold text-xs uppercase tracking-widest">Semua</SelectItem>
              <SelectItem value="active" className="rounded-xl font-bold text-xs uppercase tracking-widest">Berjalan</SelectItem>
              <SelectItem value="completed" className="rounded-xl font-bold text-xs uppercase tracking-widest">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto h-12 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          <Plus size={18} />
          Tambah Mimpi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredGoals.map((goal, index) => {
            const Icon = (goal.icon && ICON_MAP[goal.icon]) || Target;
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isCompleted = goal.status === 'completed';

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                layout
              >
                <div className={cn(
                  "group relative bg-white rounded-[32px] p-8 shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100/50 h-full flex flex-col transform-gpu hover:-translate-y-1",
                  isCompleted && "bg-slate-50/50 grayscale-[0.5]"
                )}>
                  {isCompleted && (
                    <div className="absolute top-6 right-6">
                      <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        Terwujud! ✨
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-8">
                    <div className={cn(
                      "size-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500",
                      isCompleted ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-500"
                    )}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 line-clamp-1">{goal.name}</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isCompleted ? 'Mimpi Terwujud' : 'Dalam Proses'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sudah Ada</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight">{formatToRupiah(goal.current_amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Target</p>
                        <p className="font-bold text-slate-600 text-sm">{formatToRupiah(goal.target_amount)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isCompleted ? "bg-emerald-500" : "bg-linear-to-r from-blue-500 to-indigo-500"
                            )}
                          />
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</span>
                          <span className="text-[11px] font-black text-slate-900">{Math.round(progress)}%</span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                        <Calendar size={12} />
                        {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Cepat atau Lambat'}
                     </div>
                     {!isCompleted && (
                       <button 
                         onClick={() => deleteGoalMutation.mutate(goal.id)}
                         className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                     )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-[32px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-4 text-slate-400 transition-all hover:bg-slate-50 hover:border-slate-300 min-h-[300px]"
        >
          <div className="size-16 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-300">
             <Plus size={32} />
          </div>
          <div className="text-center">
             <h4 className="font-black text-slate-600 uppercase tracking-widest text-[10px] mb-1">Mimpi Baru</h4>
             <p className="text-[10px] font-bold opacity-60">Apa cita-cita kita berikutnya?</p>
          </div>
        </motion.button>
      </div>

      <Card className="rounded-[40px] border-none bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 p-10 md:p-16 text-white relative overflow-hidden shadow-2xl mt-16">
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <Target size={240} className="rotate-12" />
         </div>
         <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-6">
              Dream Note ✨
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
              Semua mimpi kita bisa jadi nyata kalau kita berani mewujudkannya... ❤️
            </h2>
            <p className="text-lg font-bold text-white/70 italic leading-relaxed">
              "Satu per satu ya Sayang. Gak usah buru-buru, yang penting kita konsisten dan selalu bareng. I'm so proud of our progress! ✨"
            </p>
         </div>
      </Card>

      <AddGoalModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

// Re-defining Card for this file since it's used in overwrite
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("bg-white rounded-[40px] shadow-sm", className)}>
    {children}
  </div>
);

export default MimpiKita;
