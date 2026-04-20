'use client';

import { ArrowLeft, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { UserNavDropdown } from '@/components/layout';
import { PageLoader } from '@/components/ui/PageLoader';
import { LoanAccountabilityView, useLoans } from '@/features/loans';

/**
 * Loans Report Page - Formal Accountability Statement 📜
 * Designed for "Physical Reporting" and transparency.
 */
export default function LoanReportPage() {
  const router = useRouter();
  const { data: loans = [], isLoading } = useLoans();

  if (isLoading) {
    return (
      <PageLoader
        isLoading={true}
        message="Menyiapkan Berkas Akuntabilitas Amanah... ⚖️"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      {/* Navigation Header */}
      <header className="mb-12 flex items-center justify-between">
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
        <UserNavDropdown />
      </header>

      <main className="mx-auto max-w-5xl">
        <div className="glass-premium overflow-hidden rounded-[48px] border border-white/50 bg-white/40 p-6 shadow-2xl backdrop-blur-3xl md:p-12 lg:p-16">
          <LoanAccountabilityView loans={loans} />
        </div>

        {/* Helper text for the user */}
        <div className="mt-8 px-6 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Sovereign Ledger Integrity System v7.1.18 🛡️
        </div>
      </main>
    </div>
  );
}
