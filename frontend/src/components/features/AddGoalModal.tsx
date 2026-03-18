import React, { useState } from 'react';
import { 
  X, 
  Target, 
  Calendar,
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
import { Input } from "@/components/ui/input";
import { useAddGoal } from '@/hooks/useGoals';
import { cn, formatToRupiah, getTerbilang } from "@/lib/utils";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS = [
  { name: 'heart', icon: Heart },
  { name: 'home', icon: Home },
  { name: 'car', icon: Car },
  { name: 'plane', icon: Plane },
  { name: 'shopping', icon: ShoppingBag },
  { name: 'work', icon: Briefcase },
  { name: 'game', icon: Gamepad },
  { name: 'target', icon: Target },
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('heart');
  
  const addGoalMutation = useAddGoal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    await addGoalMutation.mutateAsync({
      name,
      target_amount: parseFloat(targetAmount.replace(/\./g, '')),
      deadline: deadline || null,
      icon: selectedIcon,
      category: 'dream'
    });

    onClose();
    setName('');
    setTargetAmount('');
    setDeadline('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-br from-blue-600/10 via-pink-500/5 to-transparent pointer-events-none" />
          
          <div className="p-8 relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">
                  Mimpi <span className="text-blue-600">Baru</span>
                </h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ayo wujudkan satu per satu! ✨</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                <X className="w-6 h-6 text-slate-400" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Apa Mimpimu, Sayang?</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <Input 
                    placeholder="Contoh: Rumah Impian / DP Mobil" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 pl-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Tabungan (Rp)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">Rp</span>
                  </div>
                  <Input 
                    placeholder="0" 
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(formatToRupiah(e.target.value))}
                    className="h-14 pl-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                {targetAmount && (
                  <p className="text-[10px] font-bold text-blue-500 italic px-2 mt-1">
                    {getTerbilang(Number(targetAmount.replace(/\./g, '')))} Rupiah
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Deadline (Opsional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="h-14 pl-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Pilih Icon</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {ICONS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setSelectedIcon(item.name)}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                            selectedIcon === item.name ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={addGoalMutation.isPending}
                className="w-full h-16 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-[24px] shadow-xl shadow-blue-200 font-black uppercase tracking-widest text-sm group transition-all"
              >
                {addGoalMutation.isPending ? "Sedang Menyimpan..." : "Simpan Mimpi Kita ✨"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
