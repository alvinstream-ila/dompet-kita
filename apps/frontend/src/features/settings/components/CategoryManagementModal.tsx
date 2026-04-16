import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  Plus,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CategoryManagementModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const CategoryManagementModal: React.FC<
  CategoryManagementModalProps
> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [expenseCats, setExpenseCats] = useState(EXPENSE_CATEGORIES);
  const [incomeCats, setIncomeCats] = useState(INCOME_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');

  const currentCats = activeTab === 'expense' ? expenseCats : incomeCats;
  const setCurrentCats =
    activeTab === 'expense' ? setExpenseCats : setIncomeCats;

  const handleAddCategory = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (currentCats.includes(newCategory.trim())) return;

    setCurrentCats([...currentCats, newCategory.trim()]);
    setNewCategory('');
  };

  const handleDeleteCategory = (cat: string) => {
    setCurrentCats(currentCats.filter((c) => c !== cat));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-[32px] border-none bg-white/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-md"
      >
        <DialogHeader className="relative overflow-hidden bg-slate-900 p-8 pb-12 text-white">
          <div className="relative z-10 space-y-1">
            <div className="mb-1 flex items-center gap-2">
              <Settings2 className="text-pink-primary h-4 w-4" />
              <p className="text-pink-primary text-[10px] font-black tracking-[0.2em] uppercase">
                Settings
              </p>
            </div>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter text-white">
              KUSTOMISASI KATEGORI
            </DialogTitle>

            <p className="text-xs leading-relaxed font-bold text-slate-400">
              Atur kategori pengeluaran dan pemasukan sesuka hati kamu ya..
            </p>
          </div>
          <div className="bg-pink-primary/20 absolute -top-10 -right-10 h-48 w-48 rounded-full blur-3xl" />

          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 h-11 w-11 rounded-full text-white transition-all hover:bg-white/10 hover:text-white active:scale-90"
            >
              <X className="h-6 w-6" strokeWidth={3} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="relative z-20 -mt-8 space-y-6 px-8 pb-10">
          <div className="flex rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveTab('expense')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black tracking-widest uppercase transition-all',
                activeTab === 'expense'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-50'
              )}
            >
              <ArrowDownCircle className="h-3.5 w-3.5" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('income')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black tracking-widest uppercase transition-all',
                activeTab === 'income'
                  ? 'bg-green-stat text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-50'
              )}
            >
              <ArrowUpCircle className="h-3.5 w-3.5" />
              Pemasukan
            </button>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2">
            <div className="relative flex-1">
              <label htmlFor="new-category-input" className="sr-only">
                Tambah kategori baru
              </label>
              <Input
                id="new-category-input"
                placeholder="Tambah kategori baru..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-5 text-sm font-bold placeholder:italic focus-visible:ring-slate-300"
              />
            </div>
            <Button
              type="submit"
              className="bg-pink-primary shadow-pink-primary/20 hover:bg-pink-primary/90 h-12 w-12 shrink-0 rounded-2xl border-none p-0 text-white shadow-lg"
            >
              <Plus className="h-6 w-6" strokeWidth={3} />
            </Button>
          </form>

          <div className="custom-scrollbar max-h-[300px] space-y-2 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {currentCats.map((cat) => (
                <motion.div
                  key={cat}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        activeTab === 'expense'
                          ? 'bg-pink-primary'
                          : 'bg-green-stat'
                      )}
                    />
                    <span className="text-sm font-bold text-slate-700">
                      {cat}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(cat)}
                    className="hover:bg-red-stat/5 hover:text-red-stat h-9 w-9 rounded-xl text-slate-300 opacity-0 transition-all group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-2xl border-slate-200 text-[11px] font-black tracking-widest text-slate-500 uppercase"
              onClick={onClose}
            >
              <X className="mr-2 h-4 w-4" /> Batalkan
            </Button>
            <Button
              className="h-12 flex-1 rounded-2xl bg-slate-900 text-[11px] font-black tracking-widest text-white uppercase shadow-xl hover:bg-black"
              onClick={onClose}
            >
              <Check className="mr-2 h-4 w-4" /> Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
