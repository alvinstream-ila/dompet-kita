'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { UserNavDropdown } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/PageLoader';
import {
  AddGoalModal,
  GoalCard,
  GoalFilters,
  GoalStats,
  useDeleteGoal,
  useGoals,
} from '@/features/goals';

/**
 * MimpiKita Page - Couple's Roadmap 🗺️
 * Ported to Next.js 15 (App Router)
 */
export default function MimpiKitaPage() {
  const { data: goals = [], isLoading } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'completed'
  >('all');

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const remainingTotal = Math.max(0, totalTarget - totalSaved);

  const filteredGoals = goals
    .filter((g) => {
      const matchesSearch = g.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === 'active' ? -1 : 1;
    });

  if (isLoading) {
    return (
      <PageLoader isLoading={true} message="Membuka peta mimpi kita... 🗺️✨" />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      {/* Mobile Greeting */}
      <div className="mb-6 flex justify-center text-center md:mb-10 lg:hidden">
        <div className="glass-premium h-auto w-full transform-gpu items-center justify-center rounded-[24px] border border-white/50 px-6 py-4 shadow-2xl md:rounded-[32px] md:px-10 md:py-6">
          <h2 className="text-xl leading-tight font-black tracking-tight text-slate-800 md:text-3xl">
            <span className="font-script mb-1 block text-5xl text-pink-600 md:text-8xl">
              Cinta & Cita
            </span>
            <span className="block text-xs font-bold tracking-normal text-slate-500 md:text-lg">
              Mewujudkan Mimpi Kita Satu Per Satu... ✨💖
            </span>
          </h2>
        </div>
      </div>

      {/* Header Row */}
      <header className="mb-10 flex items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-100 md:h-14 md:w-14">
            <Image
              src="/logo-utama.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-sm leading-none font-black tracking-tight text-slate-800 md:text-2xl">
              Mimpi<span className="text-blue-600">Kita</span>
            </h1>
            <span className="font-mono text-[7px] leading-none font-black tracking-[0.3em] text-slate-400 uppercase md:text-[10px]">
              Family Roadmap
            </span>
          </div>
        </div>

        {/* Desktop Greeting */}
        <div className="glass-premium hidden transform-gpu items-center justify-center rounded-[40px] border border-white/50 px-[58px] py-6 shadow-2xl transition-transform hover:scale-105 lg:flex">
          <h2 className="text-2xl font-black tracking-tight whitespace-nowrap text-slate-800">
            <span className="font-script mr-4 block text-[4rem] leading-none text-pink-600 lg:inline-block">
              Sayang,
            </span>
            <span className="font-bold text-slate-600">
              Terus Berjuang Demi Masa Depan Kita Ya... 🚀
            </span>
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
      <GoalFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onAddGoal={() => setIsAddModalOpen(true)}
      />

      {/* Grid of Goals */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
          className="group flex min-h-[350px] flex-col items-center justify-center gap-6 rounded-[40px] border-2 border-dashed border-slate-200 bg-white/50 p-10 text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50"
          type="button"
        >
          <div className="flex size-20 items-center justify-center rounded-[32px] bg-white text-slate-300 shadow-xl transition-transform duration-500 group-hover:scale-110 active:rotate-90">
            <Plus size={40} />
          </div>
          <div className="text-center">
            <h4 className="mb-2 text-[11px] font-black tracking-[0.3em] text-slate-600 uppercase">
              Mimpi Baru
            </h4>
            <p className="max-w-[150px] text-[10px] leading-relaxed font-bold text-slate-400">
              Apa rencana indah kita berikutnya, Sayang?
            </p>
          </div>
        </motion.button>
      </div>

      {/* Decorative Bottom Banner */}
      <Card className="group relative mt-16 overflow-hidden rounded-[48px] border-none bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 p-12 text-white shadow-2xl md:p-20">
        <div className="pointer-events-none absolute top-0 right-0 flex items-center justify-center p-16 opacity-10 transition-transform duration-1000 group-hover:scale-110">
          <Plus size={320} className="rotate-45" strokeWidth={1} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="mb-8 inline-block rounded-full border border-white/5 bg-white/10 px-5 py-2 text-[10px] font-black tracking-[0.4em] uppercase backdrop-blur-xl">
            Dream Note ✨
          </span>
          <h2 className="mb-10 text-5xl leading-tight font-black tracking-tighter md:text-6xl">
            Semua mimpi kita bisa jadi nyata kalau kita berani mewujudkannya...
            ❤️
          </h2>
          <div className="flex items-center gap-6 rounded-[32px] border border-white/5 bg-white/5 p-6 backdrop-blur-md">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-pink-500 shadow-lg shadow-pink-500/20">
              <Heart className="fill-white text-white" size={24} />
            </div>
            <p className="text-lg leading-relaxed font-bold text-white/80 italic">
              &quot;Satu per satu ya Sayang. Gak usah buru-buru, yang penting
              kita konsisten dan selalu bareng. I&apos;m so proud of our
              progress! ✨&quot;
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
}
