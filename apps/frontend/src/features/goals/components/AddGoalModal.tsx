import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import type { Goal } from '@/types';
import { GoalForm } from './GoalForm';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[40px] border border-white bg-white/95 shadow-2xl backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute top-0 right-0 left-0 h-32 bg-linear-to-br from-blue-600/10 via-pink-500/5 to-transparent" />

          <div className="relative p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl leading-none font-black tracking-tight text-slate-800">
                  {goal ? 'Edit' : 'Mimpi'}{' '}
                  <span className="text-blue-600">
                    {goal ? 'Kamu' : 'Baru'}
                  </span>
                </h2>
                <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                  Ayo wujudkan satu per satu! ✨
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-slate-100"
              >
                <X className="h-6 w-6 text-slate-400" strokeWidth={3} />
              </Button>
            </div>

            <GoalForm goal={goal} onSuccess={onClose} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
