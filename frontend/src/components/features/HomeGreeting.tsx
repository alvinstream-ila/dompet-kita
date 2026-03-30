import React from 'react';

interface HomeGreetingProps {
  desktopTitle?: string;
  mobileTitle?: string;
  mobileSubtitle?: string;
}

export const HomeGreeting: React.FC<HomeGreetingProps> = ({
  mobileTitle = 'Sayang...',
  mobileSubtitle = 'Demi Mimpi Indah Kita Bersama ❤️',
}) => {
  return (
    <>
      {/* Mobile Greeting */}
      <div className="mb-6 flex justify-center text-center md:mb-10 lg:hidden">
        <div className="glass-premium h-auto w-full transform-gpu items-center justify-center rounded-[24px] border border-white/40 px-6 py-4 shadow-2xl md:rounded-[32px] md:px-10 md:py-6">
          <h2 className="text-xl leading-tight font-black tracking-tight text-slate-800 md:text-3xl">
            <span className="font-script mb-1 block text-5xl text-pink-500 md:text-8xl">
              {mobileTitle}
            </span>
            <span className="block text-xs font-bold tracking-normal text-slate-500 md:text-lg">
              {mobileSubtitle}
            </span>
          </h2>
        </div>
      </div>

      {/* Desktop Greeting */}
      <div className="glass-premium group relative hidden transform-gpu items-center justify-center overflow-hidden rounded-[40px] border border-white/50 px-[58px] py-6 shadow-2xl transition-transform hover:scale-105 lg:flex">
        <div className="absolute inset-0 bg-linear-to-r from-blue-50/50 to-pink-50/50 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <h2 className="relative z-10 flex items-center text-2xl font-black tracking-tight whitespace-nowrap text-slate-800">
          <span className="font-script mr-6 block -rotate-3 transform text-[5.5rem] leading-none text-pink-500 transition-transform group-hover:rotate-0 lg:inline-block">
            Sayang,
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-slate-600">
              Bangun Masa Depan Kita Yuk... ❤️
            </span>
            <span className="mt-1 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase opacity-60">
              Setiap langkah kecil sangat berarti ✨
            </span>
          </div>
        </h2>
      </div>
    </>
  );
};
