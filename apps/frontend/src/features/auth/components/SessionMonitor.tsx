'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuth } from '../context/AuthContext';

/**
 * Sovereign Session Monitor
 * Menjaga sesi tetap aktif selama ada aktivitas (Sliding Window)
 * dan memberikan peringatan sebelum sesi berakhir.
 */

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

const IDLE_TIMEOUT = 30 * MINUTES;
const WARNING_THRESHOLD = 1 * MINUTES;
const ACTIVITY_THROTTLE = 30 * SECONDS;

export const SessionMonitor = () => {
  const { user, logout, isAuthenticated } = useAuth();

  // Initialize with 0 and hydrate in useEffect to stay pure during render/prerender
  const lastActivityRef = useRef<number>(0);

  const [isWarningShown, setIsWarningShown] = useState(false);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isWarningShown) {
      setIsWarningShown(false);
      toast.dismiss('session-warning');
    }
  }, [isWarningShown]);

  const handleManualRefresh = useCallback(async () => {
    try {
      // Panggil API user untuk memperbarui last_used_at di server
      await api.get('/user');
      resetTimer();
      toast.success('Sesi kamu sudah diperpanjang, Sayang! ✨', {
        id: 'session-refresh-success',
      });
    } catch (error) {
      console.error('Sovereign Auth: Gagal memperpanjang sesi', error);
      logout();
    }
  }, [logout, resetTimer]);

  useEffect(() => {
    // Hydrate the ref on first client-side load
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Use direct undefined check as recommended by Biome for globalThis properties
    if (globalThis.window === undefined) return;

    const events = [
      'mousemove',
      'mousedown',
      'scroll',
      'keydown',
      'touchstart',
    ];

    const throttledReset = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > ACTIVITY_THROTTLE) {
        resetTimer();
      }
    };

    const win = globalThis.window;
    for (const event of events) {
      win.addEventListener(event, throttledReset);
    }

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      // Skip if we haven't hydrated yet
      if (lastActivityRef.current === 0) return;

      // 1. Cek jika sudah benar-benar kadaluwarsa
      if (elapsed >= IDLE_TIMEOUT) {
        toast.error(
          'Sayang, sesi kamu berakhir karena kelamaan nggak ada aktivitas. 🌸',
          {
            id: 'session-expired',
            duration: 5000,
          }
        );
        logout();
      }
      // 2. Cek jika mendekati waktu kadaluwarsa (1 menit terakhir)
      else if (elapsed >= IDLE_TIMEOUT - WARNING_THRESHOLD && !isWarningShown) {
        setIsWarningShown(true);
        toast.warning(
          'Sayang, sesi kamu mau habis nih. Masih mau lanjut kelola harta karun bareng aku? 🌸',
          {
            id: 'session-warning',
            duration: WARNING_THRESHOLD,
            action: {
              label: 'Lanjutkan',
              onClick: handleManualRefresh,
            },
          }
        );
      }
    }, 10000); // Cek setiap 10 detik

    return () => {
      for (const event of events) {
        win.removeEventListener(event, throttledReset);
      }
      clearInterval(checkInterval);
    };
  }, [
    isAuthenticated,
    user,
    isWarningShown,
    logout,
    resetTimer,
    handleManualRefresh,
  ]);

  return null;
};
