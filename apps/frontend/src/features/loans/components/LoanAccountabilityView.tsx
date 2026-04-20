import { Printer, ShieldCheck } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loan } from '@/types';

interface LoanAccountabilityViewProps {
  loans: Loan[];
  isLoading?: boolean;
}

export const LoanAccountabilityView: React.FC<LoanAccountabilityViewProps> = ({
  loans,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPiutang = loans
    .filter((l) => l.type === 'piutang')
    .reduce((acc, l) => acc + l.amount, 0);
  const totalHutang = loans
    .filter((l) => l.type === 'utang')
    .reduce((acc, l) => acc + l.amount, 0);

  return (
    <div className="space-y-8 print:p-0">
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
            Dihasilkan pada:{' '}
            {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 font-bold hover:bg-slate-50"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 size-4" /> Cetak Laporan
          </Button>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-[24px] border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            Total Piutang (Keluar)
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {formatCurrency(totalPiutang)}
          </p>
        </Card>
        <Card className="rounded-[24px] border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            Total Hutang (Masuk)
          </p>
          <p className="mt-1 text-2xl font-black text-rose-600">
            {formatCurrency(totalHutang)}
          </p>
        </Card>
        <Card className="rounded-[24px] border-slate-900 bg-slate-900 p-6 shadow-xl md:col-span-2 lg:col-span-1">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase">
            Posisi Bersih Amanah
          </p>
          <p className="mt-1 text-2xl font-black text-white">
            {formatCurrency(totalPiutang - totalHutang)}
          </p>
        </Card>
      </div>

      {/* Main Data Table */}
      <Card className="overflow-hidden rounded-[32px] border-slate-100 bg-white shadow-sm print:border-slate-300 print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Kontak / Deskripsi
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Jatuh Tempo
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Total Nilai
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loans.map((loan) => (
                <tr
                  key={loan.id}
                  className="group transition-colors hover:bg-slate-50/30"
                >
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800">
                      {loan.contact_name}
                    </p>
                    <p className="text-xs font-medium text-slate-400 italic">
                      &quot;{loan.description}&quot;
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-[9px] font-black tracking-tighter uppercase',
                          loan.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {loan.status === 'paid'
                          ? 'Selesai Lunas'
                          : 'Masih Aktif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-600">
                      {loan.due_date
                        ? new Date(loan.due_date).toLocaleDateString('id-ID')
                        : 'Flexible'}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p
                      className={cn(
                        'font-black',
                        loan.type === 'piutang'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      )}
                    >
                      {loan.type === 'piutang' ? '+' : '-'}{' '}
                      {formatCurrency(loan.amount)}
                    </p>
                    {loan.status === 'active' &&
                      loan.remaining_amount !== loan.amount && (
                        <p className="text-[9px] font-bold text-slate-400">
                          Sisa: {formatCurrency(loan.remaining_amount)}
                        </p>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Signature Section - Only for Print/Formal Report */}
      <div className="mt-16 hidden grid-cols-2 gap-12 pt-12 text-center text-slate-400 print:grid">
        <div className="space-y-20">
          <p className="text-xs font-black tracking-widest text-slate-600 uppercase">
            Disusun Oleh
          </p>
          <div className="mx-auto w-40 border-t border-slate-300 pt-2">
            <p className="text-[10px] font-bold">Dompet Kita System</p>
          </div>
        </div>
        <div className="space-y-20">
          <p className="text-xs font-black tracking-widest text-slate-600 uppercase">
            Diketahui Oleh
          </p>
          <div className="mx-auto w-40 border-t border-slate-300 pt-2">
            <p className="text-[10px] font-bold">Pemilik Amanah</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 p-6 text-center print:hidden">
        <p className="text-xs font-bold text-amber-700 italic">
          &quot;Setiap amanah dan titipan adalah bagian dari perjalanan cinta
          kita. Semoga laporan ini membantu kita menjaga integritas dan rezeki
          berkah. Sayang... ❤️&quot;
        </p>
      </div>
    </div>
  );
};
