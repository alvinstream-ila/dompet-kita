import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { GoalForm } from './GoalForm';
import type { Goal } from '@/types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, goal }) => {
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
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-br from-blue-600/10 via-pink-500/5 to-transparent pointer-events-none" />
          
          <div className="p-8 relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">
                  {goal ? 'Edit' : 'Mimpi'} <span className="text-blue-600">{goal ? 'Kamu' : 'Baru'}</span>
                </h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ayo wujudkan satu per satu! ✨</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                <X className="w-6 h-6 text-slate-400" strokeWidth={3} />
              </Button>
            </div>

            <GoalForm 
                goal={goal}
                onSuccess={onClose}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
