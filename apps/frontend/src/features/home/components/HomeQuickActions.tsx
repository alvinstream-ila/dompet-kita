'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Plane,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useUiStore } from '@/lib/store/useUiStore';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  {
    id: 'add',
    icon: PlusCircle,
    label: 'Catat Jajan',
    isModal: true,
    gradient: 'bg-linear-to-br from-[var(--color-pink-primary)] to-[#ff4d80]',
    shadow: 'shadow-[var(--color-pink-primary)]/20',
    description: 'Catat pengeluaran kita hari ini ✨',
  },
  {
    id: 'scan',
    icon: Sparkles,
    label: 'Scan Struk',
    path: '/scanner',
    gradient: 'bg-linear-to-br from-[var(--color-yellow-outlook)] to-[#e6b800]',
    shadow: 'shadow-[var(--color-yellow-outlook)]/20',
    description: 'Biar cepet, foto aja struknya!',
  },
  {
    id: 'holiday',
    icon: Plane,
    label: 'Liburan Kita',
    path: '/holiday',
    gradient: 'bg-linear-to-br from-[var(--color-blue-royal)] to-[#2a52be]',
    shadow: 'shadow-[var(--color-blue-royal)]/20',
    description: 'Rencana jalan-jalan bareng ✈️',
  },
  {
    id: 'wealth',
    icon: TrendingUp,
    label: 'Pertumbuhan',
    path: '/wealth',
    gradient: 'bg-linear-to-br from-[var(--color-green-stat)] to-[#27ae60]',
    shadow: 'shadow-[var(--color-green-stat)]/20',
    description: 'Cek harta kolektif kita ❤️',
  },
  {
    id: 'reports',
    icon: FileText,
    label: 'Laporan Detail',
    path: '/reports',
    gradient: 'bg-linear-to-br from-[#8b5cf6] to-[#7c3aed]',
    shadow: 'shadow-violet-200/20',
    description: 'Analisis jajan bulanan',
  },
  {
    id: 'family',
    icon: Users,
    label: 'Keluarga Kita',
    path: '/family-hub',
    gradient: 'bg-linear-to-br from-[var(--color-pink-primary)] to-[#ff4d80]',
    shadow: 'shadow-[var(--color-pink-primary)]/20',
    description: 'Eksosistem cinta Alvin & Ila ✨',
  },
  {
    id: 'legacy',
    icon: ShieldAlert,
    label: 'Legacy Vault',
    path: '/legacy-vault',
    gradient: 'bg-linear-to-br from-[var(--color-red-stat)] to-[#c0392b]',
    shadow: 'shadow-[var(--color-red-stat)]/20',
    description: 'Warisan digital kita aman 🛡️',
  },
  {
    id: 'scheduled',
    icon: Calendar,
    label: 'Tagihan Kita',
    path: '/scheduled',
    gradient: 'bg-linear-to-br from-[var(--color-blue-royal)] to-[#2a52be]',
    shadow: 'shadow-[var(--color-blue-royal)]/20',
    description: 'Biar nggak lupa bayar-bayar ✨',
  },
  {
    id: 'mimpi',
    icon: Sparkles,
    label: 'Mimpi Kita',
    path: '/mimpi-kita',
    gradient: 'bg-linear-to-br from-[var(--color-yellow-outlook)] to-[#e6b800]',
    shadow: 'shadow-[var(--color-yellow-outlook)]/20',
    description: 'Wujudkan impian bersama 💍',
  },
];

export const HomeQuickActions: React.FC = () => {
  const router = useRouter();
  const { openAddModal } = useUiStore();

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 md:grid-cols-3 md:gap-4 lg:col-span-12 lg:grid-cols-3 lg:gap-6">
      {QUICK_ACTIONS.map((btn) => (
        <motion.button
          key={btn.id}
          whileHover={{
            scale: 1.05,
            y: -8,
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (btn.isModal) {
              openAddModal();
            } else {
              router.push(btn.path!);
            }
          }}
          className={cn(
            'group relative flex flex-col items-center gap-3 overflow-hidden rounded-[32px] border-none bg-white p-4 shadow-xl transition-all sm:p-5 lg:p-6',
            btn.shadow
          )}
        >
          <div
            className={cn(
              'absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20',
              btn.gradient
            )}
          />

          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-[22px] border border-white/20 shadow-lg backdrop-blur-xl transition-transform group-hover:scale-110 md:h-14 md:w-14',
              btn.gradient
            )}
          >
            <btn.icon
              className="size-6 text-white md:size-7"
              strokeWidth={2.5}
            />
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] leading-tight font-black tracking-widest text-slate-800 uppercase md:text-[11px]">
              {btn.label}
            </span>
            <span className="mt-1 line-clamp-1 hidden text-[8px] font-medium text-slate-400 lg:block">
              {btn.description}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
