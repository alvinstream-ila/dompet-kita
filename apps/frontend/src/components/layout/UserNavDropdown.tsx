'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/features/auth';
import { AccountSettingsModal } from '@/features/settings';
import { cn } from '@/lib/utils';

export const UserNavDropdown = React.memo(() => {
  const { user, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialTab, setInitialTab] = useState('profile');

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="group flex h-10 items-center gap-2 overflow-hidden rounded-full border-white/40 bg-white/70 p-1.5 px-2 shadow-xs backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95 md:h-12 md:px-3"
        >
          <div className="bg-blue-royal/10 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/50 shadow-sm md:h-8 md:w-8">
            <div className="from-blue-royal flex h-full w-full items-center justify-center bg-linear-to-br to-[#3a5bd9] text-[12px] font-black text-white md:text-[14px]">
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 transition-transform group-data-[state=open]:rotate-180 md:block" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="mt-3 w-72 overflow-hidden rounded-[28px] border border-white/20 bg-white/60 p-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl"
        align="end"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Header Section */}
          <div className="relative overflow-hidden p-6 pb-4">
            <p className="mb-2 text-[10px] leading-none font-black tracking-[0.15em] text-slate-400 uppercase">
              Sovereign Account
            </p>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-base font-black tracking-tight text-slate-900">
                  {user?.name || user?.email?.split('@')[0] || 'Pengguna'}
                </p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-blue-royal/10 text-blue-royal flex h-4 w-4 items-center justify-center rounded-full"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 stroke-[3px]" />
                </motion.div>
              </div>
              {user?.email && (
                <p className="truncate text-[11px] font-medium text-slate-400">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Menu Actions */}
          <div className="space-y-0.5 px-3 pb-3">
            <MenuItem
              icon={<Settings className="h-4 w-4" />}
              label="Pengaturan"
              description="Preferensi aplikasi"
              gradient="from-blue-400/20 to-indigo-500/20"
              iconColor="text-blue-600"
              onClick={() => {
                setInitialTab('profile');
                setIsSettingsOpen(true);
              }}
            />

            <MenuItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Privasi"
              description="Data & Keamanan"
              gradient="from-emerald-400/20 to-teal-500/20"
              iconColor="text-emerald-600"
              onClick={() => {
                setInitialTab('privacy');
                setIsSettingsOpen(true);
              }}
            />

            <MenuItem
              icon={<Settings className="h-4 w-4" />}
              label="Preferensi"
              description="Tampilan & Siklus"
              gradient="from-amber-400/20 to-orange-500/20"
              iconColor="text-amber-600"
              onClick={() => {
                setInitialTab('preferences');
                setIsSettingsOpen(true);
              }}
            />
          </div>

          {/* Logout Section */}
          <div className="bg-white/40 p-3 pt-2 backdrop-blur-xs">
            <MenuItem
              icon={<LogOut className="h-4 w-4" />}
              label="Keluar"
              description="Selesai sesi ini"
              gradient="from-red-400/20 to-rose-500/20"
              iconColor="text-red-600"
              isDanger
              onClick={handleLogout}
            />
          </div>
        </motion.div>
      </PopoverContent>

      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        defaultTab={initialTab}
      />
    </Popover>
  );
});

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  gradient: string;
  iconColor: string;
  isDanger?: boolean;
  onClick: () => void;
}

const MenuItem = ({
  icon,
  label,
  description,
  gradient,
  iconColor,
  isDanger,
  onClick,
}: MenuItemProps) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    onClick={onClick}
    className={cn(
      'group flex w-full items-center gap-3.5 rounded-[20px] p-2.5 text-left transition-all',
      isDanger ? 'hover:bg-red-stat/5' : 'hover:bg-white/60 hover:shadow-sm'
    )}
  >
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br shadow-xs transition-transform group-hover:scale-110',
        gradient,
        iconColor
      )}
    >
      {icon}
    </div>
    <div className="flex flex-col">
      <span
        className={cn(
          'text-[13px] font-black tracking-tight',
          isDanger ? 'text-red-stat' : 'text-slate-800'
        )}
      >
        {label}
      </span>
      <span className="text-[10px] font-bold text-slate-400/80">
        {description}
      </span>
    </div>
  </motion.button>
);

UserNavDropdown.displayName = 'UserNavDropdown';
