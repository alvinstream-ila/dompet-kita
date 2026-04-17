import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface ReportPeriodPickerProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedMonth: number;
  selectedYear: number;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  months: string[];
}

export const ReportPeriodPicker: React.FC<ReportPeriodPickerProps> = ({
  isOpen,
  onToggle,
  selectedMonth,
  selectedYear,
  onSelectMonth,
  onSelectYear,
  months,
}) => {
  return (
    <div className="group/period relative w-full md:w-auto">
      <button
        type="button"
        onClick={onToggle}
        className="group/btn hover:border-blue-royal/30 flex h-16 w-full min-w-[320px] cursor-pointer items-center gap-5 overflow-hidden rounded-[28px] border border-slate-100/80 bg-white px-8 font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50 md:w-auto"
      >
        <div className="bg-blue-royal/10 text-blue-royal flex size-10 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover/btn:scale-110">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-start gap-1 leading-none">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Periode Laporan
          </span>
          <span className="text-sm font-black tracking-tight text-slate-800">
            {months[selectedMonth]} {selectedYear}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'ml-auto h-5 w-5 text-slate-300 transition-all',
            isOpen && 'text-blue-royal rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute top-full right-0 left-0 z-60 mt-4 min-w-[340px] transform-gpu overflow-hidden rounded-[40px] border border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur-3xl"
          >
            {/* Year Navigation Header */}
            <div className="mb-8 flex items-center justify-between px-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectYear(selectedYear - 1);
                }}
                className="hover:bg-blue-royal/10 hover:text-blue-royal flex size-10 items-center justify-center rounded-xl text-slate-400 transition-all active:scale-90"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">
                  Tahun
                </span>
                <span className="text-xl font-black tracking-tight text-slate-800">
                  {selectedYear}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectYear(selectedYear + 1);
                }}
                className="hover:bg-blue-royal/10 hover:text-blue-royal flex size-10 items-center justify-center rounded-xl text-slate-400 transition-all active:scale-90"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Month Grid (3x4) */}
            <div className="grid grid-cols-3 gap-3">
              {months.map((m, i) => (
                <button
                  key={m}
                  onClick={() => onSelectMonth(i)}
                  className={cn(
                    'group/month relative flex h-14 items-center justify-center rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all duration-300',
                    selectedMonth === i
                      ? 'bg-blue-royal ring-blue-royal/10 text-white shadow-[0_10px_25px_-5px_rgba(65,105,225,0.4)] ring-4'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  )}
                  type="button"
                >
                  <span className="relative z-10">{m.substring(0, 3)}</span>
                  {selectedMonth === i && (
                    <motion.div
                      layoutId="activeMonth"
                      className="absolute inset-x-0 top-0 bottom-0 rounded-2xl bg-white/10"
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
