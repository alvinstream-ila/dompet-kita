import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReportPeriodPickerProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedMonth: number;
  selectedYear: number;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  months: string[];
  years: number[];
}

export const ReportPeriodPicker: React.FC<ReportPeriodPickerProps> = ({
  isOpen,
  onToggle,
  selectedMonth,
  selectedYear,
  onSelectMonth,
  onSelectYear,
  months,
  years,
}) => {
  return (
    <div className="group/period relative w-full md:w-auto">
      <button
        type="button"
        onClick={onToggle}
        className="group/btn flex h-16 w-full min-w-[320px] cursor-pointer items-center gap-5 overflow-hidden rounded-[28px] border border-slate-100/80 bg-white px-8 font-black text-slate-700 shadow-sm transition-all hover:border-blue-100 hover:bg-slate-50 md:w-auto"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 transition-transform group-hover/btn:scale-110">
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
            isOpen && 'rotate-180 text-blue-500'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute top-full right-0 left-0 z-60 mt-4 min-w-[340px] transform-gpu rounded-[40px] border border-white bg-white/95 p-6 shadow-2xl backdrop-blur-3xl"
          >
            <div className="grid h-72 grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <span className="mb-2 px-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  Pilih Bulan
                </span>
                <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-2">
                  {months.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => onSelectMonth(i)}
                      className={cn(
                        'w-full rounded-2xl px-5 py-3 text-left text-xs font-black tracking-widest uppercase transition-all',
                        selectedMonth === i
                          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      )}
                      type="button"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="mb-2 px-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  Pilih Tahun
                </span>
                <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => onSelectYear(y)}
                      className={cn(
                        'w-full rounded-2xl px-5 py-3 text-left text-xs font-black tracking-widest uppercase transition-all',
                        selectedYear === y
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      )}
                      type="button"
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
