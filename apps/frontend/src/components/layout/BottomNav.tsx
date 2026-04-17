import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightLeft, History, Home, Plus, TrendingUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { AddTransactionModal } from '@/features/transactions';
import { useUiStore } from '@/lib/store/useUiStore';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        'relative flex h-11 shrink-0 items-center justify-center gap-2 rounded-[20px] px-3.5 transition-all sm:h-9 md:h-12 md:rounded-[22px] md:px-4.5',
        isActive
          ? 'bg-slate-900 px-5 text-white shadow-xl'
          : 'text-slate-400 hover:bg-slate-100/50'
      )}
      layout
    >
      <Icon
        className={cn(
          'size-5 shrink-0 md:size-5.5',
          isActive ? 'text-white' : 'text-slate-400'
        )}
      />
      <AnimatePresence mode="popLayout" initial={false}>
        {(isHovered || isActive) && (
          <motion.span
            initial={{ opacity: 0, width: 0, x: 5 }}
            animate={{ opacity: 1, width: 'auto', x: 0 }}
            exit={{ opacity: 0, width: 0, x: 5 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="hidden overflow-hidden text-[10px] font-black tracking-widest whitespace-nowrap uppercase sm:inline-block md:text-[12px]"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isAddModalOpen, openAddModal, closeAddModal } = useUiStore();

  const leftItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'wealth', icon: TrendingUp, label: 'Wealth', path: '/wealth' },
  ];

  const rightItems = [
    {
      id: 'transactions',
      icon: History,
      label: 'Riwayat',
      path: '/transactions',
    },
    { id: 'loans', icon: ArrowRightLeft, label: 'Titipan', path: '/loans' },
  ];

  const getActiveId = () => {
    if (!pathname) return '';
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/wealth')) return 'wealth';
    if (pathname.startsWith('/transactions')) return 'transactions';
    if (pathname.startsWith('/family')) return 'family';
    return '';
  };

  const activeId = getActiveId();

  return (
    <>
      <div className="pointer-events-none fixed right-0 bottom-4 left-0 z-50 flex justify-center md:bottom-8">
        <div className="flex w-full max-w-2xl items-center justify-center gap-3 px-4 sm:gap-6 md:gap-8">
          {/* LEFT MENU PILL */}
          <div className="pointer-events-auto">
            <motion.div
              layout
              className="flex h-14 items-center gap-1 rounded-[28px] border border-white/60 bg-white/80 px-1.5 shadow-2xl backdrop-blur-3xl sm:h-12 md:h-16 md:rounded-[36px] md:px-2"
            >
              {leftItems.map((item) => (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeId === item.id}
                  onClick={() => router.push(item.path)}
                />
              ))}
            </motion.div>
          </div>

          {/* CENTER ACTION - Pink FAB Restored */}
          <div className="pointer-events-auto relative shrink-0">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 -z-10 rounded-full bg-pink-400/30 blur-lg"
            />
            <motion.button
              onClick={openAddModal}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-pink-400 via-pink-500 to-rose-500 text-white shadow-[0_8px_25px_-5px_rgba(236,72,153,0.5)] sm:h-16 sm:w-16 md:h-20 md:w-20 md:border-6"
            >
              <Plus className="size-8 md:size-10" strokeWidth={4} />
            </motion.button>
          </div>

          {/* RIGHT MENU PILL */}
          <div className="pointer-events-auto">
            <motion.div
              layout
              className="flex h-14 items-center gap-1 rounded-[28px] border border-white/60 bg-white/80 px-1.5 shadow-2xl backdrop-blur-3xl sm:h-12 md:h-16 md:rounded-[36px] md:px-2"
            >
              {rightItems.map((item) => (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeId === item.id}
                  onClick={() => router.push(item.path)}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['wallet_health'] });
        }}
      />
    </>
  );
}
