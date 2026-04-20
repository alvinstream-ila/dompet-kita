'use client';

import { SudoConfirmDialog } from '@/components/ui/SudoConfirmDialog';
import { useSudoStore } from '../hooks/useSudoStore';

/**
 * GlobalSudoModal 🛡️
 * Wrapper untuk SudoConfirmDialog yang terhubung dengan global store.
 * Diletakkan di Providers agar tersedia di seluruh aplikasi.
 */
export const GlobalSudoModal = () => {
  const { isOpen, closeSudo, onSuccess } = useSudoStore();

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <SudoConfirmDialog
      isOpen={isOpen}
      onClose={closeSudo}
      onSuccess={handleSuccess}
    />
  );
};
