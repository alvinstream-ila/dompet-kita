import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Trash2, 
  Settings2, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock initial categories (usually should come from a store or DB)
const INITIAL_EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Kebutuhan Rumah',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Tagihan & Utilitas',
  'Lainnya'
];

const INITIAL_INCOME_CATEGORIES = [
  'Gaji',
  'Investasi',
  'Hadiah',
  'Bisnis',
  'Penjualan',
  'Bonus',
  'Lainnya'
];

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [expenseCats, setExpenseCats] = useState(INITIAL_EXPENSE_CATEGORIES);
  const [incomeCats, setIncomeCats] = useState(INITIAL_INCOME_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');

  const currentCats = activeTab === 'expense' ? expenseCats : incomeCats;
  const setCurrentCats = activeTab === 'expense' ? setExpenseCats : setIncomeCats;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (currentCats.includes(newCategory.trim())) return;
    
    setCurrentCats([...currentCats, newCategory.trim()]);
    setNewCategory('');
  };

  const handleDeleteCategory = (cat: string) => {
    setCurrentCats(currentCats.filter(c => c !== cat));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden rounded-[32px] border-none shadow-2xl bg-white/95 backdrop-blur-2xl">
        <DialogHeader className="p-8 pb-12 bg-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-1">
             <div className="flex items-center gap-2 mb-1">
                <Settings2 className="w-4 h-4 text-pink-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">Settings</p>
             </div>
             <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 text-white">
               KUSTOMISASI KATEGORI
             </DialogTitle>
             
             <p className="text-slate-400 text-xs font-bold leading-relaxed">
               Atur kategori pengeluaran dan pemasukan sesuka hati kamu ya..
             </p>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl" />
          
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 w-11 h-11 rounded-full text-white hover:bg-white/10 hover:text-white transition-all active:scale-90 z-50"
            >
              <X className="w-6 h-6" strokeWidth={3} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="px-8 pb-10 -mt-8 relative z-20 space-y-6">
          {/* Tabs Switcher */}
          <div className="flex p-1.5 bg-white shadow-xl rounded-2xl border border-slate-100">
             <button 
               onClick={() => setActiveTab('expense')}
               className={cn(
                 "flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                 activeTab === 'expense' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
               )}
             >
               <ArrowDownCircle className="w-3.5 h-3.5" />
               Pengeluaran
             </button>
             <button 
               onClick={() => setActiveTab('income')}
               className={cn(
                 "flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                 activeTab === 'income' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
               )}
             >
               <ArrowUpCircle className="w-3.5 h-3.5" />
               Pemasukan
             </button>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                placeholder="Tambah kategori baru..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 rounded-2xl px-5 font-bold text-sm focus-visible:ring-slate-300 placeholder:italic"
              />
            </div>
            <Button type="submit" className="h-12 w-12 rounded-2xl bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-500/20 text-white border-none shrink-0 p-0">
              <Plus className="w-6 h-6" strokeWidth={3} />
            </Button>
          </form>

          {/* List Container */}
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {currentCats.map((cat) => (
                <motion.div 
                  key={cat}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all hover:shadow-md hover:border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activeTab === 'expense' ? "bg-pink-400" : "bg-emerald-400"
                    )} />
                    <span className="font-bold text-slate-700 text-sm">{cat}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteCategory(cat)}
                    className="w-9 h-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200 font-black text-[11px] uppercase tracking-widest text-slate-500" onClick={onClose}>
               <X className="w-4 h-4 mr-2" /> Batalkan
            </Button>
            <Button className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-black font-black text-[11px] uppercase tracking-widest text-white shadow-xl" onClick={onClose}>
               <Check className="w-4 h-4 mr-2" /> Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
