import { create } from 'zustand';

interface SudoStore {
  isOpen: boolean;
  onSuccess: (() => void) | null;
  openSudo: (onSuccess: () => void) => void;
  closeSudo: () => void;
}

/**
 * Sovereign Sudo Store 🛡️
 * Mengelola state global untuk modal konfirmasi password (re-auth).
 * Digunakan oleh axios interceptor untuk memicu re-auth saat akses ditolak.
 */
export const useSudoStore = create<SudoStore>((set) => ({
  isOpen: false,
  onSuccess: null,
  openSudo: (onSuccess) => set({ isOpen: true, onSuccess }),
  closeSudo: () => set({ isOpen: false, onSuccess: null }),
}));
