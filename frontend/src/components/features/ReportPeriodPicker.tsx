import React from 'react';
import { 
  Calendar, 
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

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
  years
}) => {
  return (
    <div className="relative group/period w-full md:w-auto">
      <button 
        type="button"
        onClick={onToggle}
        className="bg-white border border-slate-100/80 rounded-[28px] px-8 h-16 flex items-center gap-5 shadow-sm min-w-[320px] cursor-pointer hover:bg-slate-50 hover:border-blue-100 transition-all font-black text-slate-700 w-full md:w-auto group/btn transition-colors overflow-hidden"
      >
        <div className="size-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover/btn:scale-110 transition-transform">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-start leading-none gap-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode Laporan</span>
          <span className="text-sm font-black text-slate-800 tracking-tight">{months[selectedMonth]} {selectedYear}</span>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-slate-300 ml-auto transition-all", isOpen && "rotate-180 text-blue-500")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-4 p-6 bg-white/95 backdrop-blur-3xl border border-white rounded-[40px] shadow-2xl z-60 min-w-[340px] transform-gpu"
          >
            <div className="grid grid-cols-2 gap-8 h-72">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Pilih Bulan</span>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
                  {months.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => onSelectMonth(i)}
                      className={cn(
                        "w-full text-left px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                        selectedMonth === i 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Pilih Tahun</span>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => onSelectYear(y)}
                      className={cn(
                        "w-full text-left px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                        selectedYear === y 
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      )}
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
