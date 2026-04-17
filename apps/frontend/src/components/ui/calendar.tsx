'use client';

import { format, setMonth, setYear } from 'date-fns';
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
  getDefaultClassNames,
  type DayPickerProps,
} from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
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
        className={cn('bg-background relative overflow-hidden p-3', className)}
      >
        <AnimatePresence mode="wait">
          {view === 'days' && (
            <motion.div
              key="days"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
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
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4', defaultClassNames.months),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between z-20',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'size-8 p-0 border-slate-100 hover:bg-slate-50 rounded-lg',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'size-8 p-0 border-slate-100 hover:bg-slate-50 rounded-lg',
          defaultClassNames.button_next
        ),
        month_caption: 'flex justify-center mb-4 pt-1',
        caption_label: 'hidden',
        table: 'w-full border-collapse',
        weekdays: 'flex mb-2',
        weekday:
          'flex-1 text-[10px] font-black text-slate-400 uppercase text-center',
        week: 'flex w-full mt-1',
        day: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
          defaultClassNames.day
        ),
        today: 'bg-slate-100/50 text-slate-900 font-bold rounded-lg',
        outside: 'text-slate-300 opacity-50',
        selected:
          'bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white rounded-lg',
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
  const { navDate, setView } = useCalendarContext();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="group/jump flex h-8 items-center gap-2 rounded-xl px-3 hover:bg-slate-100"
      onClick={() => setView('months')}
    >
      <span className="text-sm font-black tracking-tight text-slate-800">
        {format(navDate, 'MMMM yyyy', { locale: id })}
      </span>
      <ChevronDownIcon className="size-3.5 text-slate-300 transition-transform group-hover/jump:translate-y-0.5" />
    </Button>
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
