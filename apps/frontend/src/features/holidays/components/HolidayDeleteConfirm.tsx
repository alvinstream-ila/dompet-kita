import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Holiday } from '../hooks/useHolidays';

interface HolidayDeleteConfirmProps {
  readonly holiday: Holiday | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export const HolidayDeleteConfirm: React.FC<HolidayDeleteConfirmProps> = ({
  holiday,
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[32px] border-none bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <AlertTriangle className="size-8 animate-bounce" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">
              Hapus Rencana Liburan? 💔
            </DialogTitle>
            <p className="mt-2 leading-relaxed font-bold text-slate-500">
              <span className="font-black text-slate-800">
                {holiday?.destination}
              </span>{' '}
              ? Sayang banget lho kalau dihapus, nanti kangen momennia...
            </p>
          </DialogHeader>
        </div>
        <DialogFooter className="flex gap-4 pt-6">
          <Button
            variant="ghost"
            className="h-14 flex-1 rounded-2xl font-black tracking-widest text-slate-400 uppercase"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            className="h-14 flex-1 rounded-2xl bg-rose-500 font-black tracking-widest text-white uppercase shadow-xl shadow-rose-100 hover:bg-rose-600"
            onClick={onConfirm}
          >
            Hapus Saja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
