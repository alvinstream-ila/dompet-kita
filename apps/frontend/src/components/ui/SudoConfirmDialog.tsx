'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import api from '@/lib/axios';
import { isAxiosError } from 'axios';

interface SudoConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * SudoConfirmDialog — The Security Gatekeeper 🛡️
 * Premium glassmorphism dialog for re-authentication.
 */
export const SudoConfirmDialog: React.FC<SudoConfirmDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    try {
      await api.post('/sudo/confirm', { password });
      toast.success('Sudo Mode aktif! Melanjutkan aksi... 🛡️');
      onSuccess();
      setPassword('');
      onClose();
    } catch (error: unknown) {
      const message =
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Password salah sayang. 🥺';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && onClose()}
    >
      <DialogContent className="overflow-hidden rounded-[32px] border-none bg-white/80 p-0 shadow-2xl backdrop-blur-xl sm:max-w-[400px]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative p-8 text-center"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-blue-royal/10 text-blue-royal rounded-full px-2 py-1 text-[8px] font-black tracking-widest uppercase">
                  Secure Session
                </div>
              </div>

              <div className="bg-blue-royal/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <motion.div
                  animate={isLoading ? { rotate: [0, 15, -15, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <ShieldCheck className="text-blue-royal h-10 w-10" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-slate-800">
                  Konfirmasi <span className="text-blue-royal">Sudo</span>
                </h3>
                <p className="px-4 text-xs leading-relaxed font-medium text-slate-500">
                  Sayang, demi keamanan harta karun kita, masukkan password dulu
                  ya buat lanjutin aksi ini. 🔐
                </p>
              </div>

              <form onSubmit={handleConfirm} className="mt-8 space-y-4">
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="group-focus-within:text-blue-royal h-4 w-4 text-slate-400 transition-colors" />
                  </div>
                  <input
                    autoFocus
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password..."
                    className="focus:ring-blue-royal/20 h-14 w-full rounded-2xl border-none bg-slate-100 pr-4 pl-11 text-sm font-bold text-slate-900 transition-all focus:ring-2 focus:outline-hidden"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading || !password}
                    className="bg-blue-royal shadow-blue-royal/20 h-14 w-full rounded-2xl text-xs font-black tracking-widest uppercase shadow-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'AKTIFKAN SUDO MODE ✨'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                    className="h-12 rounded-2xl text-[10px] font-bold tracking-widest text-slate-400 uppercase hover:bg-slate-50/50"
                  >
                    GAK JADI, BATALIN
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex h-1.5 w-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 15 * 60, ease: 'linear' }}
            className="bg-blue-royal h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
