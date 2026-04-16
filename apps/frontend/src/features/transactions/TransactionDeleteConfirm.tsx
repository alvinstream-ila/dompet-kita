import { AlertTriangle, Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TransactionDeleteConfirmProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => Promise<void>;
  readonly isPending: boolean;
}

export const TransactionDeleteConfirm: React.FC<
  TransactionDeleteConfirmProps
> = ({ isOpen, onClose, onConfirm, isPending }) => {
  const [confirmStep, setConfirmStep] = useState(0); // 0: initial, 1: second confirm

  const handleClose = () => {
    setConfirmStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="overflow-hidden rounded-[32px] border-none p-0 shadow-2xl sm:max-w-[400px]">
        <div className="space-y-6 p-8 text-center">
          <div className="group bg-red-stat/10 mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full">
            <AlertTriangle
              className={cn(
                'text-red-stat size-10 transition-all duration-300',
                confirmStep === 1
                  ? 'scale-125 animate-bounce'
                  : 'group-hover:scale-110'
              )}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tighter text-slate-800 uppercase">
              {confirmStep === 0 && 'Hapus Transaksi?'}
              {confirmStep === 1 && 'Yakin Banget Sayang?'}
            </h3>
            <p className="px-4 text-[13px] leading-relaxed font-bold text-slate-500">
              {confirmStep === 0 &&
                'Duh, beneran mau dihapus catatannya? Sayang lho datanya ilang nanti...'}
              {confirmStep === 1 &&
                'Oke, ini langkah terakhir ya sayang. Klik hapus kalau sudah yakin banget!'}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {confirmStep < 1 ? (
              <Button
                onClick={() => setConfirmStep(1)}
                className="bg-red-stat shadow-red-stat/20 hover:bg-red-stat/90 h-12 rounded-2xl text-[11px] font-black tracking-widest text-white uppercase shadow-lg transition-all active:scale-95"
              >
                IA, SAYA YAKIN
              </Button>
            ) : (
              <Button
                disabled={isPending}
                onClick={onConfirm}
                className="h-12 rounded-2xl bg-slate-900 text-[11px] font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-black active:scale-95"
              >
                {isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  'YA, HAPUS SEKARANG!'
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleClose}
              className="h-12 rounded-2xl text-[11px] font-bold tracking-widest text-slate-400 uppercase hover:bg-slate-50"
            >
              GAK JADI, BATALIN
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex h-1.5 w-full bg-slate-100">
          <div
            className={cn(
              'bg-red-stat h-full transition-all duration-500',
              confirmStep === 0 ? 'w-1/2' : 'w-full'
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
