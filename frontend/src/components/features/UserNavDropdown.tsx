import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LogOut, 
  Settings, 
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AccountSettingsModal } from './AccountSettingsModal';

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
          className="h-10 md:h-12 px-2 md:px-3 rounded-full bg-white shadow-sm border-slate-100 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group overflow-hidden p-1.5"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full shadow-sm overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 bg-blue-50">
            <div className="w-full h-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[12px] md:text-[14px] font-black">
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform hidden md:block" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 rounded-[24px] shadow-2xl border-none bg-white/95 backdrop-blur-xl mt-2" align="end">
        <div className="p-4 border-b border-slate-50 mb-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account</p>
          <div className="flex flex-col">
            <p className="text-sm font-black text-slate-800 tracking-tight truncate">
              {user?.name || user?.email?.split('@')[0] || 'Pengguna'}
            </p>
            {user?.email && (
              <p className="text-[9px] font-bold text-slate-400 truncate opacity-70">
                {user.email}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <button 
            onClick={() => {
              setInitialTab('profile');
              setIsSettingsOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Settings className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Pengaturan</span>
              <span className="text-[10px] text-slate-400 font-medium">Preferensi aplikasi</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setInitialTab('privacy');
              setIsSettingsOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Privasi</span>
              <span className="text-[10px] text-slate-400 font-medium">Data & Keamanan</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setInitialTab('preferences');
              setIsSettingsOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
              <Settings className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Preferensi</span>
              <span className="text-[10px] text-slate-400 font-medium">Tampilan & Siklus</span>
            </div>
          </button>
        </div>

        <div className="mt-1 pt-1 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-red-600">Keluar</span>
              <span className="text-[10px] text-red-400 font-medium">Selesai sesi ini</span>
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
