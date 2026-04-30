'use client';

import { ArrowLeft, Calendar as CalendarIcon, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { UserNavDropdown } from '@/components/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoanAccountabilityView, useLoanReport } from '@/features/loans';

/**
 * Loans Report Page - Formal Accountability Statement 📜
 * Enhanced with monthly filtering and carry-over logic.
 */
export default function LoanReportPage() {
  const router = useRouter();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const { data: reportData, isLoading } = useLoanReport(month, year);

  const months = useMemo(
    () => [
      { value: 1, label: 'Januari' },
      { value: 2, label: 'Februari' },
      { value: 3, label: 'Maret' },
      { value: 4, label: 'April' },
      { value: 5, label: 'Mei' },
      { value: 6, label: 'Juni' },
      { value: 7, label: 'Juli' },
      { value: 8, label: 'Agustus' },
      { value: 9, label: 'September' },
      { value: 10, label: 'Oktober' },
      { value: 11, label: 'November' },
      { value: 12, label: 'Desember' },
    ],
    []
  );

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i),
    []
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-6 animate-pulse text-sm font-black tracking-widest text-slate-400 uppercase">
            Menghitung Amanah...
          </p>
        </div>
      );
    }

    if (reportData) {
      return <LoanAccountabilityView data={reportData} />;
    }

    return (
      <div className="py-24 text-center text-slate-400">
        Gagal memuat laporan.
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      {/* Navigation Header */}
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/loans')}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
          >
            <ArrowLeft className="size-5 text-slate-800" strokeWidth={3} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-slate-400" />
              <h2 className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                Audit Mode
              </h2>
            </div>
            <h1 className="text-xl font-black text-slate-800">
              Laporan Amanah Kita
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <div className="flex items-center gap-2 rounded-[24px] border border-slate-100 bg-white/50 p-2 shadow-inner backdrop-blur-sm">
            <CalendarIcon className="ml-2 size-4 text-slate-400" />
            <Select
              value={month.toString()}
              onValueChange={(val) => setMonth(Number.parseInt(val, 10))}
            >
              <SelectTrigger className="h-9 w-[130px] border-none bg-transparent text-[10px] font-black tracking-widest uppercase focus:ring-0">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {months.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value.toString()}
                    className="text-[10px] font-black uppercase"
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={year.toString()}
              onValueChange={(val) => setYear(Number.parseInt(val, 10))}
            >
              <SelectTrigger className="h-9 w-[100px] border-none bg-transparent text-[10px] font-black tracking-widest uppercase focus:ring-0">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {years.map((y) => (
                  <SelectItem
                    key={y}
                    value={y.toString()}
                    className="text-[10px] font-black uppercase"
                  >
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <UserNavDropdown />
        </div>
      </header>

      <main className="mx-auto max-w-5xl">
        <div className="glass-premium overflow-hidden rounded-[48px] border border-white/50 bg-white/40 p-6 shadow-2xl backdrop-blur-3xl md:p-12 lg:p-16">
          {renderContent()}
        </div>

        {/* Helper text for the user */}
        <div className="mt-8 px-6 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Sovereign Ledger Integrity System v7.1.18 🛡️
        </div>
      </main>
    </div>
  );
}
