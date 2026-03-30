import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, StickyNote, Calendar, Plus, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionModal } from '@/components/features/AddTransactionModal';
import { useQueryClient } from '@tanstack/react-query';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  side: 'left' | 'right';
  path: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Beranda', side: 'left', path: '/' },
  {
    id: 'report',
    icon: Calendar,
    label: 'Laporan',
    side: 'left',
    path: '/reports',
  },
  {
    id: 'transactions',
    icon: StickyNote,
    label: 'Transaksi',
    side: 'right',
    path: '/transactions',
  },
  {
    id: 'loans',
    icon: ArrowRightLeft,
    label: 'Titipan Sayang',
    side: 'right',
    path: '/loans',
  },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Determine active nav based on current path
  const getActiveNav = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/transactions')) return 'transactions';
    if (path.startsWith('/reports')) return 'report';
    if (path.startsWith('/loans')) return 'loans';
    return '';
  };

  const activeNav = getActiveNav();

  return (
    <>
      <div className="pointer-events-none fixed right-0 bottom-4 left-0 z-50 flex justify-center md:bottom-8">
        <div className="flex w-full max-w-7xl items-center justify-center gap-2 px-4 sm:gap-4 md:gap-6 lg:gap-8">
          {/* LEFT PILL */}
          <div className="pointer-events-auto">
            <motion.div
              layout
              className="flex h-12 items-center gap-0.5 rounded-[24px] border border-white/60 bg-white/80 px-1.5 shadow-2xl backdrop-blur-3xl md:h-16 md:gap-1 md:rounded-[36px] md:px-2"
            >
              {navItems
                .filter((i) => i.side === 'left')
                .map((item) => (
                  <motion.button
                    key={item.id}
                    onMouseEnter={() => setHoveredNav(item.id)}
                    onMouseLeave={() => setHoveredNav(null)}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'relative flex h-9 shrink-0 flex-row-reverse items-center gap-1.5 rounded-[16px] px-2.5 transition-all sm:px-3 md:h-12 md:gap-2 md:rounded-[22px] md:px-4.5',
                      activeNav === item.id
                        ? 'bg-slate-900 text-white shadow-xl'
                        : 'text-slate-400 hover:bg-slate-100/50'
                    )}
                    layout
                  >
                    <item.icon className="size-4.5 shrink-0 md:size-5.5" />
                    <AnimatePresence mode="popLayout" initial={false}>
                      {(hoveredNav === item.id || activeNav === item.id) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, x: 10 }}
                          animate={{ opacity: 1, width: 'auto', x: 0 }}
                          exit={{ opacity: 0, width: 0, x: 10 }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                          className="hidden overflow-hidden text-[10px] font-black tracking-widest whitespace-nowrap uppercase sm:inline-block md:text-[13px]"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
            </motion.div>
          </div>

          {/* CENTER ANCHOR */}
          <div className="pointer-events-auto relative shrink-0">
            {/* Glowing Ring Effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 -z-10 rounded-full bg-pink-400/30 blur-xl"
            />

            <motion.button
              onClick={() => setIsModalOpen(true)}
              animate={{
                y: [0, -8, 0],
                scaleX: [1, 1.05, 1],
                scaleY: [1, 0.95, 1],
              }}
              whileHover={{
                scale: 1.15,
                rotate: 180,
                transition: { duration: 0.4, ease: 'backOut' },
              }}
              whileTap={{ scale: 0.9 }}
              transition={{
                y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                scaleX: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                scaleY: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-pink-500 font-black text-white shadow-[0_10px_30px_rgba(236,72,153,0.4)] transition-colors active:bg-pink-600 sm:h-16 sm:w-16 md:h-20 md:w-20 md:border-[7px]"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Plus className="size-8 md:size-12" strokeWidth={5} />
              </motion.div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full bg-linear-to-tr from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </motion.button>
          </div>

          {/* RIGHT PILL */}
          <div className="pointer-events-auto">
            <motion.div
              layout
              className="flex h-12 items-center gap-0.5 rounded-[24px] border border-white/60 bg-white/80 px-1.5 shadow-2xl backdrop-blur-3xl md:h-16 md:gap-1 md:rounded-[36px] md:px-2"
            >
              {navItems
                .filter((i) => i.side === 'right')
                .map((item) => (
                  <motion.button
                    key={item.id}
                    onMouseEnter={() => setHoveredNav(item.id)}
                    onMouseLeave={() => setHoveredNav(null)}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'relative flex h-9 shrink-0 flex-row items-center gap-1.5 rounded-[16px] px-2.5 transition-all sm:px-3 md:h-12 md:gap-2 md:rounded-[22px] md:px-4.5',
                      activeNav === item.id
                        ? 'bg-slate-900 text-white shadow-xl'
                        : 'text-slate-400 hover:bg-slate-100/50'
                    )}
                    layout
                  >
                    <item.icon className="size-4.5 shrink-0 md:size-5.5" />
                    <AnimatePresence mode="popLayout" initial={false}>
                      {(hoveredNav === item.id || activeNav === item.id) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, x: -10 }}
                          animate={{ opacity: 1, width: 'auto', x: 0 }}
                          exit={{ opacity: 0, width: 0, x: -10 }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                          className="hidden overflow-hidden text-[10px] font-black tracking-widest whitespace-nowrap uppercase sm:inline-block md:text-[13px]"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
            </motion.div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['wallet_health'] });
        }}
      />
    </>
  );
}
