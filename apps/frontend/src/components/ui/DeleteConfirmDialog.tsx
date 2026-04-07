import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Hapus Data?',
  description = 'Duh, beneran mau dihapus catatannya? Sayang lho datanya ilang nanti...',
  confirmLabel = 'YA, HAPUS SEKARANG!',
  loading = false,
}) => {
  const [confirmStep, setConfirmStep] = useState(0);

  const handleConfirm = async () => {
    if (confirmStep === 0) {
      setConfirmStep(1);
    } else {
      await onConfirm();
      setConfirmStep(0);
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="overflow-hidden rounded-[32px] border-none p-0 shadow-2xl sm:max-w-[400px]">
        <div className="space-y-6 p-8 text-center">
          <div className="group mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle
              className={cn(
                'size-10 text-red-500 transition-all duration-300',
                confirmStep === 1
                  ? 'scale-125 animate-bounce'
                  : 'group-hover:scale-110'
              )}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tighter text-slate-800 uppercase">
              {confirmStep === 0 ? title : 'Yakin Banget Sayang?'}
            </h3>
            <p className="px-4 text-[13px] leading-relaxed font-bold text-slate-500">
              {confirmStep === 0
                ? description
                : 'Oke, ini langkah terakhir ya sayang. Klik hapus kalau sudah yakin banget!'}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              disabled={loading}
              onClick={handleConfirm}
              className={cn(
                'h-12 rounded-2xl text-[11px] font-black tracking-widest uppercase shadow-lg transition-all active:scale-95',
                confirmStep === 0
                  ? 'bg-red-500 shadow-red-200 hover:bg-red-600'
                  : 'bg-slate-900 hover:bg-black'
              )}
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : confirmStep === 0 ? (
                'IA, SAYA YAKIN'
              ) : (
                confirmLabel
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleClose}
              className="h-12 rounded-2xl text-[11px] font-bold tracking-widest text-slate-400 uppercase hover:bg-slate-50"
            >
              GAK JADI, BATALIN
            </Button>
          </div>
        </div>

        <div className="flex h-1.5 w-full bg-slate-100">
          <div
            className={cn(
              'h-full bg-red-500 transition-all duration-500',
              confirmStep === 0 ? 'w-1/2' : 'w-full'
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
