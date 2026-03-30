import React from 'react';
import { 
  AlertTriangle 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Holiday } from '@/hooks/useHolidays';

interface HolidayDeleteConfirmProps {
  holiday: Holiday | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const HolidayDeleteConfirm: React.FC<HolidayDeleteConfirmProps> = ({
  holiday,
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[32px] p-8 border-none bg-white shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="size-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
            <AlertTriangle className="size-8 animate-bounce" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Hapus Rencana Liburan? 💔</DialogTitle>
            <p className="text-slate-500 font-bold mt-2 leading-relaxed">
              Yakin mau menghapus rencana ke <span className="text-slate-800 font-black">{holiday?.destination}</span>? Sayang banget lho kalau dihapus...
            </p>
          </DialogHeader>
        </div>
        <DialogFooter className="flex gap-4 pt-6">
          <Button 
            variant="ghost" 
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400" 
            onClick={onClose}
          >
            Batal
          </Button>
          <Button 
            variant="destructive"
            className="flex-1 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 font-black uppercase tracking-widest text-white shadow-xl shadow-rose-100"
            onClick={onConfirm}
          >
            Hapus Saja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
