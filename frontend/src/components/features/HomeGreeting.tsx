import React from 'react';

interface HomeGreetingProps {
  desktopTitle?: string;
  mobileTitle?: string;
  mobileSubtitle?: string;
}

export const HomeGreeting: React.FC<HomeGreetingProps> = ({
  mobileTitle = "Sayang...",
  mobileSubtitle = "Demi Mimpi Indah Kita Bersama ❤️"
}) => {
  return (
    <>
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10 text-center">
         <div className="glass-premium py-4 h-auto md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl w-full transform-gpu border border-white/40">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
               <span className="font-script text-5xl md:text-8xl text-pink-500 block mb-1">{mobileTitle}</span>
               <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">{mobileSubtitle}</span>
            </h2>
         </div>
      </div>

      {/* Desktop Greeting */}
      <div className="hidden lg:flex glass-premium py-6 px-[58px] rounded-[40px] items-center justify-center shadow-2xl transition-transform hover:scale-105 transform-gpu border border-white/50 relative overflow-hidden group">
         <div className="absolute inset-0 bg-linear-to-r from-blue-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
         <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight relative z-10 flex items-center">
            <span className="font-script text-[5.5rem] mr-6 text-pink-500 block lg:inline-block leading-none transform -rotate-3 group-hover:rotate-0 transition-transform">Sayang,</span> 
            <div className="flex flex-col">
                <span className="text-slate-600 font-bold">Bangun Masa Depan Kita Yuk... ❤️</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1 opacity-60">Setiap langkah kecil sangat berarti ✨</span>
            </div>
         </h2>
      </div>
    </>
  );
};
