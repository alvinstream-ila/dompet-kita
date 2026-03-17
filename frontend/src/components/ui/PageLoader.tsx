import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, WifiOff } from 'lucide-react';

interface PageLoaderProps {
  isLoading: boolean;
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  isLoading,
  message = "Sedang merajut masa depan indah kita..."
}) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-99999 flex items-center justify-center bg-white/95 backdrop-blur-3xl"
        >
          <div className="flex flex-col items-center gap-12 p-12 max-w-lg text-center transform-gpu">
            {/* Main Animation Container */}
            <div className="relative">
              {/* Spinning Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 rounded-full border-4 border-transparent border-t-pink-500 border-b-blue-400 opacity-30 shadow-2xl shadow-pink-500/20"
              />

              {/* Floating Icons */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    y: [0, -15, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-white p-8 rounded-full shadow-[0_0_60px_rgba(236,72,153,0.4)] border border-pink-50"
                >
                  <Heart className="w-16 h-16 text-pink-500 fill-pink-500" />
                </motion.div>
              </div>

              {/* Smaller Orbiting Hearts */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 12 + i * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                    style={{ transform: `rotate(${angle}deg) translateY(-85px)` }}
                    className="absolute"
                  >
                    <div className="bg-white p-2 rounded-full shadow-lg text-blue-400 border border-blue-50">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Loading text with transition */}
            <div className="space-y-4">
              <motion.h3
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="font-script text-6xl text-slate-800 leading-normal"
              >
                Sebentar Ya Sayangku...
              </motion.h3>

              <AnimatePresence mode="wait">
                {isOffline ? (
                  <motion.div
                    key="offline"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex items-center gap-3 text-amber-600 font-bold bg-amber-50 px-6 py-3 rounded-full border border-amber-100 shadow-sm">
                      <WifiOff className="w-5 h-5" />
                      <span className="text-lg">Sinyalnya Lagi Ngambek Nih 🥺</span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium italic px-10">
                      Sabar ya cintaku, aku lagi usaha sekuat tenaga hubungin dunia luar buat kamu...
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="online"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="text-slate-500 font-bold tracking-widest text-base uppercase px-12 leading-relaxed"
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
