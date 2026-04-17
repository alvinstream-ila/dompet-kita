import Image from 'next/image';
import type React from 'react';
import { UserNavDropdown } from '@/components/layout';

export const ReportHeader: React.FC = () => {
  return (
    <>
      {/* Mobile Greeting */}
      <div className="mb-6 flex justify-center text-center md:mb-10 lg:hidden">
        <div className="glass-premium h-auto w-full transform-gpu items-center justify-center rounded-[24px] border border-white/50 px-6 py-4 shadow-2xl md:rounded-[32px] md:px-10 md:py-6">
          <h2 className="text-xl leading-tight font-black tracking-tight text-slate-800 md:text-3xl">
            <span className="font-script text-pink-primary mb-1 block text-5xl md:text-8xl">
              Cinta & Data
            </span>
            <span className="block text-xs font-bold tracking-normal text-slate-500 md:text-lg">
              Melihat Setiap Langkah Cuan Kita... 📊💖
            </span>
          </h2>
        </div>
      </div>

      <header className="mb-10 flex items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-sm md:h-12 md:w-12 md:rounded-2xl">
            <Image
              src="/logo-utama.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-sm leading-none font-black tracking-tight text-slate-800 uppercase md:text-2xl">
              Laporan<span className="text-blue-royal">Keuangan</span>
            </h1>
            <span className="font-mono text-[7px] font-black tracking-[0.2em] text-slate-500/80 uppercase md:text-[9px]">
              Monthly Highlights
            </span>
          </div>
        </div>

        {/* Desktop Greeting */}
        <div className="glass-premium group relative hidden transform-gpu items-center justify-center overflow-hidden rounded-[40px] border border-white/50 px-[58px] py-6 shadow-2xl transition-transform hover:scale-105 lg:flex">
          <div className="absolute inset-0 bg-linear-to-r from-blue-50/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <h2 className="relative z-10 flex items-center text-2xl font-black tracking-tight whitespace-nowrap text-slate-800">
            <span className="font-script text-pink-primary mr-4 block text-[4rem] leading-none lg:inline-block">
              Sayang,
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-slate-600">
                Ini Laporan Spesial Buat Masa Depan Kita... ✨
              </span>
              <span className="mt-1 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase opacity-60">
                Setiap Cuan Adalah Doa Kita 💖
              </span>
            </div>
            <span className="ml-2 inline-block animate-pulse">📊</span>
          </h2>
        </div>

        <div className="flex items-center gap-4 rounded-full border border-slate-100/50 bg-white/50 p-2 shadow-sm backdrop-blur-md">
          <UserNavDropdown />
        </div>
      </header>
    </>
  );
};
