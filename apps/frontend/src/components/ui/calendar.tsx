'use client';

import { setMonth, setYear } from 'date-fns';
import { id } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import * as React from 'react';
import {
  DayPicker,
  type DayPickerProps,
  getDefaultClassNames,
} from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// --- Context for Sovereign Navigation ---
type CalendarView = 'days' | 'months' | 'years';

interface CalendarContextValue {
  view: CalendarView;
  setView: (view: CalendarView) => void;
  navDate: Date;
  setNavDate: (date: Date) => void;
}

const CalendarContext = React.createContext<CalendarContextValue | undefined>(
  undefined
);

function useCalendarContext() {
  const context = React.useContext(CalendarContext);
  if (!context)
    throw new Error('useCalendarContext must be used within Calendar');
  return context;
}

// --- Types ---
export type CalendarProps = DayPickerProps & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
};

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Sovereign Premium Calendar v2.2 🎆
 * - Uses Context API to resolve nested component warnings.
 * - Optimized for Type-Safety with union props.
 * - Clean zero-warning architecture.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Use any cast for initialization to handle DayPicker union props safely
  const initialDate =
    'selected' in props && props.selected instanceof Date
      ? props.selected
      : props.month || new Date();

  const [view, setView] = React.useState<CalendarView>('days');
  const [navDate, setNavDate] = React.useState<Date>(initialDate);

  const contextValue = React.useMemo(
    () => ({
      view,
      setView,
      navDate,
      setNavDate,
    }),
    [view, navDate]
  );

  return (
    <CalendarContext.Provider value={contextValue}>
      <div
        className={cn(
          'bg-background/80 relative overflow-hidden rounded-2xl border p-2 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl',
          className
        )}
      >
        <AnimatePresence mode="wait">
          {view === 'days' && (
            <motion.div
              key="days"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <SovereignDayPicker
                props={props}
                showOutsideDays={showOutsideDays}
                classNames={classNames}
              />
            </motion.div>
          )}

          {view === 'months' && <MonthPicker />}

          {view === 'years' && <YearPicker />}
        </AnimatePresence>
      </div>
    </CalendarContext.Provider>
  );
}

// --- Specialized Components ---

function SovereignDayPicker({
  props,
  showOutsideDays,
  classNames,
}: {
  readonly props: DayPickerProps;
  readonly showOutsideDays: boolean;
  readonly classNames?: DayPickerProps['classNames'];
}) {
  const { navDate, setNavDate } = useCalendarContext();
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      month={navDate}
      onMonthChange={setNavDate}
      showOutsideDays={showOutsideDays}
      className="group/calendar"
      locale={id}
      classNames={{
        ...defaultClassNames,
        root: cn('w-[248px]', defaultClassNames.root),
        months: cn('relative flex flex-col gap-3', defaultClassNames.months),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between z-20 px-1 pointer-events-none',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
          'border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg pointer-events-auto',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
          'border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg pointer-events-auto',
          defaultClassNames.button_next
        ),
        month_caption: 'relative z-30 flex justify-center mb-3 pt-0.5',
        caption_label: 'hidden',
        table: 'w-full border-collapse',
        weekdays: 'grid grid-cols-7 mb-1',
        weekday:
          'text-[9px] font-black text-slate-400/80 uppercase text-center tracking-tighter',
        weeks: 'flex flex-col gap-0.5',
        week: 'grid grid-cols-7 w-full',
        day: cn(
          'relative p-0 flex items-center justify-center text-xs font-medium focus-within:relative focus-within:z-20 h-8 w-full transition-all hover:scale-105',
          defaultClassNames.day
        ),
        today: 'bg-blue-royal/5 text-blue-royal font-black rounded-lg',
        outside: 'text-slate-200 opacity-40 grayscale',
        selected:
          'bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white rounded-lg shadow-sm font-bold',
        ...classNames,
      }}
      components={{
        CaptionLabel: SovereignCaptionLabel,
        Chevron: SovereignChevron,
      }}
      {...props}
    />
  );
}

