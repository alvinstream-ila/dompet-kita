import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, StickyNote, Calendar, Plus, ArrowRightLeft } from 'lucide-react';
import { cn } from "@/lib/utils";
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
  { id: 'report', icon: Calendar, label: 'Laporan', side: 'left', path: '/reports' },
  { id: 'transactions', icon: StickyNote, label: 'Transaksi', side: 'right', path: '/transactions' },
  { id: 'loans', icon: ArrowRightLeft, label: 'Titipan', side: 'right', path: '/loans' },
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
      <div className="fixed bottom-4 md:bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="relative flex items-center justify-center w-full px-2 max-w-7xl">
          {/* LEFT PILL */}
          <div className="absolute right-[calc(50%+36px)] sm:right-[calc(50%+44px)] md:right-[calc(50%+54px)] lg:right-[calc(50%+64px)]">
            <motion.div layout className="bg-white/80 backdrop-blur-3xl rounded-[24px] md:rounded-[36px] shadow-2xl border border-white/60 pointer-events-auto flex items-center h-12 md:h-16 px-1.5 md:px-2 gap-0.5 md:gap-1">
              {navItems.filter(i => i.side === 'left').map((item) => (
                <motion.button
                  key={item.id}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-row-reverse items-center gap-1.5 md:gap-2 h-9 md:h-12 px-3 md:px-4.5 rounded-[16px] md:rounded-[22px] transition-all relative shrink-0",
                    activeNav === item.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-100/50"
                  )}
                  layout
                >
                  <item.icon className="size-4.5 md:size-5.5 shrink-0" />
                  <AnimatePresence mode="popLayout" initial={false}>
                    {(hoveredNav === item.id || activeNav === item.id) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0, x: 10 }}
                        animate={{ opacity: 1, width: "auto", x: 0 }}
                        exit={{ opacity: 0, width: 0, x: 10 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="text-[10px] md:text-[13px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
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
          <div className="z-50 pointer-events-auto shrink-0 relative">
            {/* Glowing Ring Effect */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-pink-400/30 rounded-full blur-xl -z-10"
            />
            
            <motion.button 
              onClick={() => setIsModalOpen(true)}
              animate={{ 
                y: [0, -8, 0],
                scaleX: [1, 1.05, 1],
                scaleY: [1, 0.95, 1]
              }}
              whileHover={{ 
                scale: 1.15,
                rotate: 180,
                transition: { duration: 0.4, ease: "backOut" }
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ 
                y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                scaleX: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                scaleY: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-pink-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(236,72,153,0.4)] text-white border-[5px] md:border-[7px] border-white active:bg-pink-600 transition-colors font-black relative overflow-hidden group"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Plus className="size-8 md:size-12" strokeWidth={5} />
              </motion.div>
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </div>

          {/* RIGHT PILL */}
          <div className="absolute left-[calc(50%+36px)] sm:left-[calc(50%+44px)] md:left-[calc(50%+54px)] lg:left-[calc(50%+64px)]">
            <motion.div layout className="bg-white/80 backdrop-blur-3xl rounded-[24px] md:rounded-[36px] shadow-2xl border border-white/60 pointer-events-auto flex items-center h-12 md:h-16 px-1.5 md:px-2 gap-0.5 md:gap-1">
              {navItems.filter(i => i.side === 'right').map((item) => (
                <motion.button
                  key={item.id}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-row items-center gap-1.5 md:gap-2 h-9 md:h-12 px-3 md:px-4.5 rounded-[16px] md:rounded-[22px] transition-all relative shrink-0",
                    activeNav === item.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-100/50"
                  )}
                  layout
                >
                  <item.icon className="size-4.5 md:size-5.5 shrink-0" />
                  <AnimatePresence mode="popLayout" initial={false}>
                    {(hoveredNav === item.id || activeNav === item.id) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0, x: -10 }}
                        animate={{ opacity: 1, width: "auto", x: 0 }}
                        exit={{ opacity: 0, width: 0, x: -10 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="text-[10px] md:text-[13px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
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
