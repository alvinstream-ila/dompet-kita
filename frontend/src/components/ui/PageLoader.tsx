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
  message = 'Sedang merajut masa depan indah kita...',
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
          <div className="flex max-w-lg transform-gpu flex-col items-center gap-12 p-12 text-center">
            {/* Main Animation Container */}
            <div className="relative">
              {/* Spinning Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                className="h-48 w-48 rounded-full border-4 border-transparent border-t-pink-500 border-b-blue-400 opacity-30 shadow-2xl shadow-pink-500/20"
              />

              {/* Floating Icons */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="rounded-full border border-pink-50 bg-white p-8 shadow-[0_0_60px_rgba(236,72,153,0.4)]"
                >
                  <Heart className="h-16 w-16 fill-pink-500 text-pink-500" />
                </motion.div>
              </div>

              {/* Smaller Orbiting Hearts */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 12 + i * 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="pointer-events-none absolute inset-0"
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                    style={{
                      transform: `rotate(${angle}deg) translateY(-85px)`,
                    }}
                    className="absolute"
                  >
                    <div className="rounded-full border border-blue-50 bg-white p-2 text-blue-400 shadow-lg">
                      <Heart className="h-5 w-5 fill-current" />
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
                className="font-script text-6xl leading-normal text-slate-800"
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
                    <div className="flex items-center gap-3 rounded-full border border-amber-100 bg-amber-50 px-6 py-3 font-bold text-amber-600 shadow-sm">
                      <WifiOff className="h-5 w-5" />
                      <span className="text-lg">
                        Sinyalnya Lagi Ngambek Nih 🥺
                      </span>
                    </div>
                    <p className="px-10 text-sm font-medium text-slate-400 italic">
                      Sabar ya cintaku, aku lagi usaha sekuat tenaga hubungin
                      dunia luar buat kamu...
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="online"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="px-12 text-base leading-relaxed font-bold tracking-widest text-slate-500 uppercase"
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
