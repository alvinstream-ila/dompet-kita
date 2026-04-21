import {
  Printer,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loan, Transaction } from '@/types';
import api from '@/lib/axios';

interface LoanReportData {
  period: {
    month: number;
    year: number;
    label: string;
  };
  summary: {
    opening_piutang: number;
    opening_hutang: number;
    opening_net: number;
    new_piutang: number;
    new_hutang: number;
    total_repayments: number;
  };
  activity: {
    new_loans: Loan[];
    transactions: Transaction[];
  };
  carry_over: {
    items: Loan[];
    total_piutang: number;
    total_hutang: number;
  };
}

interface LoanAccountabilityViewProps {
  data: LoanReportData;
}

export const LoanAccountabilityView: React.FC<LoanAccountabilityViewProps> = ({
  data,
}) => {
  const { period, summary, activity, carry_over } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const netClosing = carry_over.total_piutang - carry_over.total_hutang;
  const isBetterThanOpening = netClosing >= summary.opening_net;

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/loans/report', {
        params: {
          month: period.month,
          year: period.year,
          format: 'pdf',
        },
        responseType: 'blob',
      });

      const url = globalThis.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Laporan_Akuntabilitas_${period.year}_${period.month}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-12 print:p-0">
      {/* Formal Header Section */}
      <div className="flex flex-col items-center justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row print:border-slate-300">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="size-6 text-slate-800" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">
              Laporan Akuntabilitas Amanah Sayang
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-500">
            Periode Laporan:{' '}
            <span className="text-slate-900">{period.label}</span>
          </p>
          <p className="text-[10px] font-medium text-slate-400">
            Dihasilkan pada: {new Date().toLocaleString('id-ID')}
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 font-bold hover:bg-slate-50"
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Printer className="mr-2 size-4" />
            )}
            Cetak Laporan
          </Button>
        </div>
      </div>

      {/* Snapshot Summary Row */}
      <section>
        <h3 className="mb-6 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
          I. Ringkasan Posisi Amanah
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="rounded-[32px] border-slate-100 bg-slate-50/50 p-6 shadow-sm">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Saldo Awal (Bulan Lalu)
            </p>
            <p className="mt-2 text-xl font-black text-slate-600">
              {formatCurrency(summary.opening_net)}
            </p>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-[9px] font-bold text-slate-400">
              <span>Htg: {formatCurrency(summary.opening_hutang)}</span>
              <span className="text-slate-200">|</span>
              <span>Ptg: {formatCurrency(summary.opening_piutang)}</span>
            </div>
          </Card>

          <div className="flex flex-col items-center justify-center py-4">
            <ArrowRight className="size-6 rotate-90 text-slate-200 md:rotate-0" />
          </div>

          <Card className="rounded-[32px] border-slate-900 bg-slate-900 p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                Saldo Akhir (Berlanjut)
              </p>
              {isBetterThanOpening ? (
                <TrendingUp className="size-4 text-emerald-400" />
              ) : (
                <TrendingDown className="size-4 text-rose-400" />
              )}
            </div>
            <p className="mt-2 text-3xl font-black text-white">
              {formatCurrency(netClosing)}
            </p>
            <p
              className={cn(
                'mt-4 text-[9px] font-black tracking-widest uppercase',
                isBetterThanOpening ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {isBetterThanOpening ? 'Kondisi Membaik' : 'Kondisi Menurun'} ✨
            </p>
          </Card>
        </div>
      </section>

      {/* Monthly Activity Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
            II. Aktivitas Selama {period.label}
          </h3>
        </div>
        <Card className="overflow-hidden rounded-[32px] border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Kontak / Deskripsi
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Tipe Aktivitas
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Nilai Mutasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activity.new_loans.map((loan) => (
                <tr
                  key={`new-${loan.id}`}
                  className="group hover:bg-slate-50/30"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[8px] font-black text-blue-600 uppercase">
                        Baru
                      </span>
                      <p className="font-black text-slate-800">
                        {loan.contact_name}
                      </p>
                    </div>
                    <p className="font-serif text-[10px] font-medium text-slate-400 italic">
                      &quot;{loan.description}&quot;
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[9px] font-black uppercase',
                        loan.type === 'piutang'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      )}
                    >
                      {loan.type === 'piutang'
                        ? 'Memberi Pinjaman'
                        : 'Meminjam Uang'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-800">
                    {formatCurrency(loan.amount)}
                  </td>
                </tr>
              ))}
              {activity.transactions.map((tx) => (
                <tr key={`tx-${tx.id}`} className="group hover:bg-slate-50/30">
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800">
                      {tx.description}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      {new Date(tx.date).toLocaleDateString('id-ID')}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black text-slate-600 uppercase">
                      Bayar / Cicil
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-emerald-600">
                    - {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
              {activity.new_loans.length === 0 &&
                activity.transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-12 text-center text-xs font-medium text-slate-400 italic"
                    >
                      Tidak ada aktivitas pinjaman baru di bulan ini.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Carry-over Section (Detailed) */}
      <section className="print:break-before-page">
        <h3 className="mb-6 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
          III. Rincian Tanggungan Berlanjut (Masa Depan)
        </h3>
        <Card className="overflow-hidden rounded-[32px] border-slate-100 bg-white shadow-sm print:border-slate-300">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Kontak Person
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Status Amanah
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Sisa Kewajiban
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {carry_over.items.map((item) => (
                <tr
                  key={`carry-${item.id}`}
                  className="group hover:bg-slate-50/30"
                >
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800">
                      {item.contact_name}
                    </p>
                    {item.due_date && (
                      <p className="text-[10px] font-bold text-rose-400">
                        Jatuh Tempo:{' '}
                        {new Date(item.due_date).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[9px] font-black uppercase',
                        item.type === 'piutang'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      )}
                    >
                      {item.type === 'piutang'
                        ? 'Piutang (Kita Tagih)'
                        : 'Hutang (Kita Bayar)'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-800">
                    {formatCurrency(item.remaining_amount)}
                  </td>
                </tr>
              ))}
              {carry_over.items.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-xs font-bold tracking-widest text-emerald-500 uppercase"
                  >
                    ALHAMDULILLAH, TIDAK ADA TANGGUNGAN BERLANJUT! 🎉
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-black">
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-4 text-[10px] tracking-widest text-slate-500 uppercase"
                >
                  Total Amanah Neto
                </td>
                <td className="px-6 py-4 text-right text-lg text-slate-900">
                  {formatCurrency(
                    carry_over.total_piutang - carry_over.total_hutang
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>
      </section>

      {/* Signature Section */}
      <div className="mt-16 hidden grid-cols-2 gap-12 pt-12 text-center text-slate-400 print:grid">
        <div className="space-y-20">
          <p className="text-xs font-black tracking-widest text-slate-600 uppercase">
            Disusun Oleh
          </p>
          <div className="mx-auto w-48 border-t border-slate-300 pt-2">
            <p className="text-[10px] font-bold">Dompet Kita System v7.1.18</p>
          </div>
        </div>
        <div className="space-y-20">
          <p className="text-xs font-black tracking-widest text-slate-600 uppercase">
            Diketahui & Disetujui
          </p>
          <div className="mx-auto w-48 border-t border-slate-300 pt-2">
            <p className="text-[10px] font-bold">Pemilik Amanah</p>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-slate-950 p-8 text-center print:hidden">
        <p className="text-sm font-medium text-slate-400 italic">
          &quot;Menjaga setiap butir amanah adalah bentuk cinta kita pada masa
          depan. Semoga Allah memberkati ikhtiar kejujuran kita ya Sayang...
          ❤️&quot;
        </p>
      </div>
    </div>
  );
};
