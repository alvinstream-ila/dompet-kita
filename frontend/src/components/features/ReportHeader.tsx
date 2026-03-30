import React from 'react';
import { UserNavDropdown } from '@/components/features/UserNavDropdown';

export const ReportHeader: React.FC = () => {
  return (
    <>
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
         <div className="glass-premium py-4 h-auto md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl w-full transform-gpu border border-white/50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">Cinta & Data</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Melihat Setiap Langkah Cuan Kita... 📊💖</span>
            </h2>
         </div>
      </div>

      <header className="flex items-center justify-between mb-10 gap-3">
         <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
               <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
                Laporan<span className="text-blue-600">Keuangan</span>
              </h1>
              <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em] font-mono">
                Monthly Highlights
              </span>
            </div>
         </div>

         {/* Desktop Greeting */}
         <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50 relative group overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight relative z-10 flex items-center">
               <span className="font-script text-[4rem] mr-4 text-pink-500 block lg:inline-block leading-none">Sayang,</span> 
               <div className="flex flex-col">
                  <span className="text-slate-600 font-bold">Ini Laporan Spesial Buat Masa Depan Kita... ✨</span>
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400 mt-1 opacity-60">Setiap Cuan Adalah Doa Kita 💖</span>
               </div>
               <span className="ml-2 inline-block animate-pulse">📊</span>
            </h2>
         </div>

         <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-full border border-slate-100/50 shadow-sm">
            <UserNavDropdown />
         </div>
      </header>
    </>
  );
};
