'use client';

import { ChevronDown, LogOut, Settings, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/features/auth';
import { AccountSettingsModal } from '@/features/settings';

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
          className="group flex h-10 items-center gap-2 overflow-hidden rounded-full border-slate-100 bg-white p-1.5 px-2 shadow-sm transition-all hover:scale-110 active:scale-95 md:h-12 md:px-3"
        >
          <div className="bg-blue-royal/10 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 shadow-sm md:h-8 md:w-8">
            <div className="from-blue-royal flex h-full w-full items-center justify-center bg-linear-to-br to-[#3a5bd9] text-[12px] font-black text-white md:text-[14px]">
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 transition-transform group-data-[state=open]:rotate-180 md:block" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="mt-2 w-64 rounded-[24px] border-none bg-white/95 p-2 shadow-2xl backdrop-blur-xl"
        align="end"
      >
        <div className="mb-1 border-b border-slate-50 p-4">
          <p className="mb-1 text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
            Account
          </p>
          <div className="flex flex-col">
            <p className="truncate text-sm font-black tracking-tight text-slate-800">
              {user?.name || user?.email?.split('@')[0] || 'Pengguna'}
            </p>
            {user?.email && (
              <p className="truncate text-[9px] font-bold text-slate-400 opacity-70">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setInitialTab('profile');
              setIsSettingsOpen(true);
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="group-hover:bg-blue-royal/10 group-hover:text-blue-royal flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors">
              <Settings className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">
                Pengaturan
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Preferensi aplikasi
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setInitialTab('privacy');
              setIsSettingsOpen(true);
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="group-hover:bg-green-stat/10 group-hover:text-green-stat flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Privasi</span>
              <span className="text-[10px] font-medium text-slate-400">
                Data & Keamanan
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setInitialTab('preferences');
              setIsSettingsOpen(true);
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600">
              <Settings className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">
                Preferensi
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Tampilan & Siklus
              </span>
            </div>
          </button>
        </div>

        <div className="mt-1 border-t border-slate-50 pt-1">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-red-50"
          >
            <div className="group-hover:bg-red-stat/10 group-hover:text-red-stat flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors">
              <LogOut className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-red-stat text-sm font-bold">Keluar</span>
              <span className="text-red-stat text-[10px] font-medium opacity-70">
                Selesai sesi ini
              </span>
            </div>
          </button>
        </div>
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

UserNavDropdown.displayName = 'UserNavDropdown';