function SovereignCaptionLabel() {
  const { navDate, setNavDate, setView } = useCalendarContext();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 80 + i);

  return (
    <div className="flex items-center gap-0.5">
      <Select
        value={navDate.getMonth().toString()}
        onValueChange={(val) =>
          setNavDate(setMonth(navDate, Number.parseInt(val, 10)))
        }
      >
        <SelectTrigger
          size="sm"
          className="h-7 border-none bg-transparent px-1.5 py-0 text-xs font-black tracking-tight text-slate-800 hover:bg-slate-100 focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-slate-100"
        >
          <span className="truncate">{months[navDate.getMonth()]}</span>
          <ChevronDownIcon className="size-3 text-slate-300" />
        </SelectTrigger>
        <SelectContent align="start" className="max-h-64 min-w-[120px]">
          {months.map((m, i) => (
            <SelectItem key={m} value={i.toString()} className="text-xs">
              {m}
            </SelectItem>
          ))}
          <button
            type="button"
            className="hover:text-blue-royal focus:text-blue-royal mt-1 flex w-full cursor-pointer border-t px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase transition-colors outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setView('months');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setView('months');
              }
            }}
          >
            Visual Grid
          </button>
        </SelectContent>
      </Select>

      <Select
        value={navDate.getFullYear().toString()}
        onValueChange={(val) =>
          setNavDate(setYear(navDate, Number.parseInt(val, 10)))
        }
      >
        <SelectTrigger
          size="sm"
          className="h-7 border-none bg-transparent px-1 py-0 text-xs font-black tracking-tight text-slate-800 hover:bg-slate-100 focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-slate-100"
        >
          <span>{navDate.getFullYear()}</span>
        </SelectTrigger>
        <SelectContent align="center" className="max-h-64 min-w-[80px]">
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()} className="text-xs">
              {y}
            </SelectItem>
          ))}
          <button
            type="button"
            className="hover:text-blue-royal focus:text-blue-royal mt-1 flex w-full cursor-pointer border-t px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase transition-colors outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setView('years');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setView('years');
              }
            }}
          >
            Visual Grid
          </button>
        </SelectContent>
      </Select>
    </div>
  );
}

function SovereignChevron({
  orientation,
}: {
  readonly orientation?: 'left' | 'right' | 'up' | 'down';
}) {
  return orientation === 'left' ? (
    <ChevronLeftIcon className="size-4" />
  ) : (
    <ChevronRightIcon className="size-4" />
  );
}

function MonthPicker() {
  const { navDate, setNavDate, setView } = useCalendarContext();

  const handleMonthClick = (monthIndex: number) => {
    setNavDate(setMonth(navDate, monthIndex));
    setView('days');
  };

  return (
    <motion.div
      key="months"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-[280px]"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
          PILIH BULAN
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-royal hover:bg-blue-royal/5 h-7 px-2 text-xs font-black"
          onClick={() => setView('years')}
        >
          {navDate.getFullYear()} <ChevronRightIcon className="ml-1 size-3" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((m, i) => (
          <Button
            key={m}
            variant="ghost"
            className={cn(
              'h-12 rounded-xl text-[10px] font-black uppercase transition-all',
              navDate.getMonth() === i
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-50'
            )}
            onClick={() => handleMonthClick(i)}
          >
            {m.substring(0, 3)}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        className="mt-4 h-8 w-full text-[10px] font-black text-slate-400 uppercase"
        onClick={() => setView('days')}
      >
        KEMBALI KE KALENDER
      </Button>
    </motion.div>
  );
}

function YearPicker() {
  const { navDate, setNavDate, setView } = useCalendarContext();
  const startYear = Math.floor(navDate.getFullYear() / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  const handleYearClick = (year: number) => {
    setNavDate(setYear(navDate, year));
    setView('months');
  };

  return (
    <motion.div
      key="years"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-[280px]"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
          PILIH TAHUN
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-lg"
            onClick={() =>
              setNavDate(setYear(navDate, navDate.getFullYear() - 12))
            }
          >
            <ChevronLeftIcon className="size-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-lg"
            onClick={() =>
              setNavDate(setYear(navDate, navDate.getFullYear() + 12))
            }
          >
            <ChevronRightIcon className="size-3" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((y) => (
          <Button
            key={y}
            variant="ghost"
            className={cn(
              'h-12 rounded-xl text-[12px] font-black transition-all',
              navDate.getFullYear() === y
                ? 'bg-blue-royal text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-50'
            )}
            onClick={() => handleYearClick(y)}
          >
            {y}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        className="mt-4 h-8 w-full text-[10px] font-black text-slate-400 uppercase"
        onClick={() => setView('months')}
      >
        KEMBALI KE BULAN
      </Button>
    </motion.div>
  );
}

export { Calendar };
